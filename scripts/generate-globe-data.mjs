// Builds the journey globe's data into public/globe/ from two public-domain
// rasters (21600x10800, 60 px per degree):
//
//   Relief: Natural Earth "Gray Earth with Shaded Relief, Hypsography, Ocean
//   Bottom, and Drainages"
//     https://naciscdn.org/naturalearth/10m/raster/GRAY_HR_SR_OB_DR.zip
//   Elevation: NASA Visible Earth topography (0 = sea level, 255 ≈ 6400 m)
//     https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73934/gebco_08_rev_elev_21600x10800.png
//
// Land is decided by vectors, not by relief brightness (shadowed mountain
// slopes are as dark as water): Natural Earth 10m land (world-atlas) minus
// 10m lakes, with 10m rivers cut in as thin gaps. Lakes and rivers are
// fetched from the Natural Earth GeoJSON mirror at run time.
//
// Outputs:
//   relief.webp, elevation.webp   global 4096x2048 textures
//   regions/<id>-relief.webp      full-resolution tiles around each cluster
//   regions/<id>-elevation.webp   of journey stops, for the close-up patches
//   manifest.json                 region bounds and each stop's elevation
//
// In the relief output, water is black and land never drops below
// LAND_FLOOR; the client treats anything brighter than LAND_CUTOFF in
// src/lib/globe.ts as land, so the two must stay in step.
//
// Run after changing src/data/journey.ts:
//   node scripts/generate-globe-data.mjs <GRAY_HR_SR_OB_DR.tif> <gebco_08_rev_elev_21600x10800.png>

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoArea, geoEquirectangular, geoPath } from "d3-geo";
import sharp from "sharp";
import { feature } from "topojson-client";
import { journey } from "../src/data/journey.ts";

const [reliefSrc, elevationSrc] = process.argv.slice(2);
if (!reliefSrc || !elevationSrc) {
  console.error(
    "Usage: node scripts/generate-globe-data.mjs <GRAY_HR_SR_OB_DR.tif> <gebco_08_rev_elev_21600x10800.png>",
  );
  process.exit(1);
}

const OUT = "public/globe";
const PPD = 60; // source pixels per degree
const GLOBAL_WIDTH = 4096;
const CLUSTER_KM = 700; // stops closer than this share a region
const MARGIN_DEG = 6; // region padding around its stops, in latitude degrees
const EARTH_KM = 6371;
const WORLD = { west: -180, south: -90, east: 180, north: 90 };

sharp.cache(false);
const open = (src) => sharp(src, { limitInputPixels: false });

/* ---------- Land mask ---------- */

const NE_GEOJSON =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
};
const require = createRequire(import.meta.url);
const landTopo = JSON.parse(
  readFileSync(require.resolve("world-atlas/land-10m.json"), "utf8"),
);

// d3-geo reads polygon winding on the sphere: a ring wound the "wrong" way
// means everything except that shape. world-atlas land-10m comes out that
// way, so flip any polygon that claims more than half the sphere.
function rewind(geojson) {
  const fixPolygon = (rings) => {
    const area = geoArea({ type: "Polygon", coordinates: rings });
    return area > 2 * Math.PI ? rings.map((r) => [...r].reverse()) : rings;
  };
  const fixGeometry = (g) =>
    g.type === "Polygon"
      ? { ...g, coordinates: fixPolygon(g.coordinates) }
      : g.type === "MultiPolygon"
        ? { ...g, coordinates: g.coordinates.map(fixPolygon) }
        : g;
  return {
    ...geojson,
    features: geojson.features.map((f) => ({ ...f, geometry: fixGeometry(f.geometry) })),
  };
}

const land = rewind(feature(landTopo, landTopo.objects.land));
const [lakes, rivers] = await Promise.all([
  fetchJson(`${NE_GEOJSON}/ne_10m_lakes.geojson`).then(rewind),
  fetchJson(`${NE_GEOJSON}/ne_10m_rivers_lake_centerlines.geojson`),
]);
console.log(
  `land ${(geoArea(land) / (4 * Math.PI) * 100).toFixed(1)}% of the sphere, ` +
    `lakes ${(geoArea(lakes) / (4 * Math.PI) * 100).toFixed(2)}%`,
);

/**
 * Rasterises the land mask for `bounds` at `ppd` pixels per degree: white
 * land, black lakes and rivers. Rivers are stroked `riverPx` wide.
 */
async function landMask(bounds, width, height, riverPx) {
  const ppd = width / (bounds.east - bounds.west);
  const scale = (ppd * 180) / Math.PI;
  const projection = geoEquirectangular()
    .scale(scale)
    .translate([-bounds.west * ppd, bounds.north * ppd])
    .clipExtent([
      [-2, -2],
      [width + 2, height + 2],
    ]);
  const path = geoPath(projection);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#000"/>
    <path d="${path(land) ?? ""}" fill="#fff"/>
    <path d="${path(lakes) ?? ""}" fill="#000"/>
    <path d="${path(rivers) ?? ""}" fill="none" stroke="#000" stroke-width="${riverPx}"/>
  </svg>`;
  const { data } = await sharp(Buffer.from(svg), { limitInputPixels: false })
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

/* ---------- Relief tone ---------- */

// Land keeps its full hillshade, including dark shadowed slopes, above
// LAND_FLOOR; water is black. The source runs ~60 (deep shadow) to ~240.
const LAND_FLOOR = 0.3;
const tone = (v) =>
  Math.round(255 * (LAND_FLOOR + Math.min(1, Math.max(0, (v - 60) / 180)) * (0.97 - LAND_FLOOR)));

const relief = await open(reliefSrc)
  .extractChannel(0)
  .raw()
  .toBuffer({ resolveWithObject: true });
const reliefImage = () =>
  sharp(relief.data, {
    raw: { width: relief.info.width, height: relief.info.height, channels: 1 },
    limitInputPixels: false,
  });

/** Relief for `bounds`, resized to width x height, masked to land and toned. */
async function tonedRelief(bounds, extract, width, height, riverPx) {
  let img = reliefImage();
  if (extract) img = img.extract(extract);
  const { data } = await img
    .resize(width, height, { kernel: "lanczos3" })
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask = await landMask(bounds, width, height, riverPx);
  const out = Buffer.alloc(width * height);
  for (let i = 0; i < out.length; i++) out[i] = mask[i] > 127 ? tone(data[i]) : 0;
  return sharp(out, { raw: { width, height, channels: 1 } });
}

const elevation = await open(elevationSrc)
  .extractChannel(0)
  .raw()
  .toBuffer({ resolveWithObject: true });
const elevationAt = (lat, lng) => {
  const x = Math.min(elevation.info.width - 1, Math.floor((lng + 180) * PPD));
  const y = Math.min(elevation.info.height - 1, Math.floor((90 - lat) * PPD));
  return Math.round((elevation.data[y * elevation.info.width + x] / 255) * 6400);
};
const elevationImage = () =>
  sharp(elevation.data, {
    raw: { width: elevation.info.width, height: elevation.info.height, channels: 1 },
    limitInputPixels: false,
  });

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/regions`, { recursive: true });

/* ---------- Global textures ---------- */

const webp = { quality: 82, effort: 6 };
await (await tonedRelief(WORLD, null, GLOBAL_WIDTH, GLOBAL_WIDTH / 2, 0.6))
  .webp(webp)
  .toFile(`${OUT}/relief.webp`);
await elevationImage()
  .resize(GLOBAL_WIDTH, GLOBAL_WIDTH / 2, { kernel: "lanczos3" })
  .webp(webp)
  .toFile(`${OUT}/elevation.webp`);

/* ---------- Regions ---------- */

const rad = Math.PI / 180;
const km = (a, b) => {
  const cos =
    Math.sin(a.lat * rad) * Math.sin(b.lat * rad) +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((b.lng - a.lng) * rad);
  return Math.acos(Math.min(1, Math.max(-1, cos))) * EARTH_KM;
};

// Greedy clustering in journey order: a stop joins the first cluster whose
// centre is within CLUSTER_KM, otherwise it starts a new one.
const clusters = [];
for (const stop of journey) {
  const hit = clusters.find((c) => km(c.center, stop) < CLUSTER_KM);
  if (hit) {
    hit.stops.push(stop);
    const n = hit.stops.length;
    hit.center = {
      lat: hit.stops.reduce((s, x) => s + x.lat, 0) / n,
      lng: hit.stops.reduce((s, x) => s + x.lng, 0) / n,
    };
  } else {
    clusters.push({ stops: [stop], center: { lat: stop.lat, lng: stop.lng } });
  }
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const regions = [];
for (const c of clusters) {
  const lats = c.stops.map((s) => s.lat);
  const lngs = c.stops.map((s) => s.lng);
  const lngMargin = MARGIN_DEG / Math.cos(c.center.lat * rad);
  // Snap to whole source pixels so tiles line up exactly with their bounds.
  const snap = (v, f) => f(v * PPD) / PPD;
  const bounds = {
    west: snap(Math.max(-180, Math.min(...lngs) - lngMargin), Math.floor),
    south: snap(Math.max(-90, Math.min(...lats) - MARGIN_DEG), Math.floor),
    east: snap(Math.min(180, Math.max(...lngs) + lngMargin), Math.ceil),
    north: snap(Math.min(90, Math.max(...lats) + MARGIN_DEG), Math.ceil),
  };
  const id = slug(c.stops[0].place);
  const extract = {
    left: Math.round((bounds.west + 180) * PPD),
    top: Math.round((90 - bounds.north) * PPD),
    width: Math.round((bounds.east - bounds.west) * PPD),
    height: Math.round((bounds.north - bounds.south) * PPD),
  };
  await (await tonedRelief(bounds, extract, extract.width, extract.height, 1.2))
    .webp(webp)
    .toFile(`${OUT}/regions/${id}-relief.webp`);
  await elevationImage()
    .extract(extract)
    .webp(webp)
    .toFile(`${OUT}/regions/${id}-elevation.webp`);
  regions.push({ id, ...bounds, stops: c.stops.map((s) => s.id) });
  console.log(`region ${id}: ${extract.width}x${extract.height}px, ${c.stops.length} stops`);
}

/* ---------- Manifest ---------- */

const stopElevation = Object.fromEntries(
  journey.map((s) => [s.id, elevationAt(s.lat, s.lng)]),
);
writeFileSync(
  `${OUT}/manifest.json`,
  JSON.stringify({ regions, stopElevation }, null, 2) + "\n",
);
console.log(`wrote ${OUT}/ (${regions.length} regions)`);
