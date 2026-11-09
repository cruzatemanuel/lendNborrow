/**
 * api.js — Central HTTP client for all Express API calls.
 *
 * Every frontend module imports from here instead of calling fetch() directly.
 * Handles JSON parsing, error handling, and automatic 401 redirects.
 */

import { API_BASE_URL } from './config.js';

/**
 * Base fetch wrapper. Adds JSON headers, credentials, and error handling.
 * @param {string}  endpoint — Path relative to API_BASE_URL (e.g. '/auth/login')
 * @param {object}  options  — fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}   — Parsed JSON response
 * @throws {ApiError}
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: 'same-origin', // send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // If body is an object, stringify it (unless it's FormData for file uploads)
  if (config.body && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Remove Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);

  // Auto-redirect to login on 401
  if (response.status === 401) {
    const currentPage = window.location.pathname;
    if (currentPage !== '/login.html' && currentPage !== '/register.html') {
      window.location.href = '/login.html';
      return;
    }
  }

  // Parse JSON response
  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/** GET request */
export function apiGet(endpoint) {
  return request(endpoint, { method: 'GET' });
}

/** POST request with JSON body */
export function apiPost(endpoint, body) {
  return request(endpoint, { method: 'POST', body });
}

/** PUT request with JSON body */
export function apiPut(endpoint, body) {
  return request(endpoint, { method: 'PUT', body });
}

/** DELETE request */
export function apiDelete(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

/**
 * POST with FormData (for file uploads).
 * Does NOT set Content-Type — the browser adds it with the boundary.
 */
export function apiUpload(endpoint, formData) {
  return request(endpoint, {
    method: 'POST',
    body: formData,
  });
}

