/**
 * dashboard.js — Loads stats and lists for the dashboard.
 */

document.addEventListener('DOMContentLoaded', async function () {
  requireAuth();

  try {
    const [itemsRes, remindersRes] = await Promise.all([
      api.get('/api/items/?page_size=1000'),
      api.get('/api/reminders/'),
    ]);

    const items = itemsRes.data.results || [];
    const reminders = remindersRes.data.results || [];

    // ── Stats ────────────────────────────────────────────────
    const today = new Date(); today.setHours(0,0,0,0);
    const activeItems = items.filter(i => new Date(i.warranty_end) >= today);
    const totalValue = items.reduce((s, i) => s + parseFloat(i.price), 0);

    setText('stat-total', items.length);
    setText('stat-active', activeItems.length);
    setText('stat-expiring', remindersRes.data.count || 0);
    setText('stat-value', '₱' + totalValue.toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2}));

    // ── Recent receipts ──────────────────────────────────────
    const recentEl = document.getElementById('recent-receipts-list');
    const recent = items.slice(0, 5);
    if (recent.length === 0) {
      recentEl.innerHTML = `<div class="empty-state" style="padding:32px 0;">
        <div class="empty-icon">🧾</div>
        <h3>No receipts yet</h3>
        <p>Add your first receipt to get started</p>
        <a href="/receipts/new/" class="btn btn-primary btn-sm" style="margin-top:16px;">➕ Add Receipt</a>
      </div>`;
    } else {
      recentEl.innerHTML = recent.map(r => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);">
          <div class="receipt-img-placeholder">${getCategoryEmoji(r.category)}</div>
          <div style="flex:1;overflow:hidden;">
            <div style="font-weight:600;font-size:.875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(r.title)}</div>
            <div style="font-size:.75rem;color:var(--clr-text-muted);">${escHtml(r.store)} · ${formatDate(r.warranty_end)}</div>
          </div>
          <span class="badge ${getDaysClass(r.days_remaining)}">${r.days_remaining}d</span>
        </div>
      `).join('');
    }

    // ── Expiring soon ────────────────────────────────────────
    const expiringEl = document.getElementById('expiring-list');
    if (reminders.length === 0) {
      expiringEl.innerHTML = `<div class="empty-state" style="padding:32px 0;">
        <div class="empty-icon">✅</div>
        <h3>All clear!</h3>
        <p>No warranties expiring in the next 30 days</p>
      </div>`;
    } else {
      expiringEl.innerHTML = reminders.slice(0,5).map(r => `
        <div class="reminder-card ${getDaysSeverity(r.days_remaining)}" style="margin-bottom:10px;padding:14px 18px;">
          <div class="reminder-info">
            <div class="reminder-title">${escHtml(r.title)}</div>
            <div class="reminder-store">${escHtml(r.store)}</div>
          </div>
          <div style="text-align:center;">
            <div class="reminder-days ${getDaysColor(r.days_remaining)}">${r.days_remaining}</div>
            <div class="reminder-days-label">days left</div>
          </div>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('Failed to load dashboard data.', 'error');
  }
});

// ── Helpers ──────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id); if (el) el.textContent = val;
}
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {month:'short',day:'numeric',year:'numeric'});
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getDaysClass(days) {
  if (days < 0)  return 'badge-red';
  if (days <= 7) return 'badge-red';
  if (days <= 30)return 'badge-yellow';
  return 'badge-green';
}
function getDaysSeverity(days) {
  if (days <= 7)  return 'critical';
  if (days <= 14) return 'warning';
  return 'ok';
}
function getDaysColor(days) {
  if (days <= 7)  return 'red';
  if (days <= 14) return 'yellow';
  return 'green';
}
function getCategoryEmoji(cat) {
  const map = {electronics:'📱',appliances:'🏠',furniture:'🪑',clothing:'👕',vehicles:'🚗',tools:'🔧',jewelry:'💍',other:'📦'};
  return map[cat] || '📦';
}
