// Renders a pet species' text sprites to a PNG contact sheet for review.
//
//   node --no-warnings scripts/pet-sheet.mjs <species> [out.png] [variant]
//
// Renders one coat variant (default: the first). For each theme (light, then
// dark) the sheet shows every frame enlarged 10x, then the same row at real
// display size (3x), then an onion-skin row for each animation: every frame
// drawn over the previous one in red, so pixels that jump between frames
// stand out. Frames are outlined as at runtime, then validated (16x16, every
// character in the palette).

import sharp from "sharp";

const SIZE = 16;
const BIG = 10;
const REAL = 3;
const GAP = 6;
const PAD = 12;
const BG = { light: "#fafafa", dark: "#0a0a0a" };
const ONION = [230, 40, 60, 110];

const [species, out = `pet-${species}.png`, variantKey] = process.argv.slice(2);
if (!species) {
  console.error("usage: node scripts/pet-sheet.mjs <species> [out.png] [variant]");
  process.exit(1);
}

const { outline } = await import("../src/components/pet/sprites/outline.ts");
const mod = await import(`../src/components/pet/sprites/${species}.ts`);
const { variants } = mod[species];
const variant = variants[variantKey ?? Object.keys(variants)[0]];
if (!variant) {
  console.error(`variants: ${Object.keys(variants).join(", ")}`);
  process.exit(1);
}
const palettes = Object.fromEntries(
  ["light", "dark"].map((t) => [t, { ...variant.colors, o: variant.outline[t] }]),
);
const frames = Object.fromEntries(
  Object.entries(mod[species].frames).map(([name, frame]) => [name, outline(frame)]),
);
const names = Object.keys(frames);

const errors = [];
for (const name of names) {
  const rows = frames[name];
  if (rows.length !== SIZE) errors.push(`${name}: ${rows.length} rows`);
  rows.forEach((row, y) => {
    if (row.length !== SIZE) errors.push(`${name} row ${y}: ${row.length} cols`);
    for (const ch of row) {
      if (ch !== "." && !(ch in palettes.light && ch in palettes.dark)) {
        errors.push(`${name} row ${y}: unknown "${ch}"`);
      }
    }
  });
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

// "walk1".."walk4" → one animation; single frames get no onion row.
const groups = {};
for (const name of names) (groups[name.replace(/\d+$/, "")] ??= []).push(name);
const anims = Object.values(groups).filter((g) => g.length > 1);

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const cell = (scale) => SIZE * scale + GAP;
const rowWidth = (n, scale) => n * cell(scale) - GAP;

const width = PAD * 2 + Math.max(rowWidth(names.length, BIG), ...anims.map((g) => rowWidth(g.length, BIG)));
const bandHeight = PAD + cell(BIG) + cell(REAL) + anims.length * cell(BIG) + PAD;
const height = bandHeight * 2;
const buf = Buffer.alloc(width * height * 4);

function rect(x, y, w, h, [r, g, b, a = 255]) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      const k = (j * width + i) * 4;
      const t = a / 255;
      buf[k] = Math.round(r * t + buf[k] * (1 - t));
      buf[k + 1] = Math.round(g * t + buf[k + 1] * (1 - t));
      buf[k + 2] = Math.round(b * t + buf[k + 2] * (1 - t));
      buf[k + 3] = 255;
    }
  }
}

function draw(frame, palette, x, y, scale, tint) {
  frame.forEach((row, py) => {
    [...row].forEach((ch, px) => {
      if (ch === ".") return;
      rect(x + px * scale, y + py * scale, scale, scale, tint ?? hex(palette[ch]));
    });
  });
}

["light", "dark"].forEach((theme, t) => {
  const palette = palettes[theme];
  let y = t * bandHeight;
  rect(0, y, width, bandHeight, hex(BG[theme]));
  y += PAD;
  names.forEach((n, i) => draw(frames[n], palette, PAD + i * cell(BIG), y, BIG));
  y += cell(BIG);
  names.forEach((n, i) => draw(frames[n], palette, PAD + i * cell(REAL), y, REAL));
  y += cell(REAL);
  for (const group of anims) {
    group.forEach((n, i) => {
      const x = PAD + i * cell(BIG);
      draw(frames[group[(i - 1 + group.length) % group.length]], palette, x, y, BIG, ONION);
      draw(frames[n], palette, x, y, BIG);
    });
    y += cell(BIG);
  }
});

await sharp(buf, { raw: { width, height, channels: 4 } }).png().toFile(out);
console.log(`${out}: ${names.join(", ")}`);
