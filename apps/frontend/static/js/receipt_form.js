/**
 * receipt_form.js — Add and Edit receipt form logic.
 * Reads receipt ID from the URL path: /receipts/<id>/edit/
 */

const FIELDS = ['title','store','category','purchase_date','price','warranty_end','notes'];

document.addEventListener('DOMContentLoaded', async function () {
  requireAuth();

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const editIndex = pathParts.indexOf('edit');
  const receiptId = editIndex > 0 ? parseInt(pathParts[editIndex - 1]) : null;
  const isEdit = !!receiptId;

  // Set today as max for purchase_date
  document.getElementById('purchase_date').max = new Date().toISOString().split('T')[0];
  // Set today as min for warranty_end
  document.getElementById('warranty_end').min = new Date().toISOString().split('T')[0];

  if (isEdit) {
    document.getElementById('form-heading').textContent = 'Edit Receipt';
    document.getElementById('submit-btn-text').textContent = 'Update Receipt';
    document.getElementById('receipt-id').value = receiptId;
    await loadExistingReceipt(receiptId);
  }

  // Image upload
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('image');
  const preview  = document.getElementById('img-preview');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file, preview);
  });
  fileInput.addEventListener('change', function () {
    if (this.files[0]) handleImageFile(this.files[0], preview);
  });

  // Form submit
  document.getElementById('receipt-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const valid = validateForm();
    if (!valid) return;

    const formData = new FormData();
    FIELDS.forEach(f => {
      const val = document.getElementById(f).value;
      if (val !== undefined && val !== '') formData.append(f, val);
    });
    if (fileInput.files[0]) formData.append('image', fileInput.files[0]);
    // Clear image if checkbox checked
    const clearCb = document.getElementById('clear-image');
    if (clearCb && clearCb.checked) formData.append('image', '');

    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.patch('/api/items/' + receiptId + '/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Receipt updated successfully! ✏️', 'success');
      } else {
        res = await api.post('/api/items/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Receipt added successfully! 🧾', 'success');
      }
      setTimeout(() => window.location.href = '/receipts/', 700);
    } catch (err) {
      const errors = err.response?.data || {};
      let handled = false;
      FIELDS.forEach(f => {
        if (errors[f]) { showError(f, Array.isArray(errors[f]) ? errors[f][0] : errors[f]); handled = true; }
      });
      if (!handled) showToast(errors.detail || 'Failed to save receipt. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  });
});

async function loadExistingReceipt(id) {
  try {
    const res = await api.get('/api/items/' + id + '/');
    const r = res.data;
    document.getElementById('title').value        = r.title || '';
    document.getElementById('store').value        = r.store || '';
    document.getElementById('category').value     = r.category || '';
    document.getElementById('purchase_date').value= r.purchase_date || '';
    document.getElementById('price').value        = r.price || '';
    document.getElementById('warranty_end').value = r.warranty_end || '';
    document.getElementById('notes').value        = r.notes || '';

    if (r.image_url) {
      const info = document.getElementById('current-image-info');
      const link = document.getElementById('current-image-link');
      if (info) info.style.display = 'block';
      if (link) link.href = r.image_url;
    }
  } catch (err) {
    showToast('Could not load receipt data.', 'error');
    setTimeout(() => window.location.href = '/receipts/', 1500);
  }
}

function handleImageFile(file, preview) {
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.querySelector('.img-preview-label').textContent = file.name;
    document.querySelector('.img-preview-icon').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function validateForm() {
  let valid = true;
  if (!document.getElementById('title').value.trim())   { showError('title', 'Title is required.'); valid=false; }
  if (!document.getElementById('store').value.trim())   { showError('store', 'Store is required.'); valid=false; }
  if (!document.getElementById('category').value)       { showError('category', 'Category is required.'); valid=false; }
  if (!document.getElementById('purchase_date').value)  { showError('purchase_date', 'Purchase date is required.'); valid=false; }
  if (!document.getElementById('price').value)          { showError('price', 'Price is required.'); valid=false; }
  const wEnd = document.getElementById('warranty_end').value;
  if (!wEnd) { showError('warranty_end', 'Warranty end date is required.'); valid=false; }
  else if (wEnd < new Date().toISOString().split('T')[0]) { showError('warranty_end', 'Warranty end must be today or future.'); valid=false; }
  return valid;
}

function setLoading(on) {
  document.getElementById('submit-btn').disabled = on;
  document.getElementById('submit-btn-text').textContent = on ? 'Saving...' : (document.getElementById('receipt-id').value ? 'Update Receipt' : 'Save Receipt');
  document.getElementById('submit-spinner').style.display = on ? 'inline-block' : 'none';
}
function clearErrors() {
  FIELDS.forEach(f => {
    const el = document.getElementById(f); if (el) el.classList.remove('is-invalid');
    const err = document.getElementById(f + '-error'); if (err) { err.textContent=''; err.classList.remove('show'); }
  });
}
function showError(field, msg) {
  const el = document.getElementById(field); if (el) el.classList.add('is-invalid');
  const err = document.getElementById(field + '-error');
  if (err) { err.textContent = msg; err.classList.add('show'); }
}
