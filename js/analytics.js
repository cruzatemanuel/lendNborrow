// ========================================================
// lendNborrow: Analytics Service & Visualizations
// Renders personal summary stats and the two campus charts:
// 1. Top Items by Category
// 2. Borrowing Activity by College
// ========================================================

import { api } from './api.js';

let categoriesChartInstance = null;
let collegesChartInstance = null;

export async function getMyAnalytics() {
  return await api.get('/analytics/me');
}

export async function getCommunityAnalytics() {
  return await api.get('/analytics/community');
}

/**
 * Updates the 4 personal dashboard summary cards.
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
 * Renders recent activity items in the activity sidebar.
 */
export function renderActivityFeed(container, activities = []) {
  if (!container) return;
  container.replaceChildren();

  if (!activities || activities.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'form-help';
    emptyP.textContent = 'No lending or borrowing activity recorded yet';
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
        actionText = `Handover confirmed: "${itemTitle}" is out on loan`;
        break;
      case 'return_submitted':
        actionText = `Return initiated for "${itemTitle}"`;
        break;
      case 'returned':
        actionText = `Return confirmed for "${itemTitle}"`;
        break;
      case 'rejected':
        actionText = `Request declined for "${itemTitle}"`;
        break;
      case 'cancelled':
        actionText = `Request cancelled for "${itemTitle}"`;
        break;
      default:
        actionText = `Status updated on "${itemTitle}": ${act.status}`;
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
 * Helper to show or clear an empty-state message inside a chart wrapper.
 */
function setChartEmptyState(canvasEl, message) {
  if (!canvasEl || !canvasEl.parentElement) return;
  const wrapper = canvasEl.parentElement;

  const existingMsg = wrapper.querySelector('.chart-empty');
  if (existingMsg) existingMsg.remove();

  if (message) {
    canvasEl.classList.add('hidden');
    const emptyEl = document.createElement('p');
    emptyEl.className = 'chart-empty';
    emptyEl.textContent = message;
    wrapper.appendChild(emptyEl);
  } else {
    canvasEl.classList.remove('hidden');
  }
}

/**
 * Initializes the two community analytics charts from live Supabase data:
 * 1. Top Items by Category
 * 2. Borrowing Activity by College
 */
export function initCommunityCharts(data = {}) {
  const categoryCanvas = document.getElementById('chart-categories');
  const collegeCanvas = document.getElementById('chart-colleges');

  if (categoriesChartInstance) {
    categoriesChartInstance.destroy();
    categoriesChartInstance = null;
  }
  if (collegesChartInstance) {
    collegesChartInstance.destroy();
    collegesChartInstance = null;
  }

  const topCategories = Array.isArray(data.topCategories) ? data.topCategories : [];
  const collegeActivity = Array.isArray(data.collegeActivity) ? data.collegeActivity : [];

  // 1. Top Items by Category
  if (categoryCanvas) {
    if (topCategories.length === 0) {
      setChartEmptyState(categoryCanvas, 'No items listed yet. Category counts will appear once listings are posted.');
    } else if (typeof Chart === 'undefined') {
      setChartEmptyState(categoryCanvas, 'Chart visualization library could not be loaded.');
    } else {
      setChartEmptyState(categoryCanvas, null);
      const labels = topCategories.map(c => c.name);
      const counts = topCategories.map(c => c.count);

      categoriesChartInstance = new Chart(categoryCanvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: counts,
            backgroundColor: [
              '#8B1E24',
              '#5E554A',
              '#7B7266',
              '#A39B8F',
              '#C7C0B5',
              '#DFD9CE'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#5E554A',
                boxWidth: 10,
                padding: 12,
                font: {
                  family: "'DM Sans', -apple-system, sans-serif",
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }

  // 2. Borrowing Activity by College
  if (collegeCanvas) {
    if (collegeActivity.length === 0) {
      setChartEmptyState(collegeCanvas, 'No borrowing transactions recorded across colleges yet.');
    } else if (typeof Chart === 'undefined') {
      setChartEmptyState(collegeCanvas, 'Chart visualization library could not be loaded.');
    } else {
      setChartEmptyState(collegeCanvas, null);
      const labels = collegeActivity.map(c => c.college);
      const counts = collegeActivity.map(c => c.count);

      collegesChartInstance = new Chart(collegeCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Borrow requests',
            data: counts,
            backgroundColor: '#8B1E24',
            borderRadius: 4,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#7B7266',
                font: {
                  family: "'IBM Plex Mono', ui-monospace, monospace",
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              border: {
                display: false
              },
              grid: {
                color: 'rgba(31, 27, 22, 0.06)'
              },
              ticks: {
                precision: 0,
                color: '#7B7266',
                font: {
                  family: "'IBM Plex Mono', ui-monospace, monospace",
                  size: 11
                }
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}
