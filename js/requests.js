// ========================================================
// lendNborrow: Borrow Requests Service
// Controls request lifecycle and state transitions
// ========================================================

import { api } from './api.js';

export async function createRequest(requestData) {
  return await api.post('/requests', requestData);
}

export async function getIncomingRequests() {
  return await api.get('/requests/incoming');
}

export async function getMyRequests() {
  return await api.get('/requests/mine');
}

export async function getRequest(id) {
  return await api.get(`/requests/${id}`);
}

export async function approveRequest(id) {
  return await api.post(`/requests/${id}/approve`, {});
}

export async function rejectRequest(id, reason) {
  return await api.post(`/requests/${id}/reject`, { reason });
}

export async function cancelRequest(id) {
  return await api.post(`/requests/${id}/cancel`, {});
}

export async function confirmPickup(id) {
  return await api.post(`/requests/${id}/pickup`, {});
}

export async function submitReturn(id, conditionNote = '') {
  return await api.post(`/requests/${id}/return`, { condition_note: conditionNote });
}

export async function confirmReturn(id, condition = 'Good') {
  return await api.post(`/requests/${id}/confirm-return`, { condition });
}

/**
 * Returns a styled badge element for a request status.
 */
export function createStatusBadge(status) {
  const badge = document.createElement('span');
  badge.className = 'badge';

  switch (status) {
    case 'pending':
      badge.classList.add('badge-gold');
      badge.textContent = 'Pending';
      break;
    case 'approved':
      badge.classList.add('badge-green');
      badge.textContent = 'Approved';
      break;
    case 'borrowing':
      badge.classList.add('badge-green');
      badge.textContent = 'Borrowing';
      break;
    case 'return_submitted':
      badge.classList.add('badge-gold');
      badge.textContent = 'Return Pending';
      break;
    case 'returned':
      badge.classList.add('badge-muted');
      badge.textContent = 'Returned';
      break;
    case 'rejected':
      badge.classList.add('badge-maroon');
      badge.textContent = 'Rejected';
      break;
    case 'cancelled':
      badge.classList.add('badge-muted');
      badge.textContent = 'Cancelled';
      break;
    default:
      badge.classList.add('badge-muted');
      badge.textContent = status;
  }

  return badge;
}

