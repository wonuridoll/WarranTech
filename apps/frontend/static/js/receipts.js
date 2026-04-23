/**
 * receipts.js — Receipt list with search, filter, sort, pagination, and delete.
 */

const PAGE_SIZE = 10;
let currentPage = 1;
let totalPages = 1;
let deleteTargetId = null;
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadReceipts();

  document.getElementById('search-input').addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { currentPage = 1; loadReceipts(); }, 400);
  });
  document.getElementById('category-filter').addEventListener('change', function () { currentPage = 1; loadReceipts(); });
  document.getElementById('sort-select').addEventListener('change', function () { currentPage = 1; loadReceipts(); });

  // Delete modal
  document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
  document.getElementById('delete-modal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
  });
});

async function loadReceipts() {
  const search  = document.getElementById('search-input').value.trim();
  const category = document.getElementById('category-filter').value;
  const ordering = document.getElementById('sort-select').value;

  const params = new URLSearchParams({ page: currentPage, page_size: PAGE_SIZE });
  if (search)   params.set('search', search);
  if (category) params.set('category', category);  // we'll filter client-side if needed
  if (ordering) params.set('ordering', ordering);

  setTableLoading(true);
  try {
    const res = await api.get('/api/items/?' + params.toString());
    const data = res.data;
    let items = data.results || [];

    // Client-side category filter (in case backend doesn't support it via search)
    if (category) items = items.filter(i => i.category === category);

    totalPages = Math.ceil((data.count || 0) / PAGE_SIZE);
    renderTable(items, data.count || 0);
    renderPagination();
  } catch (err) {
    console.error(err);
    showToast('Failed to load receipts.', 'error');
    setTableLoading(false);
  }
}

function setTableLoading(on) {
  if (on) {
    document.getElementById('receipts-tbody').innerHTML = `
      <tr><td colspan="8" style="text-align:center;padding:48px;">
        <div class="spinner" style="margin:0 auto 12px;"></div><p>Loading…</p>
      </td></tr>`;
  }
}

function renderTable(items, total) {
  const tbody = document.getElementById('receipts-tbody');
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="empty-icon"><i class="bi bi-receipt"></i></div>
        <h3>No receipts found</h3>
        <p>Try adjusting your search or add a new receipt.</p>
        <a href="/receipts/new/" class="btn btn-primary btn-sm" style="margin-top:16px;"><i class="bi bi-plus-lg"></i> Add Receipt</a>
      </div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(r => {
    const status = getStatusBadge(r.days_remaining);
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          ${r.image_url
            ? `<img class="receipt-img" src="${escHtml(r.image_url)}" alt="receipt" />`
            : `<div class="receipt-img-placeholder">${getCategoryEmoji(r.category)}</div>`}
          <div>
            <div style="font-weight:600;">${escHtml(r.title)}</div>
            <div style="font-size:.75rem;color:var(--clr-text-muted);">₱${parseFloat(r.price).toLocaleString('en-PH',{minimumFractionDigits:2})}</div>
          </div>
        </div>
      </td>
      <td>${escHtml(r.store)}</td>
      <td><span class="badge badge-blue">${escHtml(r.category)}</span></td>
      <td>₱${parseFloat(r.price).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
      <td>${formatDate(r.purchase_date)}</td>
      <td>${formatDate(r.warranty_end)}</td>
      <td>${status}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <a href="/receipts/${r.id}/edit/" class="btn btn-outline btn-sm btn-icon" title="Edit"><i class="bi bi-pencil-square"></i></a>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="openDeleteModal(${r.id})"><i class="bi bi-trash3-fill"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function renderPagination() {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
      if (p === currentPage - 3 || p === currentPage + 3) html += `<span style="color:var(--clr-text-muted);padding:0 4px;">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p===currentPage?'active':''}" onclick="goPage(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>›</button>`;
  el.innerHTML = html;
}

function goPage(p) {
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  loadReceipts();
}

function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('delete-modal').style.display = 'flex';
}
function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
}
async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    await api.delete('/api/items/' + deleteTargetId + '/');
    showToast('Receipt deleted successfully.', 'success');
    closeDeleteModal();
    loadReceipts();
  } catch (err) {
    showToast('Failed to delete receipt.', 'error');
    closeDeleteModal();
  }
}

// ── Helpers ──────────────────────────────────────────────────
function getStatusBadge(days) {
  if (days < 0)   return `<span class="badge badge-red">Expired</span>`;
  if (days <= 7)  return `<span class="badge badge-red"><i class="bi bi-exclamation-triangle-fill"></i> ${days}d left</span>`;
  if (days <= 30) return `<span class="badge badge-yellow"><i class="bi bi-clock-fill"></i> ${days}d left</span>`;
  return `<span class="badge badge-green"><i class="bi bi-check-circle-fill"></i> ${days}d left</span>`;
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
}
function getCategoryEmoji(cat) {
  const map = {electronics:'<i class="bi bi-phone"></i>',appliances:'<i class="bi bi-house-door"></i>',furniture:'<i class="bi bi-lamp"></i>',clothing:'<i class="bi bi-bag"></i>',vehicles:'<i class="bi bi-car-front"></i>',tools:'<i class="bi bi-tools"></i>',jewelry:'<i class="bi bi-gem"></i>',other:'<i class="bi bi-box"></i>'};
  return map[cat] || '<i class="bi bi-box"></i>';
}
