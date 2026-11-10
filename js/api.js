// ========================================================
// lendNborrow: API Client
// Only module in the frontend that invokes fetch()
// ========================================================

import { API_BASE } from './config.js';

/**
 * Universal request wrapper with error handling, credentials, and 401 detection.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = { ...(options.headers || {}) };

  // If body is NOT FormData and not explicitly configured, default to application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'same-origin' // Ensures httpOnly session cookie is transmitted
  };

  try {
    const response = await fetch(url, config);

    // Handle session expiration or unauthorized access
    if (response.status === 401) {
      // Don't loop redirect if already on signin or signup page or checking auth
      const currentPath = window.location.pathname;
      const isPublicPage =
        currentPath.endsWith('signin.html') ||
        currentPath.endsWith('signup.html') ||
        currentPath.endsWith('check-email.html') ||
        currentPath.endsWith('index.html') ||
        currentPath === '/';

      if (!isPublicPage && !options.skipAuthRedirect) {
        window.location.href = `/signin.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { text: await response.text() };
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

