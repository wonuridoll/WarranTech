/**
 * toast.js — Lightweight toast notification system.
 * Exposes: showToast(message, type='info', duration=4000)
 */

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(function () {
    toast.style.animation = 'slideInRight .3s ease reverse';
    setTimeout(function () { toast.remove(); }, 280);
  }, duration);
}
