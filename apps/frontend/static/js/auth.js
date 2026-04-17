/**
 * auth.js — Shared auth utilities (used internally, can be extended).
 */
function getUser() {
  try { return JSON.parse(localStorage.getItem('wt_user') || '{}'); }
  catch { return {}; }
}
function requireAuth() {
  if (!localStorage.getItem('wt_access')) window.location.href = '/login/';
}
