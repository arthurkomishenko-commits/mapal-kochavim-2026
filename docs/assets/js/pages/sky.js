/** Sky → redirects to Place (combined page) */
export function renderSky(container) {
  // Redirect via hash change after current handler completes
  setTimeout(() => { window.location.hash = 'place'; }, 0);
}
