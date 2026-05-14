/**
 * Auth module — Google Sign-In via Firebase
 *
 * Handles:
 * - Sign in (redirect on iOS Safari, popup elsewhere)
 * - Sign out
 * - Auth state changes → dispatches 'authchange' event
 * - User display name override
 *
 * TODO: Activate when Firebase project is created.
 * Currently exports stubs that work without Firebase SDK.
 */

import { ADMIN_EMAIL } from './firebase-config.js';

let currentUser = null;
const AUTH_READY = 'authchange';

/**
 * Detect iOS Safari — needs redirect auth flow (popup is broken).
 */
function isIOSSafari() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebKit = /WebKit/.test(ua);
  const isChrome = /CriOS/.test(ua);
  return isIOS && isWebKit && !isChrome;
}

/**
 * Initialize auth — listen to state changes.
 * Call this once on boot, after Firebase SDK is loaded.
 */
export async function initAuth() {
  // TODO: Replace with real Firebase auth initialization
  // const { getAuth, onAuthStateChanged } = await import('firebase/auth');
  // const auth = getAuth();
  // onAuthStateChanged(auth, (user) => {
  //   currentUser = user;
  //   window.dispatchEvent(new CustomEvent(AUTH_READY, { detail: { user } }));
  // });

  // Stub: no auth, dispatch null user
  currentUser = null;
  window.dispatchEvent(new CustomEvent(AUTH_READY, { detail: { user: null } }));
}

/**
 * Sign in with Google.
 */
export async function signIn() {
  // TODO: Replace with real Firebase sign-in
  // const { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');
  // const auth = getAuth();
  // const provider = new GoogleAuthProvider();
  //
  // if (isIOSSafari()) {
  //   return signInWithRedirect(auth, provider);
  // }
  // return signInWithPopup(auth, provider);

  console.info('[Auth] Sign-in not available — Firebase not configured');
}

/**
 * Sign out.
 */
export async function signOut() {
  // TODO: Replace with real Firebase sign-out
  // const { getAuth } = await import('firebase/auth');
  // return getAuth().signOut();

  currentUser = null;
  window.dispatchEvent(new CustomEvent(AUTH_READY, { detail: { user: null } }));
}

/**
 * Get current user (or null).
 */
export function getUser() {
  return currentUser;
}

/**
 * Check if current user is admin.
 */
export function isAdmin() {
  return currentUser?.email === ADMIN_EMAIL;
}

/**
 * Check if user is logged in.
 */
export function isLoggedIn() {
  return currentUser !== null;
}

export { AUTH_READY, isIOSSafari };
