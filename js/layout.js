// ========================================================
// lendNborrow: Shared Layout & Navigation
// Injects persistent left-hand sidebar, mobile drawer, modals, and toasts
// ========================================================

import { getMe, logout } from './auth.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an accessible decorative SVG icon element without innerHTML.
 */
function createIcon(paths, className = 'sidebar-icon') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', className);

  paths.forEach(([tag, attrs]) => {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    svg.appendChild(el);
  });

  return svg;
}

const ICONS = {
  dashboard: () =>
    createIcon([
      ['rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }],
      ['rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }],
      ['rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }],
      ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }]
    ]),
  browse: () =>
    createIcon([
      ['circle', { cx: 11, cy: 11, r: 8 }],
      ['path', { d: 'm21 21-4.35-4.35' }]
    ]),
  listings: () =>
    createIcon([
      ['path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }],
      ['path', { d: 'm3.3 7 8.7 5 8.7-5' }],
      ['path', { d: 'M12 22V12' }]
    ]),
  borrows: () =>
    createIcon([
      ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
      ['rect', { x: 8, y: 2, width: 8, height: 4, rx: 1 }],
      ['path', { d: 'M9 14l2 2 4-4' }]
    ]),
  plus: () =>
    createIcon([
      ['circle', { cx: 12, cy: 12, r: 9 }],
      ['path', { d: 'M12 8v8' }],
      ['path', { d: 'M8 12h8' }]
    ]),
  profile: () =>
    createIcon([
      ['circle', { cx: 12, cy: 8, r: 4 }],
      ['path', { d: 'M20 21a8 8 0 0 0-16 0' }]
    ]),
  signOut: () =>
    createIcon([
      ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
      ['polyline', { points: '16 17 21 12 16 7' }],
      ['line', { x1: 21, y1: 12, x2: 9, y2: 12 }]
    ]),
  signIn: () =>
    createIcon([
      ['path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }],
      ['polyline', { points: '10 17 15 12 10 7' }],
      ['line', { x1: 15, y1: 12, x2: 3, y2: 12 }]
    ]),
  menu: () =>
    createIcon([
      ['line', { x1: 3, y1: 6, x2: 21, y2: 6 }],
      ['line', { x1: 3, y1: 12, x2: 21, y2: 12 }],
      ['line', { x1: 3, y1: 18, x2: 21, y2: 18 }]
    ], 'mobile-menu-icon'),
  close: () =>
    createIcon([
      ['line', { x1: 18, y1: 6, x2: 6, y2: 18 }],
      ['line', { x1: 6, y1: 6, x2: 18, y2: 18 }]
    ], 'sidebar-close-icon')
};

function createBrandContent(classPrefix = 'sidebar') {
  const logoWrap = document.createElement('span');
  logoWrap.className = `${classPrefix}-logo-wrap`;

  const logoImg = document.createElement('img');
  logoImg.src = '/assets/logo.png';
  logoImg.alt = 'lendNborrow logo';
  logoWrap.appendChild(logoImg);

  const brandText = document.createElement('span');
  brandText.className = `${classPrefix}-brand-text`;
  brandText.append('lend');
  const accentSpan = document.createElement('span');
  accentSpan.className = 'accent';
  accentSpan.textContent = 'N';
  brandText.appendChild(accentSpan);
  brandText.append('borrow');

  return { logoWrap, brandText };
}

function createSectionLabel(text) {
  const label = document.createElement('div');
  label.className = 'sidebar-section-label';
  const span = document.createElement('span');
  span.textContent = text;
  label.appendChild(span);
  return label;
}

function isRouteActive(currentPath, href) {
  if (href === '/') {
    return currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '/index';
  }
  const slug = href.replace('.html', '');
  return currentPath.includes(slug);
}

function createPageTopHeader() {
  const banner = document.createElement('div');
  banner.className = 'page-top-header';
  banner.id = 'page-top-header';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'University campus header');

  const bgImg = document.createElement('img');
  bgImg.src = '/assets/BSU-header.jpg';
  bgImg.alt = 'BatStateU Alangilan STEER Hub building';
  bgImg.className = 'page-top-header-img';
  banner.appendChild(bgImg);

  const overlay = document.createElement('div');
  overlay.className = 'page-top-header-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  banner.appendChild(overlay);

  const content = document.createElement('div');
  content.className = 'page-top-header-content';

  const identity = document.createElement('div');
  identity.className = 'page-top-header-identity';

  const uniTitle = document.createElement('span');
  uniTitle.className = 'page-top-header-title';
  uniTitle.textContent = 'Batangas State University';
  identity.appendChild(uniTitle);

  const uniSub = document.createElement('span');
  uniSub.className = 'page-top-header-sub';
  uniSub.textContent = 'The National Engineering University · Alangilan Campus';
  identity.appendChild(uniSub);

  content.appendChild(identity);

  banner.appendChild(content);
  return banner;
}

/**
 * Initializes the global persistent left-hand sidebar, mobile drawer, top campus header, and user auth footer.
 */
export async function initLayout() {
  if (document.getElementById('sidebar-drawer')) return;

  const headerPlaceholder = document.querySelector('header.hdr, #header, #navbar');
  const mainEl = document.querySelector('main.main-content, main');
  if (!headerPlaceholder && !mainEl) return;

  if (mainEl) {
    if (!mainEl.id) mainEl.id = 'main-content';
    if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
    if (!document.getElementById('page-top-header')) {
      mainEl.prepend(createPageTopHeader());
    }
  }

  const currentPath = window.location.pathname;

  // Skip link for keyboard navigation
  if (mainEl && !document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = `#${mainEl.id}`;
    skipLink.className = 'skip-link visually-hidden';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
  }

  // 1. Mobile Top Bar (visible <= 768px)
  const mobileHeader = document.createElement('header');
  mobileHeader.className = 'mobile-hdr';
  mobileHeader.id = 'mobile-header';

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.id = 'sidebar-open-btn';
  openBtn.className = 'mobile-menu-btn';
  openBtn.setAttribute('aria-label', 'Open menu');
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.setAttribute('aria-controls', 'sidebar-drawer');
  openBtn.appendChild(ICONS.menu());
  mobileHeader.appendChild(openBtn);

  const mobileBrandLink = document.createElement('a');
  mobileBrandLink.href = '/';
  mobileBrandLink.className = 'mobile-brand';
  const mobileBrandParts = createBrandContent('mobile');
  mobileBrandLink.appendChild(mobileBrandParts.logoWrap);
  mobileBrandLink.appendChild(mobileBrandParts.brandText);
  mobileHeader.appendChild(mobileBrandLink);

  // 2. Sidebar Drawer Container (acts as persistent sidebar on desktop, swipeable modal drawer on mobile)
  const drawer = document.createElement('div');
  drawer.className = 'sidebar-drawer';
  drawer.id = 'sidebar-drawer';
  drawer.setAttribute('popover', 'manual');
  drawer.setAttribute('aria-label', 'Navigation menu');

  const scroller = document.createElement('div');
  scroller.className = 'sidebar-scroller';

  const sheet = document.createElement('aside');
  sheet.className = 'sidebar-sheet';
  sheet.setAttribute('aria-label', 'Sidebar');

  // 2a. Top Brand Header
  const brandRow = document.createElement('div');
  brandRow.className = 'sidebar-brand-row';

  const brandLink = document.createElement('a');
  brandLink.href = '/';
  brandLink.id = 'sidebar-brand-link';
  brandLink.className = 'sidebar-brand';
  const brandParts = createBrandContent('sidebar');
  brandLink.appendChild(brandParts.logoWrap);
  brandLink.appendChild(brandParts.brandText);
  brandRow.appendChild(brandLink);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.id = 'sidebar-close-btn';
  closeBtn.className = 'sidebar-close-btn';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.setAttribute('autofocus', '');
  closeBtn.appendChild(ICONS.close());
  brandRow.appendChild(closeBtn);

  sheet.appendChild(brandRow);

  // 2b. Primary Navigation Tabs (in exact required order)
  const primaryNav = document.createElement('nav');
  primaryNav.className = 'sidebar-nav';
  primaryNav.setAttribute('aria-label', 'Primary');
  primaryNav.appendChild(createSectionLabel('Main Menu'));

  const primaryList = document.createElement('ul');
  primaryList.className = 'sidebar-menu';

  const primaryTabs = [
    { href: '/dashboard.html', text: 'Dashboard', icon: ICONS.dashboard },
    { href: '/browse.html', text: 'Browse Catalog', icon: ICONS.browse },
    { href: '/my-listings.html', text: 'My Listings', icon: ICONS.listings },
    { href: '/my-borrows.html', text: 'My Borrowed Items', icon: ICONS.borrows }
  ];

  primaryTabs.forEach((tab) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = tab.href;
    a.className = 'sidebar-link';

    if (isRouteActive(currentPath, tab.href)) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }

    a.appendChild(tab.icon());
    const labelSpan = document.createElement('span');
    labelSpan.textContent = tab.text;
    a.appendChild(labelSpan);

    li.appendChild(a);
    primaryList.appendChild(li);
  });

  primaryNav.appendChild(primaryList);
  sheet.appendChild(primaryNav);

  // 2c. Prominent Action Button ("List an Item")
  const actionSection = document.createElement('div');
  actionSection.className = 'sidebar-action-section';
  actionSection.appendChild(createSectionLabel('Quick Action'));

  const listBtn = document.createElement('a');
  listBtn.href = '/listing-form.html';
  listBtn.id = 'sidebar-list-btn';
  listBtn.className = 'sidebar-cta-btn';
  if (isRouteActive(currentPath, '/listing-form.html')) {
    listBtn.classList.add('active');
    listBtn.setAttribute('aria-current', 'page');
  }
  listBtn.appendChild(ICONS.plus());
  const listLabel = document.createElement('span');
  listLabel.textContent = 'List an Item';
  listBtn.appendChild(listLabel);

  actionSection.appendChild(listBtn);
  sheet.appendChild(actionSection);

  // 2d. Bottom Footer Section (pinned with margin-top: auto)
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';

  const accountNav = document.createElement('nav');
  accountNav.className = 'sidebar-account-nav';
  accountNav.setAttribute('aria-label', 'Account');
  accountNav.appendChild(createSectionLabel('Account'));

  const accountList = document.createElement('ul');
  accountList.className = 'sidebar-menu';

  const profileLi = document.createElement('li');
  const profileLink = document.createElement('a');
  profileLink.href = '/profile.html';
  profileLink.className = 'sidebar-link';
  if (isRouteActive(currentPath, '/profile.html')) {
    profileLink.classList.add('active');
    profileLink.setAttribute('aria-current', 'page');
  }
  profileLink.appendChild(ICONS.profile());
  const profileSpan = document.createElement('span');
  profileSpan.textContent = 'Profile';
  profileLink.appendChild(profileSpan);
  profileLi.appendChild(profileLink);
  accountList.appendChild(profileLi);

  accountNav.appendChild(accountList);
  footer.appendChild(accountNav);

  // Auth slot (populated dynamically from active Supabase session via getMe)
  const authSlot = document.createElement('div');
  authSlot.id = 'sidebar-auth-slot';
  authSlot.className = 'sidebar-auth-slot';
  authSlot.setAttribute('aria-live', 'polite');

  const skeleton = document.createElement('div');
  skeleton.className = 'sidebar-auth-skeleton';
  skeleton.setAttribute('aria-hidden', 'true');
  authSlot.appendChild(skeleton);

  footer.appendChild(authSlot);
  sheet.appendChild(footer);

  scroller.appendChild(sheet);
  drawer.appendChild(scroller);

  // Mount into page shell
  if (headerPlaceholder && headerPlaceholder.parentNode) {
    headerPlaceholder.parentNode.insertBefore(mobileHeader, headerPlaceholder);
    headerPlaceholder.parentNode.insertBefore(drawer, headerPlaceholder);
    headerPlaceholder.remove();
  } else if (mainEl && mainEl.parentNode) {
    mainEl.parentNode.insertBefore(mobileHeader, mainEl);
    mainEl.parentNode.insertBefore(drawer, mainEl);
  }

  // 3. Responsive Drawer Behavior (mobile <= 768px)
  const mobileMq = window.matchMedia('(max-width: 768px)');
  const supportsScrollInitialTarget = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('scroll-initial-target', 'nearest');
  const supportsAnimationTimeline = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: scroll()');

  function syncDrawerMode(isMobile) {
    if (isMobile) {
      drawer.setAttribute('role', 'dialog');
    } else {
      if (drawer.matches(':popover-open')) {
        drawer.hidePopover();
      }
      if (mobileHeader) mobileHeader.inert = false;
      if (mainEl) mainEl.inert = false;
      drawer.removeAttribute('role');
      drawer.removeAttribute('aria-modal');
      drawer.style.removeProperty('--drawer-backdrop');
      openBtn.setAttribute('aria-expanded', 'false');
    }
  }

  let isOpening = false;

  async function openDrawer() {
    if (!mobileMq.matches) return;
    isOpening = true;
    drawer.setAttribute('role', 'dialog');
    drawer.showPopover();
    if (mobileHeader) mobileHeader.inert = true;
    if (mainEl) mainEl.inert = true;
    openBtn.setAttribute('aria-expanded', 'true');

    if (!supportsScrollInitialTarget) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    }

    drawer.setAttribute('aria-modal', 'true');
    scroller.scrollTo({ left: 0, behavior: 'auto' });
  }

  function closeDrawer() {
    isOpening = false;
    if (!drawer.matches(':popover-open')) return;
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  }

  function onDrawerOpened() {
    isOpening = false;
    openBtn.setAttribute('aria-expanded', 'true');
  }

  function onDrawerClosed() {
    if (isOpening || !drawer.hasAttribute('aria-modal')) return;
    if (drawer.matches(':popover-open')) {
      drawer.hidePopover();
    }
    if (mobileHeader) mobileHeader.inert = false;
    if (mainEl) mainEl.inert = false;
    drawer.removeAttribute('aria-modal');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
  }

  const visibleThreshold = 1 / Math.max(window.innerWidth, 320);
  const observer = new IntersectionObserver(
    (entries) => {
      if (!mobileMq.matches) return;
      const entry = entries.at(-1);
      if (!entry) return;
      if (entry.intersectionRatio < visibleThreshold) onDrawerClosed();
      if (entry.intersectionRatio === 1) onDrawerOpened();
    },
    { root: drawer, threshold: [visibleThreshold, 1] }
  );
  observer.observe(sheet);

  if (!supportsAnimationTimeline) {
    scroller.addEventListener('scroll', () => {
      if (!mobileMq.matches || !sheet.offsetWidth) return;
      const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / sheet.offsetWidth));
      drawer.style.setProperty('--drawer-backdrop', String(ratio));
    });
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', (event) => {
    if (mobileMq.matches && !sheet.contains(event.target)) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMq.matches && drawer.hasAttribute('aria-modal')) {
      closeDrawer();
    }
  });

  syncDrawerMode(mobileMq.matches);
  mobileMq.addEventListener('change', (event) => syncDrawerMode(event.matches));

  // 4. Hydrate Authenticated User State from active Supabase session
  let currentUser = null;
  try {
    currentUser = await getMe(true);
  } catch (err) {
    currentUser = null;
  }

  brandLink.href = currentUser ? '/dashboard.html' : '/';
  mobileBrandLink.href = currentUser ? '/dashboard.html' : '/';
  listBtn.href = currentUser ? '/listing-form.html' : '/signin.html?redirect=%2Flisting-form.html';

  renderSidebarAuth(authSlot, currentUser);
}

function renderSidebarAuth(authSlot, currentUser) {
  authSlot.replaceChildren();

  if (currentUser) {
    const displayName = currentUser.full_name?.trim() || currentUser.email?.split('@')[0] || 'Student';
    const subText = currentUser.college
      ? `${currentUser.college} · ${currentUser.campus || 'Alangilan'}`
      : (currentUser.email || 'BatStateU Student');

    const userCard = document.createElement('div');
    userCard.className = 'sidebar-user-card';

    const userRow = document.createElement('div');
    userRow.className = 'sidebar-user-row';

    const avatar = document.createElement('span');
    avatar.className = 'sidebar-user-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = displayName[0].toUpperCase();
    userRow.appendChild(avatar);

    const meta = document.createElement('div');
    meta.className = 'sidebar-user-meta';

    const nameEl = document.createElement('div');
    nameEl.className = 'sidebar-user-name';
    nameEl.textContent = displayName;
    meta.appendChild(nameEl);

    const subEl = document.createElement('div');
    subEl.className = 'sidebar-user-sub';
    subEl.textContent = subText;
    meta.appendChild(subEl);

    userRow.appendChild(meta);
    userCard.appendChild(userRow);

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.id = 'sidebar-signout-btn';
    logoutBtn.className = 'sidebar-signout-btn';
    logoutBtn.appendChild(ICONS.signOut());
    const signOutLabel = document.createElement('span');
    signOutLabel.textContent = 'Sign Out';
    logoutBtn.appendChild(signOutLabel);
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      await logout();
    });

    userCard.appendChild(logoutBtn);
    authSlot.appendChild(userCard);
  } else {
    const signInLink = document.createElement('a');
    signInLink.href = '/signin.html';
    signInLink.id = 'sidebar-signin-btn';
    signInLink.className = 'sidebar-signin-btn';
    signInLink.appendChild(ICONS.signIn());
    const signInLabel = document.createElement('span');
    signInLabel.textContent = 'Sign In';
    signInLink.appendChild(signInLabel);
    authSlot.appendChild(signInLink);
  }
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
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close dialog');
  closeBtn.addEventListener('click', () => backdrop.remove());
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';

  if (message) {
    const msgP = document.createElement('p');
    msgP.className = isPrompt ? 'modal-intro' : '';
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
