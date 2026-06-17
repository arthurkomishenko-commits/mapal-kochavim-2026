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
const JPEG_QUALITY  = 0.9;
// Files older than this are almost certainly bogus lastModified (epoch noise).
const CAPTURED_AT_FLOOR = 1700000000000;     // 2023-11-14

// Defensive blob encoder. Tries WebP first (better compression), falls back to
// JPEG when WebP encode returns null/throws — covers Safari ≤ 16 which has
// patchy WebP encode support on Canvas/OffscreenCanvas.
async function encodeBlob(canvasOrOC, isOffscreen) {
  const tryEncode = async (type, quality) => {
    try {
      if (isOffscreen) {
        return await canvasOrOC.convertToBlob({ type, quality });
      }
      return await new Promise(resolve =>
        canvasOrOC.toBlob(resolve, type, quality)
      );
    } catch {
      return null;
    }
  };
  let blob = await tryEncode('image/webp', WEBP_QUALITY);
  if (!blob) blob = await tryEncode('image/jpeg', JPEG_QUALITY);
  return blob;
}

/**
 * @param {File} file - image file from <input type="file">
 * @returns {Promise<{ blob: Blob, width: number, height: number, capturedAt: number, kind: 'photo' }>}
 */
export async function processImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file');
  }
  // SVG is a script execution surface; reject early.
  if (file.type === 'image/svg+xml') {
    throw new Error('SVG not supported');
  }

  // createImageBitmap auto-rotates from EXIF orientation on most browsers
  // (we pass imageOrientation: 'from-image' explicitly to be sure). Safari ≤ 16
  // ignores this hint; on those devices portrait photos may end up sideways.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  let { width, height } = bitmap;
  if (!width || !height) {
    bitmap.close?.();
    throw new Error('Invalid image dimensions');
  }
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
    blob = await encodeBlob(c, true);
  } else {
    const c = document.createElement('canvas');
    c.width  = width;
    c.height = height;
    c.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    blob = await encodeBlob(c, false);
  }
  bitmap.close?.();

  if (!blob) throw new Error('Image encoding failed');

  // capturedAt: prefer file.lastModified, fall back to now. Reject garbage
  // values below the floor (Firestore rule rejects them too, but failing here
  // saves the orphan-blob round-trip).
  const lm = file.lastModified;
  const capturedAt = (lm && lm > CAPTURED_AT_FLOOR) ? lm : Date.now();

  return {
    blob,
    width,
    height,
    capturedAt,
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
  const lm = file.lastModified;
  const capturedAt = (lm && lm > CAPTURED_AT_FLOOR) ? lm : Date.now();
  return {
    blob: file,
    width: 0,
    height: 0,
    capturedAt,
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
