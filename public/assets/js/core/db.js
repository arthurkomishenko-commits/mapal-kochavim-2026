/**
 * Database layer — Firestore with lazy SDK loading
 *
 * Firebase SDK loaded from CDN only when first DB operation is called.
 * Keeps initial bundle at zero — no impact on pages that don't need DB.
 */

import { firebaseConfig } from './firebase-config.js';

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

export const db = {
  getParticipant,
  saveParticipant,
  getAllParticipants,
  findCompanionLink,
};
