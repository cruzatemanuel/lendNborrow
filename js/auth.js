// ========================================================
// lendNborrow: Authentication Service
// Manages registration, session state, and student verification
// ========================================================

import { api } from './api.js';

let currentUser = null;

export async function getAuthConfig() {
  return await api.get('/auth/config', { skipAuthRedirect: true });
}

export async function register(studentData) {
  return await api.post('/auth/register', studentData, { skipAuthRedirect: true });
}

export async function login(credentials) {
  const result = await api.post('/auth/login', credentials, { skipAuthRedirect: true });
  currentUser = result.user;
  return result;
}

export async function logout() {
  try {
    await api.post('/auth/logout', {});
  } finally {
    currentUser = null;
    window.location.href = '/signin.html';
  }
}

export async function getMe(skipRedirect = false) {
  if (currentUser) return currentUser;
  try {
    const data = await api.get('/auth/me', { skipAuthRedirect: skipRedirect });
    currentUser = data.user;
    return currentUser;
  } catch (err) {
    currentUser = null;
    if (skipRedirect) return null;
    throw err;
  }
}

export async function updateProfile(profileData) {
  const result = await api.patch('/auth/profile', profileData);
  currentUser = result.user;
  return result;
}

export async function getGoogleAuthUrl() {
  const data = await api.get('/auth/google/start', { skipAuthRedirect: true });
  return data.url;
}

export async function sendGoogleSession(accessToken) {
  const result = await api.post('/auth/google/session', { access_token: accessToken }, { skipAuthRedirect: true });
  currentUser = result.user;
  return result;
}

export function getCurrentUser() {
  return currentUser;
}

