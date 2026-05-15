/**
 * Database layer — Firestore with lazy SDK loading
 *
 * Firebase SDK loaded from CDN only when first DB operation is called.
 * Keeps initial bundle at zero — no impact on pages that don't need DB.
 */

import { firebaseConfig } from './firebase-config.js';

let app = null;
let dbInstance = null;
let sdkLoaded = false;

async function loadSDK() {
  if (sdkLoaded) return;

  const appModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js');
  const firestoreModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js');

  app = appModule.initializeApp(firebaseConfig);
  dbInstance = firestoreModule.getFirestore(app);

  // Store module references for use in operations
  db._fs = firestoreModule;
  sdkLoaded = true;
}

function getFS() {
  return db._fs;
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

  // Also save to localStorage as cache
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
  _fs: null,
};
