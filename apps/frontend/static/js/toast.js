/**
 * toast.js — Lightweight toast notification system.
 * Exposes: showToast(message, type='info', duration=4000)
 */

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '<i class="bi bi-check-circle-fill" style="color:var(--clr-success)"></i>', error: '<i class="bi bi-x-circle-fill" style="color:var(--clr-danger)"></i>', warning: '<i class="bi bi-exclamation-triangle-fill" style="color:var(--clr-warning)"></i>', info: '<i class="bi bi-info-circle-fill" style="color:var(--clr-info)"></i>' };
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
