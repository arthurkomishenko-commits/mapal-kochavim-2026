/**
 * Database layer — Firestore with lazy SDK loading
 *
 * Firebase SDK loaded from CDN only when first DB operation is called.
 * Keeps initial bundle at zero — no impact on pages that don't need DB.
 */

import { firebaseConfig } from './firebase-config.js';

let app = null;
let dbInstance = null;
let storageInstance = null;
let fsModule = null;
let stModule = null;
let sdkLoaded = false;
let sdkPromise = null;
let storagePromise = null;

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

async function loadStorage() {
  await loadSDK();
  if (stModule) return;
  if (storagePromise) return storagePromise;
  storagePromise = (async () => {
    stModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-storage.js');
    storageInstance = stModule.getStorage(app);
  })();
  return storagePromise;
}

function getFS() {
  if (!fsModule) throw new Error('Firebase SDK not loaded');
  return fsModule;
}

function getST() {
  if (!stModule) throw new Error('Firebase Storage SDK not loaded');
  return stModule;
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
// PHOTOS / VIDEOS — user uploads after the event
// ═══════════════════════════════════════════════════

/**
 * Upload a processed media blob and create the Firestore doc.
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
 *                    width:number, height:number}>}
 */
async function addPhoto({ blob, capturedAt, kind, uploaderPhone, uploaderName,
                          width = 0, height = 0, onProgress }) {
  await loadStorage();
  const fs = getFS();
  const st = getST();

  const id = crypto.randomUUID();
  const ext = kind === 'video' ? guessVideoExt(blob.type) : 'webp';
  const path = `${kind === 'video' ? 'videos' : 'photos'}/${id}.${ext}`;
  const storageRef = st.ref(storageInstance, path);
  const task = st.uploadBytesResumable(storageRef, blob, {
    contentType: blob.type,
    customMetadata: {
      uploaderPhone, capturedAt: String(capturedAt),
    },
  });

  await new Promise((resolve, reject) => {
    task.on('state_changed',
      snap => onProgress?.(snap.bytesTransferred / snap.totalBytes),
      err  => reject(err),
      ()   => resolve(),
    );
  });

  // getDownloadURL and setDoc both produce orphan blobs on transient failure —
  // wrap the entire post-upload phase and roll back the Storage object on any
  // error path so we never leak a blob without a matching Firestore doc.
  try {
    const url = await st.getDownloadURL(storageRef);
    const doc = {
      id, url, kind, capturedAt, uploaderPhone, uploaderName,
      width, height,
      storagePath: path,
      createdAt: fs.serverTimestamp(),
    };
    await fs.setDoc(fs.doc(dbInstance, 'photos', id), doc);
    return {
      id, url, kind, capturedAt, uploaderPhone, uploaderName,
      width, height,
      storagePath: path,
      createdAt: Date.now(),
    };
  } catch (err) {
    try { await st.deleteObject(storageRef); } catch {}
    throw err;
  }
}

function guessVideoExt(mime) {
  if (mime?.includes('webm')) return 'webm';
  if (mime?.includes('quicktime')) return 'mov';
  return 'mp4';
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
 * Delete a photo. Client checks ownership before calling.
 * Storage delete is best-effort — Firestore delete is the source of truth.
 */
async function deletePhoto(id, storagePath) {
  await loadStorage();
  const fs = getFS();
  const st = getST();
  await fs.deleteDoc(fs.doc(dbInstance, 'photos', id));
  if (storagePath) {
    try { await st.deleteObject(st.ref(storageInstance, storagePath)); } catch {}
  }
}

export const db = {
  getParticipant,
  saveParticipant,
  getAllParticipants,
  findCompanionLink,
  addPhoto,
  getPhotos,
  deletePhoto,
};
