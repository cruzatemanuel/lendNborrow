// ========================================================
// lendNborrow: Items Service
// Handles item listings, search queries, and DOM card rendering
// ========================================================

import { api } from './api.js';

export async function getItems(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.category && params.category !== 'All') query.set('category', params.category);
  if (params.college && params.college !== 'All' && params.college !== 'all') query.set('college', params.college);
  if (params.status) query.set('status', params.status);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);

  const qs = query.toString();
  return await api.get(`/items${qs ? `?${qs}` : ''}`);
}

export async function getItem(id) {
  return await api.get(`/items/${id}`);
}

export async function getMyItems() {
  return await api.get('/items/mine');
}

export async function createItem(formData) {
  return await api.post('/items', formData);
}

export async function updateItem(id, formData) {
  return await api.patch(`/items/${id}`, formData);
}

export async function deleteItem(id) {
  return await api.delete(`/items/${id}`);
}

export async function toggleAvailability(id) {
  return await api.patch(`/items/${id}/availability`, {});
}

/**
 * Formats a positive numeric value in Philippine Pesos (₱).
 * Returns null if the value is not a valid positive number.
 */
export function formatPesoAmount(amount) {
  if (amount === null || amount === undefined || amount === '') return null;
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `₱${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Returns true when an item has an active, valid damage/liability fee.
 */
export function hasItemLiability(item) {
  if (!item || !item.has_liability) return false;
  const num = Number(item.liability_amount);
  return Number.isFinite(num) && num > 0;
}

/**
 * Creates a safely rendered DOM card for an item.
 * Strictly uses textContent to prevent XSS.
 */
export function createItemCardElement(item) {
  const card = document.createElement('div');
  card.className = 'item-card';

  // Image or neutral placeholder
  const imgContainer = document.createElement('div');
  imgContainer.className = 'item-card-img';

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.title;
    img.loading = 'lazy';
    imgContainer.appendChild(img);
  } else {
    imgContainer.textContent = 'No Photo';
  }
  card.appendChild(imgContainer);

  const body = document.createElement('div');
  body.className = 'item-card-body';

  // Category and Status Badges
  const badgeRow = document.createElement('div');
  badgeRow.className = 'item-badge-row';

  const catBadge = document.createElement('span');
  catBadge.className = 'badge badge-maroon';
  catBadge.textContent = item.category || 'General';
  badgeRow.appendChild(catBadge);

  const statusBadge = document.createElement('span');
  statusBadge.className = `badge ${item.status === 'available' ? 'badge-green' : 'badge-muted'}`;
  statusBadge.textContent = item.status;
  badgeRow.appendChild(statusBadge);

  body.appendChild(badgeRow);

  // Title
  const title = document.createElement('h3');
  title.className = 'item-card-title';
  title.textContent = item.title;
  body.appendChild(title);

  // Metadata
  const meta = document.createElement('div');
  meta.className = 'item-card-meta';

  const collegeP = document.createElement('span');
  collegeP.textContent = `${item.owner?.college || 'Alangilan'} · ${item.pickup_location || 'Campus'}`;
  meta.appendChild(collegeP);

  const durationP = document.createElement('span');
  durationP.textContent = `Max ${item.max_borrow_days} days · Condition: ${item.condition}`;
  meta.appendChild(durationP);

  body.appendChild(meta);

  // Liability / Damage Fee Badge & Notice (if required by lender)
  if (hasItemLiability(item)) {
    const formattedAmount = formatPesoAmount(item.liability_amount);
    const liabilityBox = document.createElement('div');
    liabilityBox.className = 'item-card-liability';

    const liabilityHeader = document.createElement('div');
    liabilityHeader.className = 'item-card-liability-header';

    const liabilityBadge = document.createElement('span');
    liabilityBadge.className = 'badge badge-liability';
    liabilityBadge.textContent = `Damage / Liability Fee: ${formattedAmount}`;
    liabilityHeader.appendChild(liabilityBadge);
    liabilityBox.appendChild(liabilityHeader);

    if (item.liability_terms && String(item.liability_terms).trim()) {
      const termsText = String(item.liability_terms).trim();
      const termsEl = document.createElement('p');
      termsEl.className = 'item-card-liability-terms';
      termsEl.textContent = termsText;
      termsEl.title = termsText;
      liabilityBox.appendChild(termsEl);
    }

    body.appendChild(liabilityBox);
  }

  // Footer CTA
  const footer = document.createElement('div');
  footer.className = 'item-card-footer';

  const viewBtn = document.createElement('a');
  viewBtn.href = `/item.html?id=${item.id}`;
  viewBtn.className = 'btn btn-outline btn-sm btn-block';
  viewBtn.textContent = 'View Item';
  footer.appendChild(viewBtn);

  body.appendChild(footer);
  card.appendChild(body);

  return card;
}
