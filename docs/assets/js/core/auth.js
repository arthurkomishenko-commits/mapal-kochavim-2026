/**
 * Auth — phone-based session (localStorage)
 * No passwords, no SMS. Phone number is the identity.
 * For a private event of 45 friends.
 */

const STORAGE_KEY = 'mapal-user';

function normalizePhone(input) {
  // Strip everything except digits and leading +
  let phone = input.replace(/[^\d+]/g, '');
  // +972 → 0
  if (phone.startsWith('+972')) phone = '0' + phone.slice(4);
  // 972 → 0
  if (phone.startsWith('972') && phone.length > 10) phone = '0' + phone.slice(3);
  return phone;
}

function login(phone, name) {
  const normalized = normalizePhone(phone);
  const user = { phone: normalized, name: name || '' };
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

// Emit initial auth state on load
function initAuth() {
  const user = getUser();
  window.dispatchEvent(new CustomEvent('authchange', { detail: { user } }));
}

export const auth = {
  normalizePhone,
  login,
  logout,
  getUser,
  updateUser,
  isLoggedIn,
  initAuth,
};
