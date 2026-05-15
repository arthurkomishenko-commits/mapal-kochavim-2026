/**
 * Auth — phone + token session
 *
 * On first registration: random token generated, saved in Firestore + localStorage.
 * Edit/delete only possible if token matches.
 * No passwords, no SMS. Phone + token is the identity.
 */

const STORAGE_KEY = 'mapal-user';

const ADMIN_PHONES = [
  '0548107581', // Arthur
  '0547564800', // Andrey
  '0549731889', // Vladimir
  '0528601612', // Robert
  '0542273518', // Evgeny
];

function generateToken() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(input) {
  if (!input) return '';
  let phone = input.replace(/[^\d+]/g, '');
  phone = phone.replace(/(?!^)\+/g, '');
  if (phone.startsWith('+972')) phone = '0' + phone.slice(4);
  if (phone.startsWith('972') && phone.length >= 12) phone = '0' + phone.slice(3);
  return phone;
}

function login(phone, name, token) {
  const normalized = normalizePhone(phone);
  const user = { phone: normalized, name: name || '', token: token || '' };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('authchange', { detail: { user } }));
  return user;
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('authchange', { detail: { user: null } }));
}

function getUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function getToken() {
  const user = getUser();
  return user ? user.token || '' : '';
}

function updateUser(fields) {
  const user = getUser();
  if (!user) return null;
  const updated = { ...user, ...fields };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

function isLoggedIn() {
  return getUser() !== null;
}

function isAdmin() {
  const user = getUser();
  return user ? ADMIN_PHONES.includes(user.phone) : false;
}

function initAuth() {
  const user = getUser();
  window.dispatchEvent(new CustomEvent('authchange', { detail: { user } }));
}

export const auth = {
  normalizePhone,
  generateToken,
  login,
  logout,
  getUser,
  getToken,
  updateUser,
  isLoggedIn,
  isAdmin,
  initAuth,
};
