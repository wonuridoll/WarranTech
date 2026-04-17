/**
 * api.js — Axios instance with JWT auth + automatic token refresh.
 * All modules import `api` instead of raw axios.
 */

const API_BASE = window.location.origin;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ── Request interceptor: attach Bearer token ─────────────────
api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('wt_access');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ───────────────
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  function (response) { return response; },
  async function (error) {
    const original = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !original._retry &&
      !original.url?.includes('/api/auth/login/') &&
      !original.url?.includes('/api/auth/refresh/')
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          refreshQueue.push({ resolve, reject });
        }).then(token => {
          original.headers['Authorization'] = 'Bearer ' + token;
          return api(original);
        }).catch(err => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem('wt_refresh');
      if (!refresh) {
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(API_BASE + '/api/auth/refresh/', { refresh });
        const newAccess = res.data.access;
        localStorage.setItem('wt_access', newAccess);
        if (res.data.refresh) localStorage.setItem('wt_refresh', res.data.refresh);

        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccess;
        refreshQueue.forEach(p => p.resolve(newAccess));
        refreshQueue = [];
        original.headers['Authorization'] = 'Bearer ' + newAccess;
        return api(original);
      } catch (refreshErr) {
        refreshQueue.forEach(p => p.reject(refreshErr));
        refreshQueue = [];
        redirectToLogin();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

function redirectToLogin() {
  localStorage.removeItem('wt_access');
  localStorage.removeItem('wt_refresh');
  localStorage.removeItem('wt_user');
  window.location.href = '/login/';
}
