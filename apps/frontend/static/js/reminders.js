/**
 * reminders.js — Renders the reminders page.
 */

document.addEventListener('DOMContentLoaded', async function () {
  requireAuth();

  const container = document.getElementById('reminders-container');
  const countEl   = document.getElementById('reminder-count');
  const badgeEl   = document.getElementById('reminder-count-badge');

  try {
    const res = await api.get('/api/reminders/');
    const { count, results } = res.data;

    if (countEl) countEl.textContent = count;
    if (badgeEl) badgeEl.style.display = count > 0 ? 'inline-flex' : 'none';

    if (!results || results.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:80px 24px;">
          <div class="empty-icon">🎉</div>
          <h3>All warranties are safe!</h3>
          <p>No warranties expiring in the next 30 days. Great job staying on top of things.</p>
          <a href="/receipts/" class="btn btn-primary btn-sm" style="margin-top:20px;">View All Receipts</a>
        </div>`;
      return;
    }

    container.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;" class="fade-in">
      ${results.map(r => {
        const severity = r.days_remaining <= 7 ? 'critical' : r.days_remaining <= 14 ? 'warning' : 'ok';
        const color    = r.days_remaining <= 7 ? 'red'      : r.days_remaining <= 14 ? 'yellow'  : 'green';
        return `
        <div class="reminder-card ${severity}">
          <div style="font-size:2rem;flex-shrink:0;">${getCategoryEmoji(r.category)}</div>
          <div class="reminder-info">
            <div class="reminder-title">${escHtml(r.title)}</div>
            <div class="reminder-store">${escHtml(r.store)}</div>
            <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;">
              <span class="badge badge-blue">${escHtml(r.category)}</span>
              <span class="badge badge-purple">₱${parseFloat(r.price).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
              <span style="font-size:.75rem;color:var(--clr-text-muted);">Expires: ${formatDate(r.warranty_end)}</span>
            </div>
          </div>
          <div style="text-align:center;flex-shrink:0;">
            <div class="reminder-days ${color}">${r.days_remaining}</div>
            <div class="reminder-days-label">days left</div>
            <a href="/receipts/${r.id}/edit/" class="btn btn-outline btn-sm" style="margin-top:10px;">Edit</a>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><h3>Failed to load reminders</h3><p>Please refresh the page and try again.</p></div>`;
    showToast('Could not load reminders.', 'error');
  }
});

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH',{month:'long',day:'numeric',year:'numeric'});
}
function getCategoryEmoji(cat) {
  const map={electronics:'📱',appliances:'🏠',furniture:'🪑',clothing:'👕',vehicles:'🚗',tools:'🔧',jewelry:'💍',other:'📦'};
  return map[cat] || '📦';
}
