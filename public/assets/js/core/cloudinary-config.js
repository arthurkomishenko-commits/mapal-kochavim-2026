/**
 * Cloudinary configuration — public, intentionally checked into the repo.
 *
 * The cloud name and unsigned preset are not secrets: they are visible in
 * every upload request from the browser. Security relies on the preset
 * being scoped (folder, allowed formats, etc.) and on Firestore rules.
 *
 * API Key and API Secret are NOT used by the client and must never appear
 * in this file.
 */

export const cloudinaryConfig = {
  cloudName: 'dqznby5hm',
  uploadPreset: 'mapal_unsigned',
  // Auto endpoint handles both image and video resource_type detection.
  uploadEndpoint: 'https://api.cloudinary.com/v1_1/dqznby5hm/auto/upload',
  // Cloudinary free tier hard-caps unsigned upload size around 100 MB.
  // Images get re-encoded to WebP <=2400px before upload (well under),
  // videos pass through and must be checked client-side.
  maxVideoBytes: 100 * 1024 * 1024,
};
