// ========================================================
// lendNborrow: Analytics Service & Visualizations
// Integrates personal dashboard metrics and Chart.js for BA track
// ========================================================

import { api } from './api.js';

export async function getMyAnalytics() {
  return await api.get('/analytics/me');
}

export async function getCommunityAnalytics() {
  return await api.get('/analytics/community');
}

/**
 * Updates the 4 gold-header dashboard stat cards.
 */
export function renderStatCards(stats = {}) {
  const activeEl = document.getElementById('stat-active-listings');
  const borrowingEl = document.getElementById('stat-items-borrowing');
  const pendingEl = document.getElementById('stat-pending-requests');
  const returnedEl = document.getElementById('stat-completed-returns');

  if (activeEl) activeEl.textContent = stats.activeListings ?? 0;
  if (borrowingEl) borrowingEl.textContent = stats.itemsBorrowing ?? 0;
  if (pendingEl) pendingEl.textContent = stats.pendingRequests ?? 0;
  if (returnedEl) returnedEl.textContent = stats.completedReturns ?? 0;
}

/**
 * Renders recent activity items in the blush sidebar.
 */
export function renderActivityFeed(container, activities = []) {
  if (!container) return;
  container.replaceChildren();

  if (!activities || activities.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'form-help';
    emptyP.textContent = 'No recent activity yet.';
    container.appendChild(emptyP);
    return;
  }

  activities.forEach(act => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'activity-item';

    const descSpan = document.createElement('span');
    const itemTitle = act.item?.title || 'an item';

    let actionText = '';
    switch (act.status) {
      case 'pending':
        actionText = `Request submitted for "${itemTitle}"`;
        break;
      case 'approved':
        actionText = `Request approved for "${itemTitle}"`;
        break;
      case 'borrowing':
        actionText = `Handover completed: "${itemTitle}" is now borrowed`;
        break;
      case 'return_submitted':
        actionText = `Return submitted for "${itemTitle}"`;
        break;
      case 'returned':
        actionText = `Return confirmed for "${itemTitle}"`;
        break;
      case 'rejected':
        actionText = `Request rejected for "${itemTitle}"`;
        break;
      case 'cancelled':
        actionText = `Request cancelled for "${itemTitle}"`;
        break;
      default:
        actionText = `Status update on "${itemTitle}": ${act.status}`;
    }

    descSpan.textContent = actionText;
    itemDiv.appendChild(descSpan);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'activity-time';
    const date = new Date(act.updated_at || act.created_at);
    timeSpan.textContent = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    itemDiv.appendChild(timeSpan);

    container.appendChild(itemDiv);
  });
}

/**
 * Initializes community analytics charts with Chart.js (via CDN).
 */
export function initCommunityCharts(data) {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js CDN not loaded.');
    return;
  }

  // 1. Categories Chart (Bar or Doughnut)
  const categoryCanvas = document.getElementById('chart-categories');
  if (categoryCanvas && data.topCategories?.length > 0) {
    const labels = data.topCategories.map(c => c.name);
    const counts = data.topCategories.map(c => c.count);

    new Chart(categoryCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: [
            '#8E1B24',
            '#E4A62E',
            '#2E7D57',
            '#1D63B8',
            '#A33A41',
            '#9A6B00'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // 2. College Activity Chart
  const collegeCanvas = document.getElementById('chart-colleges');
  if (collegeCanvas && data.collegeActivity?.length > 0) {
    const labels = data.collegeActivity.map(c => c.college);
    const counts = data.collegeActivity.map(c => c.count);

    new Chart(collegeCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Borrowing Activity by College',
          data: counts,
          backgroundColor: '#8E1B24',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

