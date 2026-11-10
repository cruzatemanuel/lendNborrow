// ========================================================
// lendNborrow: Shared Layout & Navigation
// Injects responsive header, mobile menu, modals, and toasts
// ========================================================

import { getMe, logout } from './auth.js';

/**
 * Initializes the global navigation header and user profile state.
 */
export async function initLayout() {
  const header = document.querySelector('header.hdr, #header, #navbar');
  if (!header) return;

  let currentUser = null;
  try {
    currentUser = await getMe(true);
  } catch (err) {
    currentUser = null;
  }

  const currentPath = window.location.pathname;

  // Header markup structure
  header.className = 'hdr';
  header.replaceChildren();

  // 1. Brand Logo
  const brandLink = document.createElement('a');
  brandLink.href = currentUser ? '/dashboard.html' : '/';
  brandLink.className = 'brand';

  const logoImg = document.createElement('img');
  logoImg.src = '/assets/logo.png';
  logoImg.alt = 'lendNborrow logo';
  brandLink.appendChild(logoImg);

  const brandText = document.createElement('span');
  brandText.className = 'text';
  brandText.innerHTML = 'lend<span class="accent">N</span>borrow';
  brandLink.appendChild(brandText);

  header.appendChild(brandLink);

  // 2. Mobile Menu Toggle Button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'nav-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle Navigation');
  toggleBtn.textContent = '☰';
  header.appendChild(toggleBtn);

  // 3. Navigation Links
  const nav = document.createElement('nav');
  nav.className = 'nav';

  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  const links = [];

  if (currentUser) {
    links.push({ href: '/dashboard.html', text: 'Dashboard' });
    links.push({ href: '/browse.html', text: 'Browse Items' });
    links.push({ href: '/my-listings.html', text: 'My Listings' });
    links.push({ href: '/my-borrows.html', text: 'My Borrows' });
    links.push({ href: '/profile.html', text: 'Profile' });
  } else {
    links.push({ href: '/', text: 'Home' });
    links.push({ href: '/browse.html', text: 'Browse' });
    links.push({ href: '/signin.html', text: 'Sign In' });
    links.push({ href: '/signup.html', text: 'Sign Up' });
  }

  links.forEach(l => {
    const a = document.createElement('a');
    a.href = l.href;
    a.textContent = l.text;
    if (
      (l.href === '/' && (currentPath === '/' || currentPath.endsWith('index.html'))) ||
      (l.href !== '/' && currentPath.includes(l.href.replace('.html', '')))
    ) {
      a.className = 'active';
    }
    nav.appendChild(a);
  });

  header.appendChild(nav);

  // 4. Header Right (Post Item Button & User/Auth Actions)
  const rightSection = document.createElement('div');
  rightSection.className = 'hdr-right';

  if (currentUser) {
    const postBtn = document.createElement('a');
    postBtn.href = '/listing-form.html';
    postBtn.className = 'btn btn-gold btn-sm';
    postBtn.textContent = '+ Post Item';
    rightSection.appendChild(postBtn);

    const userPill = document.createElement('div');
    userPill.className = 'user-pill';

    const avatar = document.createElement('span');
    avatar.className = 'user-avatar-sm';
    avatar.textContent = (currentUser.full_name || currentUser.email || 'S')[0];
    userPill.appendChild(avatar);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = currentUser.full_name || currentUser.email.split('@')[0];
    userPill.appendChild(nameSpan);

    rightSection.appendChild(userPill);

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-sm btn-outline';
    logoutBtn.style.color = '#ffffff';
    logoutBtn.style.borderColor = 'rgba(255,255,255,0.4)';
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.addEventListener('click', async () => {
      await logout();
    });
    rightSection.appendChild(logoutBtn);
  } else {
    const postBtn = document.createElement('a');
    postBtn.href = '/signin.html';
    postBtn.className = 'btn btn-gold btn-sm';
    postBtn.textContent = '+ Post Item';
    rightSection.appendChild(postBtn);
  }

  header.appendChild(rightSection);
}

/**
 * Toast notification system.
 */
export function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

/**
 * Custom accessible Modal dialog replacing prompt() and confirm().
 * Styled consistently with the Guided Website reference.
 */
export function showModal({
  title = 'Confirmation',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isPrompt = false,
  promptPlaceholder = '',
  onConfirm = () => {}
}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal-content';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';

  const titleEl = document.createElement('h3');
  titleEl.className = 'modal-title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => backdrop.remove());
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';

  if (message) {
    const msgP = document.createElement('p');
    msgP.style.marginBottom = isPrompt ? '14px' : '0';
    msgP.textContent = message;
    body.appendChild(msgP);
  }

  let promptInput = null;
  if (isPrompt) {
    promptInput = document.createElement('textarea');
    promptInput.rows = 3;
    promptInput.placeholder = promptPlaceholder;
    body.appendChild(promptInput);
  }

  modal.appendChild(body);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary btn-sm';
  cancelBtn.textContent = cancelText;
  cancelBtn.addEventListener('click', () => backdrop.remove());
  footer.appendChild(cancelBtn);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-maroon btn-sm';
  confirmBtn.textContent = confirmText;
  confirmBtn.addEventListener('click', async () => {
    const val = promptInput ? promptInput.value : true;
    backdrop.remove();
    await onConfirm(val);
  });
  footer.appendChild(confirmBtn);

  modal.appendChild(footer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  if (promptInput) {
    promptInput.focus();
  }
}

