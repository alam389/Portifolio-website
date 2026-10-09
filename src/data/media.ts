// Photos live in the Supabase `media` bucket (public read-by-URL); upload or
// replace them with scripts/upload-media.mjs. The project URL isn't a secret,
// so it's a constant here rather than an env var the deploy has to carry.
export const MEDIA_ORIGIN = "https://gxzkhesuxzpyniomwzyf.supabase.co";

/** Public URL for an object in the media bucket, e.g. media("journey/banff.webp"). */
export const media = (path: string) =>
  `${MEDIA_ORIGIN}/storage/v1/object/public/media/${path}`;
