import { Vector3 } from "three";

const DEG = Math.PI / 180;

/** Lat/lng in degrees to a point on a sphere. lng 0 faces +z. */
export function toVec3(lat: number, lng: number, radius = 1, out = new Vector3()) {
  const phi = lat * DEG;
  const theta = lng * DEG;
  return out.set(
    radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(theta),
  );
}

/** Spherical interpolation between two unit vectors. */
export function slerp(a: Vector3, b: Vector3, t: number, out = new Vector3()) {
  const angle = a.angleTo(b);
  if (angle < 1e-6) return out.copy(a);
  const s = Math.sin(angle);
  const wa = Math.sin((1 - t) * angle) / s;
  const wb = Math.sin(t * angle) / s;
  return out.set(
    a.x * wa + b.x * wb,
    a.y * wa + b.y * wb,
    a.z * wa + b.z * wb,
  );
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Eases a 0..1 hop with flat ends, so the camera holds on each stop while its
 * card is centered and only travels in the middle of the scroll between cards.
 */
export function hopEase(t: number, hold = 0.2) {
  const x = clamp01((t - hold) / (1 - 2 * hold));
  return x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
}

/* ---------- Terrain data ---------- */

export const EARTH_RADIUS_M = 6_371_000;
/** Max elevation encoded in the elevation textures (255 = this many metres). */
export const ELEVATION_MAX_M = 6400;
/**
 * Relief pixels brighter than this are land. scripts/generate-globe-data.mjs
 * writes water as black and keeps all land at or above 0.3.
 */
export const LAND_CUTOFF = 0.15 * 255;

export type Bounds = { west: number; south: number; east: number; north: number };
export type Region = Bounds & { id: string; stops: string[] };
export type GlobeManifest = {
  regions: Region[];
  stopElevation: Record<string, number>;
};

export const WORLD: Bounds = { west: -180, south: -90, east: 180, north: 90 };

/** Loads an image and reads back its pixels (red channel used as greyscale). */
export async function loadPixels(url: string) {
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { image, data, width: canvas.width, height: canvas.height };
}

export type Particles = {
  /** [lng, lat] in degrees per particle. */
  lngLat: Float32Array;
  /** Two independent 0..1 randoms per particle: shading/size, and fade order. */
  rand: Float32Array;
  count: number;
};

const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Scatters particles over the land pixels of a relief image covering
 * `bounds`, about `spacingKm` apart. Each land pixel gets particles in
 * proportion to its true area, jittered slightly past its edges so coasts
 * come out fuzzy. The result is shuffled, so drawing any prefix of it gives
 * an even thinning of the whole set (used for the performance tiers).
 * Works in row chunks and yields between them to keep scrolling smooth.
 */
export async function scatterLand(
  relief: { data: Uint8ClampedArray; width: number; height: number },
  bounds: Bounds,
  spacingKm: number,
): Promise<Particles> {
  const { data, width, height } = relief;
  const dLng = (bounds.east - bounds.west) / width;
  const dLat = (bounds.north - bounds.south) / height;
  const kmPerDeg = (EARTH_RADIUS_M / 1000) * DEG;
  const perKm2 = 1 / (spacingKm * spacingKm);

  // Expected particle count, to size the buffers.
  let landPixels = 0;
  let expected = 0;
  for (let y = 0; y < height; y++) {
    const lat = bounds.north - (y + 0.5) * dLat;
    const pxKm2 = dLng * kmPerDeg * Math.cos(lat * DEG) * dLat * kmPerDeg;
    let rowLand = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4] > LAND_CUTOFF) rowLand++;
    }
    landPixels += rowLand;
    expected += rowLand * pxKm2 * perKm2;
  }
  const capacity = Math.ceil(expected * 1.05 + landPixels * 0.02 + 64);
  const lngLat = new Float32Array(capacity * 2);
  const rand = new Float32Array(capacity * 2);

  let n = 0;
  for (let y = 0; y < height; y++) {
    if (y % 64 === 0) await yieldToMain();
    const lat = bounds.north - (y + 0.5) * dLat;
    const perPixel = dLng * kmPerDeg * Math.cos(lat * DEG) * dLat * kmPerDeg * perKm2;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4] <= LAND_CUTOFF) continue;
      let k = Math.floor(perPixel + Math.random());
      while (k-- > 0 && n < capacity) {
        // Jitter up to a third of a pixel past each edge for fuzzy coasts.
        lngLat[n * 2] = bounds.west + (x - 0.33 + Math.random() * 1.66) * dLng;
        lngLat[n * 2 + 1] = bounds.north - (y - 0.33 + Math.random() * 1.66) * dLat;
        rand[n * 2] = Math.random();
        rand[n * 2 + 1] = Math.random();
        n++;
      }
    }
  }

  // Fisher-Yates shuffle so any prefix is an even sample.
  for (let i = n - 1; i > 0; i--) {
    if (i % 200_000 === 0) await yieldToMain();
    const j = Math.floor(Math.random() * (i + 1));
    for (const [arr, stride] of [[lngLat, 2], [rand, 2]] as const) {
      for (let s = 0; s < stride; s++) {
        const t = arr[i * stride + s];
        arr[i * stride + s] = arr[j * stride + s];
        arr[j * stride + s] = t;
      }
    }
  }

  return { lngLat: lngLat.subarray(0, n * 2), rand: rand.subarray(0, n * 2), count: n };
}

/** Angular distance in degrees between two lat/lng points. */
export function angularDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const cos =
    Math.sin(a.lat * DEG) * Math.sin(b.lat * DEG) +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.cos((b.lng - a.lng) * DEG);
  return Math.acos(Math.min(1, Math.max(-1, cos))) / DEG;
}
