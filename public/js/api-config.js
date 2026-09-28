'use strict';

// Set this to the public HTTPS URL of the deployed Express API.
// Example: https://creative-carnival-api.onrender.com
window.CREATIVE_CARNIVAL_API_BASE_URL = 'https://REPLACE_WITH_YOUR_RENDER_SERVICE.onrender.com';

function apiUrl(path) {
  const base = window.CREATIVE_CARNIVAL_API_BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
