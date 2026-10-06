"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineDashedMaterial,
  LinearFilter,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector3,
  Vector4,
  type PerspectiveCamera,
} from "three";
import type { JourneyStop } from "@/data";
import {
  EARTH_RADIUS_M,
  ELEVATION_MAX_M,
  WORLD,
  angularDistance,
  hopEase,
  loadPixels,
  scatterLand,
  slerp,
  toVec3,
  type Bounds,
  type GlobeManifest,
  type Particles,
  type Region,
} from "@/lib/globe";

const FOV = 40;
const WIDE = 3.4; // camera distance (globe radius = 1) for the intro shot
const CLOSE = 1.2; // camera distance while holding on a stop
const MAX_TILT = 0.95; // radians; tilts close shots so the horizon shows
const ARC_SEGMENTS = 96;

// Terrain relief. Elevation is exaggerated so it reads at globe scale, and
// eased down in close-ups so regions don't look stretched.
const EXAGGERATION_WIDE = 25;
const EXAGGERATION_CLOSE = 15;
const COAST_STEP = 0.002; // land sits this far above the ocean (radius units)
const FUZZ = 0.0012; // random height spread that gives the land volume
const SLOPE_BOOST = 2; // extra steepness for lighting only, so relief reads

// View-space light from the upper left, so the lit side always faces the
// reader whichever way the camera turns.
const LIGHT = new Vector3(-0.55, 0.6, 0.6).normalize();

// Particle spacing per device tier. "high" is ~1.5M global particles plus
// ~300k per region patch; "low" is roughly a third of that.
const TIERS = {
  high: { globalKm: 10, patchKm: 2 },
  low: { globalKm: 18, patchKm: 3.2 },
} as const;
type Tier = keyof typeof TIERS;
// If frames drop, draw a shuffled prefix of the particles: these fractions.
const DENSITY_STEPS = [1, 0.6, 0.35];

type Props = {
  stops: JourneyStop[];
  /** Scroll position in stops: 0 = first stop centered, -1 = intro. */
  getProgress: () => number;
  reducedMotion: boolean;
};

/** Per-frame state shared between the camera, terrain layers and pins. */
type View = {
  lat: number;
  lng: number;
  /** 0 in the wide intro shot, 1 when holding on a stop. */
  closeness: number;
  exaggeration: number;
  /** Camera distance to the point it looks at; scales the distance haze. */
  altitude: number;
  density: number;
  /** The region patch currently fading in; the global layer hides under it. */
  hole: Vector4;
  holeFade: number;
};

export default function JourneyGlobe(props: Props) {
  return (
    <Canvas
      camera={{ fov: FOV, near: 0.005, far: 20, position: [0, 0, WIDE] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene {...props} />
    </Canvas>
  );
}

function Scene({ stops, getProgress, reducedMotion }: Props) {
  const [manifest, setManifest] = useState<GlobeManifest | null>(null);
  const [tier] = useState<Tier>(() =>
    window.matchMedia("(min-width: 768px)").matches &&
    (navigator.hardwareConcurrency ?? 4) >= 8
      ? "high"
      : "low",
  );
  const view = useMemo<View>(
    () => ({
      lat: 0,
      lng: 0,
      closeness: 0,
      exaggeration: EXAGGERATION_WIDE / EARTH_RADIUS_M,
      altitude: WIDE - 1,
      density: 1,
      hole: new Vector4(),
      holeFade: 0,
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/globe/manifest.json")
      .then((r) => r.json() as Promise<GlobeManifest>)
      .then((m) => !cancelled && setManifest(m))
      .catch(() => {
        // No manifest: no region patches, pins sit at sea level.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirs = useMemo(
    () => stops.map((s) => toVec3(s.lat, s.lng)),
    [stops],
  );
  // Pins and arcs sit on the terrain at its widest exaggeration; when the
  // relief eases down in close-ups they float a hair above it.
  const surface = useMemo(
    () =>
      stops.map(
        (s) =>
          1 +
          COAST_STEP +
          FUZZ / 2 +
          ((manifest?.stopElevation[s.id] ?? 0) * EXAGGERATION_WIDE) / EARTH_RADIUS_M,
      ),
    [stops, manifest],
  );

  return (
    <>
      <CameraRig stops={stops} dirs={dirs} getProgress={getProgress} view={view} />
      <PerformanceGovernor view={view} />
      <Ocean />
      <Atmosphere />
      <GlobalTerrain tier={tier} view={view} />
      {manifest && <RegionPatches regions={manifest.regions} tier={tier} view={view} />}
      <Arcs dirs={dirs} surface={surface} getProgress={getProgress} />
      <Pins
        dirs={dirs}
        surface={surface}
        getProgress={getProgress}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

/* ---------- Camera ---------- */

function CameraRig({
  stops,
  dirs,
  getProgress,
  view,
}: {
  stops: JourneyStop[];
  dirs: Vector3[];
  getProgress: () => number;
  view: View;
}) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const tmp = useMemo(
    () => ({ dir: new Vector3(), south: new Vector3() }),
    [],
  );

  useFrame(() => {
    const last = stops.length - 1;
    const p = Math.min(Math.max(getProgress(), -1), last);
    let lat: number;
    let lng: number;
    let dist: number;

    // The camera path interpolates lat/lng rather than following the great
    // circle, so north stays up. Great circles between Ontario and Asia pass
    // near the pole, where a north-up camera would roll sideways.
    if (p < 0) {
      // Intro: start 50° east of the first stop so the globe turns into place.
      const e = hopEase(p + 1, 0.1);
      lat = stops[0].lat;
      lng = stops[0].lng + 50 * (1 - e);
      dist = WIDE + (CLOSE - WIDE) * e;
    } else {
      const i = Math.min(Math.floor(p), Math.max(last - 1, 0));
      const e = last === 0 ? 0 : hopEase(p - i);
      const a = stops[i];
      const b = stops[Math.min(i + 1, last)];
      const dLng = ((((b.lng - a.lng) % 360) + 540) % 360) - 180; // shortest way round
      lat = a.lat + (b.lat - a.lat) * e;
      lng = a.lng + dLng * e;
      // Pull out mid-flight in proportion to the hop, so long hops show the
      // whole globe and short Ontario hops barely lift.
      const angle = dirs[i].angleTo(dirs[Math.min(i + 1, last)]);
      dist = CLOSE + Math.sin(Math.PI * e) * Math.min(2.2, angle * 1.6);
    }
    toVec3(lat, lng, 1, tmp.dir);

    // Tilt toward the horizon when close: offset the camera south of the
    // stop along the surface tangent and look at the stop.
    const closeness = Math.min(1, Math.max(0, (WIDE - dist) / (WIDE - CLOSE)));
    const tilt = MAX_TILT * closeness;
    const alt = dist - 1;
    tmp.south.set(0, -1, 0).addScaledVector(tmp.dir, tmp.dir.y).normalize();
    camera.position
      .copy(tmp.dir)
      .multiplyScalar(1 + alt * Math.cos(tilt))
      .addScaledVector(tmp.south, alt * Math.sin(tilt));
    camera.lookAt(tmp.dir);

    view.lat = lat;
    view.lng = ((lng + 540) % 360) - 180;
    view.closeness = closeness;
    view.altitude = alt;
    view.exaggeration =
      (EXAGGERATION_WIDE + (EXAGGERATION_CLOSE - EXAGGERATION_WIDE) * closeness) /
      EARTH_RADIUS_M;
  });

  return null;
}

/* ---------- Performance ---------- */

/**
 * Watches frame times once the terrain is drawing and thins the particles a
 * step at a time if the device can't keep up (below ~38 fps on average).
 */
function PerformanceGovernor({ view }: { view: View }) {
  const state = useRef({ frames: 0, total: 0, step: 0 });

  useFrame((_, delta) => {
    const s = state.current;
    if (s.step >= DENSITY_STEPS.length - 1) return;
    // Skip outliers like returning to a hidden tab or a texture upload.
    if (delta > 0.25) return;
    s.frames++;
    if (s.frames <= 90) return; // warm-up while data loads
    s.total += delta;
    if (s.frames < 90 + 120) return;
    if (s.total / 120 > 1 / 38) {
      s.step++;
      view.density = DENSITY_STEPS[s.step];
    }
    s.frames = 90;
    s.total = 0;
  });

  return null;
}

/* ---------- Ocean and atmosphere ---------- */

function Ocean() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uLight: { value: LIGHT } },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uLight;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec3 n = normalize(vNormal);
            float diffuse = max(dot(n, uLight), 0.0);
            vec3 color = vec3(0.025 + 0.035 * diffuse);
            // Atmospheric haze toward the limb.
            float fresnel = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 2.5);
            color = mix(color, vec3(0.55), fresnel * 0.45);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[1, 128, 96]} />
    </mesh>
  );
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.0);
            gl_FragColor = vec4(vec3(1.0), rim * 0.16);
          }
        `,
        side: BackSide,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[1.045, 64, 48]} />
    </mesh>
  );
}

/* ---------- Terrain particles ---------- */

// One shader for the global layer and the region patches. Each particle is
// a lng/lat; the vertex shader looks up its relief (brightness, with the
// baked hillshade and river gaps) and elevation (height) from textures
// covering uBounds, lifts it off the sphere, and lights it.
const terrainVertex = /* glsl */ `
  attribute vec2 aLngLat;
  attribute vec2 aRand;
  uniform sampler2D uRelief;
  uniform sampler2D uElevation;
  uniform vec4 uBounds;    // west, south, east, north (degrees)
  uniform float uExaggeration;
  uniform float uSize;     // world-space diameter
  uniform float uSizeMul;  // grows particles when the density is thinned
  uniform float uScale;    // pixels per world unit at distance 1
  uniform float uMaxPx;
  uniform float uFade;     // patch: share of particles shown
  uniform vec4 uHole;      // global: bounds of the patch fading in
  uniform float uHoleFade;
  uniform vec3 uLight;
  uniform vec2 uTexel;     // size of one elevation texel in uv
  uniform float uAltitude;
  varying float vShade;

  const float DEG = 0.017453292519943295;

  // 0 on the edge of the bounds, 1 from two degrees inside, so patches and
  // the global layer cross-fade instead of meeting at a hard seam.
  float edgeWeight(vec4 b, vec2 p) {
    float d = min(min(p.x - b.x, b.z - p.x), min(p.y - b.y, b.w - p.y));
    return smoothstep(0.0, 2.0, d);
  }

  void main() {
  #ifdef PATCH
    bool hidden = aRand.y >= uFade * edgeWeight(uBounds, aLngLat);
  #else
    bool hidden = aRand.y < uHoleFade * edgeWeight(uHole, aLngLat);
  #endif
    if (hidden) {
      gl_PointSize = 0.0;
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }

    vec2 uv = (aLngLat - uBounds.xy) / (uBounds.zw - uBounds.xy);
    float relief = texture2D(uRelief, uv).r;
    float elevation = texture2D(uElevation, uv).r * ${ELEVATION_MAX_M.toFixed(1)};

    float lat = aLngLat.y * DEG;
    float lng = aLngLat.x * DEG;
    vec3 dir = vec3(cos(lat) * sin(lng), sin(lat), cos(lat) * cos(lng));
    float r = 1.0 + ${COAST_STEP} + elevation * uExaggeration + (aRand.x - 0.5) * ${FUZZ};
    vec4 mv = modelViewMatrix * vec4(dir * r, 1.0);

    // Terrain normal from the elevation gradient, so slopes catch or turn
    // away from the light at the current exaggeration.
    float eE = texture2D(uElevation, uv + vec2(uTexel.x, 0.0)).r;
    float eW = texture2D(uElevation, uv - vec2(uTexel.x, 0.0)).r;
    float eN = texture2D(uElevation, uv + vec2(0.0, uTexel.y)).r;
    float eS = texture2D(uElevation, uv - vec2(0.0, uTexel.y)).r;
    vec2 spanRad = uTexel * (uBounds.zw - uBounds.xy) * DEG * 2.0;
    float slopeScale = ${ELEVATION_MAX_M.toFixed(1)} * uExaggeration * ${SLOPE_BOOST.toFixed(1)};
    float gx = (eE - eW) * slopeScale / max(spanRad.x * cos(lat), 1e-5);
    float gy = (eN - eS) * slopeScale / spanRad.y;
    vec3 east = vec3(cos(lng), 0.0, -sin(lng));
    vec3 north = vec3(-sin(lat) * sin(lng), cos(lat), -sin(lat) * cos(lng));
    vec3 n = normalize(normalMatrix * normalize(dir - east * gx - north * gy));
    vec3 sphereN = normalize(normalMatrix * dir);

    float facing = dot(sphereN, normalize(-mv.xyz));
    float diffuse = max(dot(n, uLight), 0.0);
    float shade = relief * (0.34 + 0.6 * diffuse) * (0.92 + 0.16 * aRand.x);
    // Haze with distance (relative to how far the camera is from what it's
    // looking at) and toward the limb, so far terrain recedes.
    float dist = -mv.z;
    float haze = smoothstep(uAltitude * 1.1, uAltitude * 4.0, dist) * 0.55;
    float fresnel = pow(1.0 - max(facing, 0.0), 2.5) * 0.45;
    vShade = mix(shade, 0.42, max(haze, fresnel));

    float px = uSize * uSizeMul * uScale / -mv.z * (0.75 + 0.5 * aRand.x);
    gl_PointSize = clamp(px, 1.0, uMaxPx);
    gl_Position = projectionMatrix * mv;
  }
`;

const terrainFragment = /* glsl */ `
  varying float vShade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(vec3(vShade), 1.0);
  }
`;

type TerrainData = {
  particles: Particles;
  relief: Texture;
  elevation: Texture;
  bounds: Bounds;
  spacingKm: number;
};

async function loadTerrain(
  reliefUrl: string,
  elevationUrl: string,
  bounds: Bounds,
  spacingKm: number,
): Promise<TerrainData> {
  const prepare = (t: Texture) => {
    // Sampled in the vertex shader, which only reads the top mip level.
    t.generateMipmaps = false;
    t.minFilter = LinearFilter;
    t.needsUpdate = true;
    return t;
  };
  const [pixels, elevation] = await Promise.all([
    loadPixels(reliefUrl),
    new TextureLoader().loadAsync(elevationUrl),
  ]);
  const particles = await scatterLand(pixels, bounds, spacingKm);
  return {
    particles,
    relief: prepare(new Texture(pixels.image)),
    elevation: prepare(elevation),
    bounds,
    spacingKm,
  };
}

/** Builds the particle geometry and material for one terrain layer. */
function useTerrainLayer(data: TerrainData | null, patch: boolean) {
  const dpr = useThree((s) => s.viewport.dpr);
  const height = useThree((s) => s.size.height);

  const layer = useMemo(() => {
    if (!data) return null;
    const { particles, relief, elevation, bounds, spacingKm } = data;
    const geometry = new BufferGeometry();
    geometry.setAttribute("aLngLat", new Float32BufferAttribute(particles.lngLat, 2));
    geometry.setAttribute("aRand", new Float32BufferAttribute(particles.rand, 2));
    geometry.setDrawRange(0, particles.count);
    const material = new ShaderMaterial({
      uniforms: {
        uRelief: { value: relief },
        uElevation: { value: elevation },
        uBounds: {
          value: new Vector4(bounds.west, bounds.south, bounds.east, bounds.north),
        },
        uExaggeration: { value: 0 },
        // About the spacing: dense, but with small gaps that read as grain.
        uSize: { value: (spacingKm / (EARTH_RADIUS_M / 1000)) * 1.05 },
        uSizeMul: { value: 1 },
        uScale: { value: 1 },
        uMaxPx: { value: 8 },
        uFade: { value: patch ? 0 : 1 },
        uHole: { value: new Vector4() },
        uHoleFade: { value: 0 },
        uLight: { value: LIGHT },
        uTexel: {
          value: [
            1 / (elevation.image as HTMLImageElement).width,
            1 / (elevation.image as HTMLImageElement).height,
          ],
        },
        uAltitude: { value: 1 },
      },
      defines: patch ? { PATCH: "" } : {},
      vertexShader: terrainVertex,
      fragmentShader: terrainFragment,
    });
    return { geometry, material, count: particles.count };
  }, [data, patch]);

  useEffect(() => {
    if (!layer) return;
    layer.material.uniforms.uScale.value =
      (height * dpr) / (2 * Math.tan((FOV * Math.PI) / 360));
    layer.material.uniforms.uMaxPx.value = (patch ? 10 : 6) * dpr;
  }, [layer, height, dpr, patch]);

  useEffect(
    () => () => {
      layer?.geometry.dispose();
      layer?.material.dispose();
    },
    [layer],
  );
  useEffect(
    () => () => {
      data?.relief.dispose();
      data?.elevation.dispose();
    },
    [data],
  );

  return layer;
}

function GlobalTerrain({ tier, view }: { tier: Tier; view: View }) {
  const [data, setData] = useState<TerrainData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTerrain("/globe/relief.webp", "/globe/elevation.webp", WORLD, TIERS[tier].globalKm)
      .then((d) => !cancelled && setData(d))
      .catch(() => {
        // Without terrain the globe is a dark sphere; pins and arcs still work.
      });
    return () => {
      cancelled = true;
    };
  }, [tier]);

  const layer = useTerrainLayer(data, false);

  useFrame(() => {
    if (!layer) return;
    const u = layer.material.uniforms;
    u.uExaggeration.value = view.exaggeration;
    u.uAltitude.value = view.altitude;
    u.uHole.value.copy(view.hole);
    u.uHoleFade.value = view.holeFade;
    u.uSizeMul.value = 1 / Math.sqrt(view.density);
    layer.geometry.setDrawRange(0, Math.floor(layer.count * view.density));
  });

  if (!layer) return null;
  return <points geometry={layer.geometry} material={layer.material} frustumCulled={false} />;
}

/* ---------- Region patches ---------- */

// A patch starts loading when the camera heads within this many degrees of
// its region, and fades in as the camera settles into a close-up inside it.
const PATCH_LOAD_DEG = 30;

function RegionPatches({
  regions,
  tier,
  view,
}: {
  regions: Region[];
  tier: Tier;
  view: View;
}) {
  const [wanted, setWanted] = useState<string[]>([]);
  const fades = useRef(new Map<string, number>());
  // Patches whose particles are on the GPU; only these may hide the global
  // layer, so a region never goes sparse while its patch is still loading.
  const ready = useRef(new Set<string>());

  useFrame(() => {
    let best: { region: Region; fade: number } | null = null;
    for (const region of regions) {
      const center = {
        lat: (region.south + region.north) / 2,
        lng: (region.west + region.east) / 2,
      };
      if (
        !wanted.includes(region.id) &&
        angularDistance(view, center) < PATCH_LOAD_DEG
      ) {
        setWanted((w) => (w.includes(region.id) ? w : [...w, region.id]));
      }
      // How far the camera's target is outside the region's inner area.
      const m = 2;
      const dx = Math.max(region.west + m - view.lng, 0, view.lng - (region.east - m));
      const dy = Math.max(region.south + m - view.lat, 0, view.lat - (region.north - m));
      const inside = 1 - smoothstep(0, 3, Math.hypot(dx, dy));
      const fade = ready.current.has(region.id)
        ? inside * smoothstep(0.55, 0.9, view.closeness)
        : 0;
      fades.current.set(region.id, fade);
      if (fade > (best?.fade ?? 0)) best = { region, fade };
    }
    if (best) {
      const { west, south, east, north } = best.region;
      view.hole.set(west, south, east, north);
      view.holeFade = best.fade;
    } else {
      view.holeFade = 0;
    }
  });

  return (
    <>
      {regions
        .filter((r) => wanted.includes(r.id))
        .map((r) => (
          <RegionPatch
            key={r.id}
            region={r}
            tier={tier}
            view={view}
            fades={fades.current}
            ready={ready.current}
          />
        ))}
    </>
  );
}

function RegionPatch({
  region,
  tier,
  view,
  fades,
  ready,
}: {
  region: Region;
  tier: Tier;
  view: View;
  fades: Map<string, number>;
  ready: Set<string>;
}) {
  const [data, setData] = useState<TerrainData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTerrain(
      `/globe/regions/${region.id}-relief.webp`,
      `/globe/regions/${region.id}-elevation.webp`,
      region,
      TIERS[tier].patchKm,
    )
      .then((d) => !cancelled && setData(d))
      .catch(() => {
        // The global layer keeps covering this region.
      });
    return () => {
      cancelled = true;
    };
  }, [region, tier]);

  const layer = useTerrainLayer(data, true);

  useEffect(() => {
    if (!layer) return;
    ready.add(region.id);
    return () => {
      ready.delete(region.id);
    };
  }, [layer, ready, region.id]);

  useFrame(() => {
    if (!layer) return;
    const fade = fades.get(region.id) ?? 0;
    const u = layer.material.uniforms;
    u.uFade.value = fade;
    u.uExaggeration.value = view.exaggeration;
    u.uAltitude.value = view.altitude;
    u.uSizeMul.value = 1 / Math.sqrt(view.density);
    layer.geometry.setDrawRange(0, fade > 0 ? Math.floor(layer.count * view.density) : 0);
  });

  if (!layer) return null;
  return <points geometry={layer.geometry} material={layer.material} frustumCulled={false} />;
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/* ---------- Arcs ---------- */

function Arcs({
  dirs,
  surface,
  getProgress,
}: {
  dirs: Vector3[];
  surface: number[];
  getProgress: () => number;
}) {
  // One dashed great-circle arc per hop, lifted in proportion to its length.
  // Hops between the same place (e.g. two London stops) get no arc.
  const arcs = useMemo(() => {
    const material = new LineDashedMaterial({
      color: "#ffffff",
      dashSize: 0.008,
      gapSize: 0.006,
      transparent: true,
      opacity: 0.9,
    });
    return dirs.slice(0, -1).map((a, i) => {
      const b = dirs[i + 1];
      const angle = a.angleTo(b);
      if (angle < 0.005) return null;
      const lift = Math.min(0.3, angle * 0.25);
      const pts: number[] = [];
      const v = new Vector3();
      for (let s = 0; s <= ARC_SEGMENTS; s++) {
        const u = s / ARC_SEGMENTS;
        const base = surface[i] + (surface[i + 1] - surface[i]) * u;
        slerp(a, b, u, v).multiplyScalar(base + lift * Math.sin(Math.PI * u));
        pts.push(v.x, v.y, v.z);
      }
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(pts, 3));
      g.setDrawRange(0, 0);
      const line = new Line(g, material);
      line.computeLineDistances();
      return { index: i, line };
    });
  }, [dirs, surface]);

  useEffect(
    () => () => {
      arcs.forEach((arc) => arc?.line.geometry.dispose());
      (arcs.find(Boolean)?.line.material as LineDashedMaterial | undefined)?.dispose();
    },
    [arcs],
  );

  // Draw each arc as the camera travels its hop; scrolling back erases it.
  useFrame(() => {
    const p = getProgress();
    for (const arc of arcs) {
      if (!arc) continue;
      const t = hopEase(Math.min(1, Math.max(0, p - arc.index)));
      arc.line.geometry.setDrawRange(0, t === 0 ? 0 : Math.ceil(t * ARC_SEGMENTS) + 1);
    }
  });

  return (
    <>
      {arcs.map((arc) => arc && <primitive key={arc.index} object={arc.line} />)}
    </>
  );
}

/* ---------- Pins ---------- */

function Pins({
  dirs,
  surface,
  getProgress,
  reducedMotion,
}: {
  dirs: Vector3[];
  surface: number[];
  getProgress: () => number;
  reducedMotion: boolean;
}) {
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos: number[] = [];
    const idx: number[] = [];
    dirs.forEach((d, i) => {
      const r = surface[i] + 0.001;
      pos.push(d.x * r, d.y * r, d.z * r);
      idx.push(i);
    });
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("aIndex", new Float32BufferAttribute(idx, 1));
    return g;
  }, [dirs, surface]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uProgress: { value: -1 },
          uTime: { value: 0 },
          uPx: { value: 72 },
        },
        vertexShader: /* glsl */ `
          attribute float aIndex;
          uniform float uProgress;
          uniform float uPx;
          varying float vState; // 0 future, 1 visited, 2 active
          void main() {
            float d = aIndex - uProgress;
            vState = abs(d) < 0.5 ? 2.0 : (d < 0.0 ? 1.0 : 0.0);
            gl_PointSize = uPx;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying float vState;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            bool isActive = vState > 1.5;
            float coreR = isActive ? 0.07 : 0.045;
            float core = 1.0 - smoothstep(coreR, coreR + 0.02, r);
            // Dark outline keeps the white core readable over light land.
            float outline = 1.0 - smoothstep(coreR + 0.02, coreR + 0.05, r);
            // Soft glow, strongest on the active stop.
            float glow = exp(-r * (isActive ? 6.0 : 11.0))
              * (isActive ? 0.9 : vState > 0.5 ? 0.45 : 0.0)
              * (1.0 - smoothstep(0.32, 0.5, r));
            float bright = vState > 0.5 ? 1.0 : 0.55;

            vec3 color = vec3(0.0);
            float a = outline * 0.7;
            color = mix(color, vec3(1.0), glow);
            a = max(a, glow);
            color = mix(color, vec3(bright), core);
            a = max(a, core);

            if (isActive) {
              // Expanding ring around the active stop.
              float t = fract(uTime * 0.5);
              float ringR = coreR + 0.04 + 0.32 * t;
              float ring = (1.0 - smoothstep(0.0, 0.02, abs(r - ringR))) * (1.0 - t);
              color = mix(color, vec3(1.0), ring);
              a = max(a, ring * 0.9);
            }
            if (a < 0.01) discard;
            gl_FragColor = vec4(color, a);
          }
        `,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uPx.value = 72 * dpr;
  }, [material, dpr]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    material.uniforms.uProgress.value = getProgress();
    // Reduced motion: freeze the ring mid-expansion instead of pulsing.
    material.uniforms.uTime.value = reducedMotion ? 0.35 : clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} renderOrder={2} />;
}
