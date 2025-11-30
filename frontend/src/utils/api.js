// src/utils/api.js
import axios from 'axios';
import store from '../app/store';
import { logout as logoutAction } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
  // do not set a global Content-Type here so FormData/file uploads work without overrides
});

// helper: strip basic HTML tags and decode common HTML entities
function stripHtml(s = '') {
  if (typeof s !== 'string') return s;
  // replace &nbsp; etc
  s = s.replace(/&nbsp;/g, ' ');
  // strip tags
  s = s.replace(/<\/?[^>]+(>|$)/g, ' ');
  // collapse whitespace
  return s.replace(/\s+/g, ' ').trim();
}

// request: attach token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    } catch (e) { /* ignore */ }
    return config;
  },
  (err) => Promise.reject(err)
);

// response: normalize errors and handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // network error (no response)
    if (!error.response) return Promise.reject(error.message || 'Network error');

    const { status, data, config } = error.response;
    const url = (config && (config.url || '')).toString();

    // detect auth attempts (handle both relative and absolute urls)
    const isAuthAttempt =
      url.includes('/auth/login') || url.includes('/auth/register') ||
      url.endsWith('/auth/login') || url.endsWith('/auth/register');

    // If unauthorized and not an auth attempt, clear token & redirect
    if (status === 401 && !isAuthAttempt) {
      try { store.dispatch(logoutAction()); } catch (e) { /* ignore */ }
      if (typeof window !== 'undefined') {
        // hard replace so history is cleared
        window.location.replace('/login');
      }
      return Promise.reject('Unauthorized');
    }

    // Normalize the server response to a safe string or useful object:
    // - If `data` is a string (HTML or plain), strip HTML tags.
    // - If `data` is an object and contains message, use that.
    // - Otherwise return the object so callers can inspect fields.
    let normalized;
    if (typeof data === 'string') {
      normalized = stripHtml(data);
    } else if (data && typeof data === 'object') {
      normalized = data.message || data.error || data;
    } else {
      normalized = error.message || 'Request failed';
    }

    return Promise.reject(normalized);
  }
);

export default api;