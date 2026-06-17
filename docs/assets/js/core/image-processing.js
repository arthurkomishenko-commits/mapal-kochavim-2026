/**
 * Image processing — Canvas-based resize + EXIF strip.
 *
 * Why this exists: phones embed GPS coordinates in photo EXIF. Even in a
 * closed friends-only event we don't want a participant's home location
 * leaking through a photo posted from before the camp drive. Re-encoding
 * through Canvas drops ALL EXIF metadata, including GPS. As a side effect
 * it also gives us a max-2400px resize and WebP conversion for free.
 *
 * Capture timestamp is preserved separately from EXIF via `file.lastModified`
 * (which on iOS/Android matches the photo's date in the camera roll). This
 * is "good enough" ordering for a friends gallery — a future enhancement
 * can add a real EXIF DateTimeOriginal parser.
 *
 * Videos are uploaded as-is (re-encoding video on the client is expensive
 * and FFmpeg.wasm would blow our JS budget).
 */

const MAX_DIMENSION = 2400;
const WEBP_QUALITY  = 0.85;

/**
 * @param {File} file - image file from <input type="file">
 * @returns {Promise<{ blob: Blob, width: number, height: number, capturedAt: number, kind: 'photo' }>}
 */
export async function processImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file');
  }

  // createImageBitmap auto-rotates from EXIF orientation on most browsers
  // (we pass imageOrientation: 'from-image' explicitly to be sure).
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width  = Math.round(width  * scale);
    height = Math.round(height * scale);
  }

  // OffscreenCanvas is faster but isn't on older Safari — fall back to <canvas>.
  let blob;
  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(width, height);
    c.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    blob = await c.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY });
  } else {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    c.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    blob = await new Promise(resolve =>
      c.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    );
  }
  bitmap.close?.();

  return {
    blob,
    width,
    height,
    capturedAt: file.lastModified || Date.now(),
    kind: 'photo',
  };
}

/**
 * Videos passed through untouched. We trust the Storage rule to enforce size.
 * @param {File} file
 * @returns {Promise<{ blob: Blob, width: 0, height: 0, capturedAt: number, kind: 'video' }>}
 */
export async function processVideo(file) {
  if (!file.type.startsWith('video/')) {
    throw new Error('Not a video file');
  }
  return {
    blob: file,
    width: 0,
    height: 0,
    capturedAt: file.lastModified || Date.now(),
    kind: 'video',
  };
}

/**
 * Single entry point — picks image or video pipeline based on the file's MIME.
 * @param {File} file
 */
export async function processMedia(file) {
  if (file.type.startsWith('image/')) return processImage(file);
  if (file.type.startsWith('video/')) return processVideo(file);
  throw new Error(`Unsupported file type: ${file.type}`);
}
