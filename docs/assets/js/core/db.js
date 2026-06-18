/**
 * Database layer — Firestore (metadata) + Cloudinary (media blobs).
 *
 * Firestore stores participants and photo metadata; the actual photo/video
 * binaries live in Cloudinary because Firebase Storage now requires the
 * Blaze paid plan. Cloudinary's free tier covers our closed-event scale.
 *
 * Firestore SDK is lazy-loaded from CDN on first DB call to keep the
 * initial bundle at zero.
 */

import { firebaseConfig } from './firebase-config.js';
import { cloudinaryConfig } from './cloudinary-config.js';

let app = null;
let dbInstance = null;
let fsModule = null;
let sdkLoaded = false;
let sdkPromise = null;

async function loadSDK() {
  if (sdkLoaded) return;
  if (sdkPromise) return sdkPromise;

  sdkPromise = (async () => {
    const appModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js');
    fsModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js');

    app = appModule.initializeApp(firebaseConfig);
    dbInstance = fsModule.getFirestore(app);
    sdkLoaded = true;
  })();

  return sdkPromise;
}

function getFS() {
  if (!fsModule) throw new Error('Firebase SDK not loaded');
  return fsModule;
}

// ═══════════════════════════════════════════════════
// PARTICIPANTS CRUD
// ═══════════════════════════════════════════════════

async function getParticipant(phone) {
  await loadSDK();
  const fs = getFS();
  const docRef = fs.doc(dbInstance, 'participants', phone);
  const snap = await fs.getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

async function saveParticipant(data) {
  await loadSDK();
  const fs = getFS();
  const docRef = fs.doc(dbInstance, 'participants', data.phone);
  await fs.setDoc(docRef, {
    ...data,
    updatedAt: fs.serverTimestamp(),
  }, { merge: true });

  localStorage.setItem('mapal-rsvp-' + data.phone, JSON.stringify(data));
}

async function getAllParticipants() {
  await loadSDK();
  const fs = getFS();
  const colRef = fs.collection(dbInstance, 'participants');
  const snap = await fs.getDocs(colRef);
  const list = [];
  snap.forEach(doc => {
    const data = doc.data();
    if (!data.cancelled) list.push(data);
  });
  return list;
}

/**
 * Remove a participant — used by admin UI to clear junk/test rows.
 *
 * Tries a hard Firestore delete first. The rules file in this repo allows
 * it, but until those rules are deployed (`firebase deploy --only
 * firestore:rules`) the production project still has the old "delete: if
 * false" rule and the call returns PERMISSION_DENIED. In that case we
 * fall back to a soft delete (cancelled:true), which is already filtered
 * out everywhere by getAllParticipants(), so the row disappears from the
 * "Кто едет" list and the admin panel either way. localStorage entry is
 * dropped in both paths.
 */
async function deleteParticipant(phone) {
  await loadSDK();
  const fs = getFS();
  const docRef = fs.doc(dbInstance, 'participants', phone);

  try {
    await fs.deleteDoc(docRef);
  } catch (err) {
    if (err && (err.code === 'permission-denied' || /permission/i.test(String(err.message || '')))) {
      // Soft-delete fallback. setDoc with merge:true preserves token /
      // createdAt so the update rule passes (token == resource.data.token,
      // and only cancelled/updatedAt show up in diff.affectedKeys()).
      const snap = await fs.getDoc(docRef);
      if (snap.exists()) {
        const existing = snap.data();
        await fs.setDoc(docRef, {
          ...existing,
          cancelled: true,
          updatedAt: fs.serverTimestamp(),
        }, { merge: true });
      }
    } else {
      throw err;
    }
  }

  try { localStorage.removeItem('mapal-rsvp-' + phone); } catch {}
}

async function findCompanionLink(phone) {
  await loadSDK();
  const fs = getFS();
  const colRef = fs.collection(dbInstance, 'participants');
  const q = fs.query(colRef, fs.where('companionPhones', 'array-contains', phone));
  const snap = await fs.getDocs(q);
  if (snap.empty) return null;
  const adder = snap.docs[0].data();
  const comp = (adder.companions || []).find(c => c.phone === phone);
  return {
    addedByPhone: adder.phone,
    addedByName: adder.name,
    name: comp ? comp.name : '',
  };
}

// ═══════════════════════════════════════════════════
// PHOTOS / VIDEOS — Cloudinary upload + Firestore doc
// ═══════════════════════════════════════════════════

/**
 * Upload a processed media blob to Cloudinary and create the Firestore doc.
 *
 * @param {Object} args
 * @param {Blob}   args.blob          — processed (EXIF-stripped) media
 * @param {number} args.capturedAt    — ms since epoch
 * @param {'photo'|'video'} args.kind
 * @param {string} args.uploaderPhone — current user phone (from auth)
 * @param {string} args.uploaderName  — current user name (from auth)
 * @param {(p:number)=>void} [args.onProgress] — 0..1
 * @returns {Promise<{id:string, url:string, capturedAt:number, kind:string,
 *                    uploaderPhone:string, uploaderName:string,
 *                    width:number, height:number, cloudinaryPublicId:string}>}
 */
async function addPhoto({ blob, capturedAt, kind, uploaderPhone, uploaderName,
                          width = 0, height = 0, onProgress }) {
  // Cloudinary free unsigned upload tops out around 100 MB. Images are already
  // shrunk to <=2400px WebP (<<1 MB), so the cap only bites video pass-through.
  if (kind === 'video' && blob.size > cloudinaryConfig.maxVideoBytes) {
    const mb = Math.round(blob.size / 1024 / 1024);
    throw new Error(`Video too large: ${mb} MB (max ${Math.round(cloudinaryConfig.maxVideoBytes / 1024 / 1024)} MB)`);
  }

  // Mirror Firestore-rule caps client-side so we never burn a Cloudinary
  // upload on a doc that will be rejected on persistence. A long display
  // name or a non-normalised phone would otherwise succeed at Cloudinary,
  // fail Firestore on every retry, and leak one blob per attempt.
  const phoneStr = String(uploaderPhone || '');
  const nameStr  = String(uploaderName || '');
  if (phoneStr.length === 0 || phoneStr.length >= 30) {
    throw new Error(`Invalid uploaderPhone (length ${phoneStr.length})`);
  }
  if (nameStr.length >= 100) {
    throw new Error(`Display name too long (${nameStr.length} chars, max 99)`);
  }

  await loadSDK();
  const fs = getFS();

  const id = crypto.randomUUID();

  // Cloudinary upload via XHR (fetch lacks upload progress).
  // Cap onProgress at 0.95 during XHR so the bar doesn't sit at 100% for
  // the Cloudinary response + Firestore round-trip; we drive it to 1.0
  // only after the doc actually persists.
  const wrappedProgress = onProgress
    ? (p) => onProgress(Math.min(p, 0.95))
    : undefined;
  const uploaded = await uploadToCloudinary(blob, id, {
    uploaderPhone: phoneStr,
    capturedAt,
    kind,
    onProgress: wrappedProgress,
  });

  // Cloudinary returns authoritative dimensions for images; for videos width
  // is reported too. Prefer Cloudinary's numbers, fall back to client values.
  const finalWidth = uploaded.width || width;
  const finalHeight = uploaded.height || height;

  // If Firestore write fails we'd orphan the Cloudinary blob. Unsigned uploads
  // can only be deleted in the first ~10 min via a delete_token (preset feature
  // currently off). Acceptable: failure rate is low and the leaked blob costs
  // ~500 KB at most. If this becomes a problem, flip "Return delete token"
  // on the preset and call DELETE /v1_1/{cloud}/delete_by_token here.
  const doc = {
    id,
    url: uploaded.secureUrl,
    kind, capturedAt,
    uploaderPhone: phoneStr,
    uploaderName: nameStr,
    width: finalWidth,
    height: finalHeight,
    cloudinaryPublicId: uploaded.publicId,
    createdAt: fs.serverTimestamp(),
  };
  await fs.setDoc(fs.doc(dbInstance, 'photos', id), doc);

  // Now drive progress to 1.0 — XHR was capped at 0.95.
  onProgress?.(1);

  return {
    id,
    url: uploaded.secureUrl,
    kind, capturedAt,
    uploaderPhone: phoneStr,
    uploaderName: nameStr,
    width: finalWidth,
    height: finalHeight,
    cloudinaryPublicId: uploaded.publicId,
    createdAt: Date.now(),
  };
}

/**
 * POST a blob to Cloudinary unsigned upload endpoint.
 * Uses XMLHttpRequest because fetch() lacks upload progress events.
 *
 * @returns {Promise<{secureUrl:string, publicId:string, width:number, height:number}>}
 */
// Idle-style timeout: abort only when there has been NO progress for this
// many ms. A 100 MB video on desert 3G takes ~6 minutes — a hard wall-clock
// ceiling would falsely abort it, so we measure stalls instead of total time.
const UPLOAD_IDLE_MS = 60 * 1000;
// An overall ceiling, as a sanity backstop only (~30 min). Anything that
// genuinely runs longer than this is broken regardless of throughput.
const UPLOAD_MAX_MS = 30 * 60 * 1000;

function uploadToCloudinary(blob, publicId, { uploaderPhone, capturedAt, kind, onProgress }) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    // Pass an explicit filename so the asset's display_name in the Cloudinary
    // Media Library is the publicId, not the literal string "blob".
    const ext = kind === 'video' ? guessVideoExt(blob.type) : 'webp';
    form.append('file', blob, `${publicId}.${ext}`);
    form.append('upload_preset', cloudinaryConfig.uploadPreset);
    form.append('public_id', publicId);
    // Context metadata — survives the upload, viewable in Cloudinary Media Library.
    // Pipe-separated key=value pairs; values must not contain `|` or `=`.
    form.append('context', `uploader=${sanitizeContext(uploaderPhone)}|captured_at=${capturedAt}`);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', cloudinaryConfig.uploadEndpoint);

    let idleTimer = null;
    let hardTimer = null;
    let stalled = false;
    const clearTimers = () => {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      if (hardTimer) { clearTimeout(hardTimer); hardTimer = null; }
    };
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { stalled = true; xhr.abort(); }, UPLOAD_IDLE_MS);
    };
    hardTimer = setTimeout(() => { stalled = true; xhr.abort(); }, UPLOAD_MAX_MS);
    resetIdle();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        resetIdle();
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      });
    } else {
      xhr.upload.addEventListener('progress', resetIdle);
    }

    xhr.addEventListener('load', () => {
      clearTimers();
      if (xhr.status < 200 || xhr.status >= 300) {
        let msg = `Cloudinary upload failed: HTTP ${xhr.status}`;
        try {
          const err = JSON.parse(xhr.responseText);
          if (err?.error?.message) msg += ` — ${err.error.message}`;
        } catch {}
        return reject(new Error(msg));
      }
      try {
        const res = JSON.parse(xhr.responseText);
        resolve({
          secureUrl: res.secure_url,
          publicId: res.public_id,
          width: res.width || 0,
          height: res.height || 0,
        });
      } catch (e) {
        reject(new Error('Cloudinary returned invalid JSON'));
      }
    });

    xhr.addEventListener('error',   () => { clearTimers(); reject(new Error('Network error uploading to Cloudinary')); });
    xhr.addEventListener('abort',   () => {
      clearTimers();
      reject(new Error(stalled
        ? `Upload stalled — no progress for ${Math.round(UPLOAD_IDLE_MS/1000)}s`
        : 'Upload aborted'));
    });

    xhr.send(form);
  });
}

function guessVideoExt(mime) {
  if (mime?.includes('webm'))     return 'webm';
  if (mime?.includes('quicktime'))return 'mov';
  return 'mp4';
}

function sanitizeContext(s) {
  return String(s || '').replace(/[|=]/g, '_');
}

/**
 * Fetch photos page, cursor-based.
 *
 * @param {Object} opts
 * @param {number} [opts.limit]            default 10
 * @param {*}      [opts.cursor]           opaque cursor from previous page (Firestore DocumentSnapshot)
 * @returns {Promise<{ items: Array, cursor: any, done: boolean }>}
 */
async function getPhotos({ limit = 10, cursor = null } = {}) {
  await loadSDK();
  const fs = getFS();
  const colRef = fs.collection(dbInstance, 'photos');
  const constraints = [
    fs.orderBy('capturedAt', 'asc'),
    fs.limit(limit + 1),                           // +1 to know if there's more
  ];
  if (cursor) constraints.push(fs.startAfter(cursor));
  const q = fs.query(colRef, ...constraints);
  const snap = await fs.getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;
  const items = pageDocs.map(d => d.data());
  return {
    items,
    cursor: pageDocs.length ? pageDocs[pageDocs.length - 1] : null,
    done: !hasMore,
  };
}

/**
 * Soft-delete a photo: remove the Firestore doc, leave the Cloudinary blob.
 * Client checks ownership before calling. The blob keeps occupying storage
 * but is unreachable through the app — acceptable given free-tier headroom
 * and the closed-event scope.
 */
async function deletePhoto(id) {
  await loadSDK();
  const fs = getFS();
  await fs.deleteDoc(fs.doc(dbInstance, 'photos', id));
}

export const db = {
  getParticipant,
  saveParticipant,
  deleteParticipant,
  getAllParticipants,
  findCompanionLink,
  addPhoto,
  getPhotos,
  deletePhoto,
};
