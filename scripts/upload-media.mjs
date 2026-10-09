// Uploads a folder of photos to the Supabase `media` bucket as WebP, keeping
// subfolders: <dir>/journey/banff.jpeg -> media/journey/banff.webp.
//
//   node --env-file=.env scripts/upload-media.mjs <dir>
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (Dashboard → Project
// Settings → API Keys → secret key). Re-running overwrites (upsert), so it's
// safe to run again after adding or replacing photos.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = process.argv[2];
if (!SOURCE_DIR) {
  console.error("Usage: node --env-file=.env scripts/upload-media.mjs <dir>");
  process.exit(1);
}
const BUCKET = "media";
const MAX_WIDTH = 2400;
const QUALITY = 80;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.");
  process.exit(1);
}

const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (IMAGE.test(entry.name)) yield full;
  }
}

let failed = 0;
for await (const file of walk(SOURCE_DIR)) {
  // <dir>/journey/banff.jpeg -> journey/banff.webp
  const objectPath = path
    .relative(SOURCE_DIR, file)
    .split(path.sep)
    .join("/")
    .replace(IMAGE, ".webp");

  const input = await readFile(file);
  // rotate() bakes in EXIF orientation before the metadata is stripped.
  const body = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "image/webp",
      "Cache-Control": "max-age=31536000",
      "x-upsert": "true",
    },
    body,
  });

  const kb = (n) => `${Math.round(n / 1024)} KB`;
  if (res.ok) {
    console.log(`✓ ${objectPath}  ${kb(input.length)} → ${kb(body.length)}`);
  } else {
    failed++;
    console.error(`✗ ${objectPath}  ${res.status} ${await res.text()}`);
  }
}

if (failed) process.exit(1);
