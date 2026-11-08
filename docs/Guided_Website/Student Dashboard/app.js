(function () {
  'use strict';

  const KEY = 'lendnborrow_state_v2';
  const DOMAIN = '@g.batstate-u.edu.ph';
  const ADMIN = 'admin' + DOMAIN;
  const DEMO = 'sr' + DOMAIN;
  const MAX_ACTIVE = 5;
  const COLLEGES = ['CICS', 'COE', 'CAFAD', 'CET', 'CAS'];
  const CATEGORIES = ['Electronics', 'Tool', 'Art materials', 'Engineering tools', 'Lab'];
  const CONDITIONS = ['Brand new', 'Like new', 'Good', 'Fair'];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const todayISO = () => iso(new Date());
  const plus = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const fmt = d => d ? new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
  const fieldVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const ago = t => { if (!t) return 'Earlier'; const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'Just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; };
  const ph = it => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#F8E5E3"/><rect x="130" y="60" width="140" height="140" rx="24" fill="#8E1B24"/><text x="200" y="152" font-family="Arial" font-size="72" font-weight="700" fill="#fff" text-anchor="middle">' + esc(((it && it.name) || '?')[0].toUpperCase()) + '</text><text x="200" y="250" font-family="Arial" font-size="22" fill="#8E1B24" text-anchor="middle">' + esc((it && it.name) || '') + '</text></svg>');
  const imgOf = (it, n = 0) => (it && it.images && it.images[n]) || ph(it);
  const initials = u => (displayName(u) || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const avBg = u => { const p = u.avatar || u.idPhoto; return p ? `style="background:#fff url('${p}') center/cover"` : `style="background:#fff url('assets/logo.png') center/72% no-repeat"`; };
  const avIni = u => '';

  function readImage(file, cb, max = 700) {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.8));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }


  let S;
  function seed() {
    const u = (email, name, id, college, credit, extra = {}) => Object.assign({
      email, name, studentId: id, college, campus: 'Alangilan', contact: '0917 000 0000',
      status: 'active', role: 'student', credit, onTime: 0, log: [], idPhoto: null
    }, extra);
    const users = {};
    users[ADMIN] = u(ADMIN, 'Campus Admin', '00-00000', 'CICS', 5, { role: 'admin' });
    return { users, items: [], requests: [], notifs: [], messages: [], session: null, outcomes: { ontime: 0, late: 0, lost: 0 } };
  }
  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
    if (!S || !S.users) S = seed();
    S.messages = S.messages || []; S.notifs = S.notifs || [];
  }

  const SYNC = /^https?:$/.test(location.protocol);
  let lastPush = 0, lastSeen = '';
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast('Storage is full — try a smaller photo.'); }
    if (SYNC) {
      lastPush = Date.now();
      const body = JSON.stringify(Object.assign({}, S, { session: null })); lastSeen = body;
      fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body, keepalive: body.length < 60000 }).catch(() => { });
    }
  }
  function pull(force, silent) {
    if (!SYNC || (!force && Date.now() - lastPush < 2000)) return Promise.resolve();
    return fetch('/api/state', { cache: 'no-store' }).then(r => r.ok ? r.text() : null).then(t => {
      if (t === null) { if (S && S.users) save(); return; }          // server empty: publish what we have
      if (t === lastSeen) return;
      const d = JSON.parse(t); if (!d || !d.users) return;
      lastSeen = t; const session = S.session; S = d; S.session = session; S.messages = S.messages || []; S.notifs = S.notifs || [];
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
      if (silent) return;
      const a = document.activeElement, nm = location.hash.slice(1).split('/')[0];
      if (nm === 'messages' && a && a.id === 'msg-text') refreshChat();
      else if (force || !((a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || document.getElementById('authm') || document.getElementById('reqm'))) route();
    }).catch(() => { });
  }

  const me = () => S.session ? S.users[S.session] : null;
  const user = e => S.users[e] || { name: 'Unknown', college: '—', credit: 0 };
  const item = id => S.items.find(i => i.id === +id);
  const reqOf = id => S.requests.find(r => r.id === +id);
  const firstName = u => { const p = (u.name || '').split(','); return (p[1] || p[0] || '').trim().split(' ')[0] || 'student'; };
  const displayName = u => { const p = (u.name || '').split(','); return p[1] ? p[1].trim() + ' ' + p[0].trim() : p[0]; };
  const isBusy = id => S.requests.some(r => r.itemId === id && (r.status === 'approved' || r.status === 'borrowing'));
  const isOverdue = r => r.status === 'borrowing' && r.ret < todayISO();
  const activeBorrows = e => S.requests.filter(r => r.borrower === e && r.status === 'borrowing').length;
  const live = () => S.items.filter(i => !i.deleted);
  const activeListings = e => live().filter(i => i.owner === e).length;
  const pendingIncoming = e => S.requests.filter(r => r.owner === e && r.status === 'pending');
  const credit = n => (Math.round(n * 10) / 10).toFixed(1);
  function notify(to, text) { S.notifs.unshift({ id: Date.now() + Math.random(), to, text, t: Date.now() }); }
  function addCredit(email, delta, text) {
    const u = user(email); if (!S.users[email]) return;
    u.credit = Math.max(0, Math.min(5, u.credit + delta));
    u.log.unshift({ text, delta, when: 'This week', t: Date.now() });
    if (u.credit < 2.5 && u.status === 'active') { u.status = 'locked'; notify(email, 'Your account was locked: credit score fell below 2.5.'); }
  }

  let toastTimer;
  function toast(msg, label) {
    const t = $('#toast');
    t.innerHTML = (label ? '<b>' + esc(label) + '</b>' : '') + esc(msg);
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
  }

  const go = h => { if (location.hash === '#' + h) route(); else location.hash = h; };
  function homeFor(u) {
    if (!u) return 'landing';
    if (u.role === 'admin') return 'admin-queue';
    if (u.status === 'new') return 'onboarding';
    if (u.status === 'active') return u.justVerified ? 'status' : 'dashboard';
    if (u.status === 'pending') return 'dashboard';
    return 'status';
  }
  const PUBLIC = ['landing', 'signin', 'signup'];
  function route() {
    let [name, arg] = (location.hash.slice(1) || 'landing').split('/');
    const u = me();
    if (!u && !PUBLIC.includes(name)) return go('landing');
    if (u && !PUBLIC.includes(name)) {
      if (u.role === 'admin') { if (!name.startsWith('admin')) return go('admin-queue'); }
      else if (name.startsWith('admin')) return go(homeFor(u));
      else if (u.status === 'new' && name !== 'onboarding') return go('onboarding');
      else if (u.status !== 'new' && u.status !== 'active' && u.status !== 'pending' && !['status', 'onboarding'].includes(name)) return go('status');
      else if (u.status === 'active' && (name === 'status' && !u.justVerified || name === 'onboarding')) return go('dashboard');
    }
    const view = VIEWS[name];
    if (!view) return go('landing');
    if (name !== 'create') draftPhotos = [];
    if (name !== 'profile') editing = false;
    renderHeader(name, u);
    { const rm = document.getElementById('reqm'); if (rm) rm.remove(); }
    $('#app').innerHTML = view(arg, u);
    window.scrollTo(0, 0);
    if (AFTER[name]) AFTER[name](arg, u);
  }

  const STUDENT_NAV = [['dashboard', 'Dashboard'], ['browse', 'Browse Items'], ['listings', 'My Listings'], ['borrows', 'My borrows'], ['messages', 'Messages']];
  const NAV_OF = { dashboard: 'dashboard', browse: 'browse', item: 'browse', create: 'listings', listings: 'listings', return: 'listings', viewreturned: 'borrows', location: 'borrows', borrows: 'borrows', profile: 'borrows', messages: 'messages' };
  const ADMIN_NAV = [['admin-queue', 'Verification queue'], ['admin-appeals', 'Appeals'], ['admin-analytics', 'Analytics']];
  const brand = '<button class="brand" data-go="landing"><img src="assets/logo.png" alt="">lendNborrow</button>';
  function renderHeader(name, u) {
    const h = $('#header');
    h.classList.remove('hidden');
    if (name === 'landing' || !u) {
      if (['signin', 'signup', 'onboarding', 'status'].includes(name)) { h.classList.add('hidden'); return; }
      h.innerHTML = brand + '<div class="hdr-right"><button class="btn-white" data-go="signin">Sign in with Google</button></div>';
    } else if (['signin', 'signup', 'onboarding', 'status'].includes(name)) {
      h.classList.add('hidden');
    } else if (u.role === 'admin') {
      h.innerHTML = brand + '<nav class="nav">' + ADMIN_NAV.map(n => `<a href="#${n[0]}" class="${n[0] === name ? 'active' : ''}">${n[1]}</a>`).join('') +
        '</nav><div class="hdr-right"><button class="btn-gold" data-act="signout">Sign out</button><button class="avatar" aria-label="Account" ' + avBg(u) + '></button></div>';
    } else {
      const cur = NAV_OF[name];
      h.innerHTML = brand + '<nav class="nav">' + STUDENT_NAV.map(n => `<a href="#${n[0]}" class="${n[0] === cur ? 'active' : ''}">${n[1]}${n[0] === 'messages' && unreadCount(u.email) ? `<b class="nbadge">${unreadCount(u.email)}</b>` : ''}</a>`).join('') +
        '</nav><div class="hdr-right"><button class="btn-gold" data-go="create">+ Create listing</button><button class="avatar" data-go="profile" aria-label="Profile" ' + avBg(u) + '></button></div>';
    }
  }

  const googleIcon = '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  const thumb = (it, cls = '') => `<img class="thumb ${cls}" src="${esc(imgOf(it))}" alt="${esc(it.name)}">`;
  const statusPill = r => {
    if (r.status === 'borrowing' && r.returnSent) return ['borrowing', 'Return sent', 'Waiting for the owner to confirm they received the item.'];
    if (isOverdue(r)) return ['overdue', 'Overdue', 'Return it soon. Late returns lower your credit score.'];
    return ({
      pending: ['pending', 'Pending', 'Waiting for the owner to respond.'],
      approved: ['available', 'Available', 'Pickup from the owner on your pickup date.'],
      borrowing: ['borrowing', 'Borrowing', 'Return to the owner by the return date.'],
      returned: ['returned', 'Returned', 'Return confirmed by the owner.'],
      rejected: ['rejected', 'Rejected', 'Reason from owner: ' + (r.reason || '—')]
    })[r.status];
  };

  const VIEWS = {};
  const AFTER = {};

  VIEWS.landing = () => `
    <section class="land-hero">
      <div>
        <span class="badge">BatStateU Alangilan · students only</span>
        <h1>Borrow what<br>you need.<br><span>Lend what you<br>don't.</span></h1>
        <p class="lead">Share books, tools and equipment with other students, with listings, requests and return tracking in one place.</p>
        <button class="btn-signup" data-act="signup">Sign Up</button>
        <p class="fine">Use your @g.batstate-u.edu.ph account. New accounts are verified with your student ID.</p>
      </div>
      <div class="hero-logo"><img src="assets/logo.png" alt="lendNborrow logo"><div class="tag">LEND. <b>BORROW.</b> CONNECT</div></div>
    </section>
    <section class="how">
      <h3>How it works</h3>
      <div class="steps">
        <div class="step"><small>Step 1</small><h4>Sign in and verify</h4><p>Use your BSU Google account and upload a photo of your student ID.</p></div>
        <div class="step"><small>Step 2</small><h4>List or browse</h4><p>Post items you can lend, or search what others have listed.</p></div>
        <div class="step"><small>Step 3</small><h4>Request, borrow, return</h4><p>Send a request, wait for approval, then return the item on time.</p></div>
      </div>
    </section>`;

  VIEWS.signin = () => `
    <div class="center-page"><div class="signin-card">
      <button class="brand" data-go="landing"><img src="assets/logo.png" alt="">lendNborrow</button>
      <h2>Sign in</h2>
      ${signinError ? `<div class="err">⚠ BSU Accounts only. Sign in with your ${DOMAIN} Google account.</div>` : '<p class="sub">Use your BatStateU Google account to continue.</p>'}
      <button class="gbtn" data-act="google">${googleIcon} Sign in with Google</button>
      ${signinError ? '' : `<p class="note">Only ${DOMAIN} accounts sign in.</p>`}
      <button class="link" data-go="landing">Back to landing page</button>
    </div></div>`;
  let signinError = false;

  VIEWS.onboarding = (a, u) => `
    <div class="onb">
      <div class="card left">
        <img class="logo" src="assets/logo.png" alt="">
        <h2>WELCOME SPARTAN!</h2>
        <h3>Your details</h3>
        <div class="fieldwrap"><label class="lbl">Full name</label><input class="field" id="ob-name" placeholder="Last name, first name, middle initial" value="${esc(u.name || '')}"></div>
        <div class="fieldwrap"><label class="lbl">Student ID number</label><div class="idwrap"><input class="field" id="ob-id" placeholder="e.g. 00-00000" autocomplete="off" value="${esc(u.studentId || '')}"><span class="sfx">${DOMAIN}</span></div></div>
        <div class="row2">
          <div class="fieldwrap"><label class="lbl">College</label><select class="field" id="ob-college"><option value="">Select College</option>${COLLEGES.map(c => `<option ${u.college === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="fieldwrap"><label class="lbl">Campus</label><input class="field" id="ob-campus" value="Alangilan" readonly></div>
        </div>
        <div class="fieldwrap"><label class="lbl">Contact number</label><input class="field" id="ob-contact" placeholder="09X XXX XXXX" value="${esc(u.contact && u.contact !== '0917 000 0000' ? u.contact : '')}"></div>
      </div>
      <div>
        <div class="card right panel" style="margin-bottom:16px">
          <h2>Student ID photo</h2>
          <label class="drop" id="ob-drop" for="ob-file" style="cursor:pointer">
            ${u.idPhoto ? `<img src="${u.idPhoto}" alt="">` : '<b>Upload a clear photo of your ID</b><small>choose file. no file chosen</small><span class="btn btn-out" style="padding:8px 22px;font-size:11px">Choose File</span>'}
          </label>
          <p class="note" style="margin:8px 0">Upload your ID to continue.</p>
          <div class="file-row"><input type="file" id="ob-file" accept="image/*"></div>
        </div>
        <div class="card panel">
          <label class="terms"><input type="checkbox" id="ob-terms"><span>I agree to the <a href="#onboarding">Terms of Use</a> and <a href="#onboarding">Privacy Policy</a></span></label>
          <div class="btn-row"><button class="btn btn-maroon" data-act="submit-verification">Submit for verification</button><button class="btn btn-out-dark" data-act="signout">Cancel</button></div>
        </div>
      </div>
    </div>`;
  let pendingIdPhoto = null;
  let signupPrefill = '';
  VIEWS.signup = () => VIEWS.onboarding(null, { studentId: signupPrefill });

  VIEWS.status = (a, u) => {
    let cls = 'gold', pill = 'Pending', pc = 'pending', title, text, btns;
    if (u.status === 'active') {
      return `<div class="status-wrap"><div class="scard green"><div class="in"><div><span class="pill active">Active</span><h3 style="margin-top:8px">You are verified</h3><p>Active accounts continue straight to the student dashboard</p></div><button class="btn btn-green" data-act="verified-continue">Go to dashboard</button></div></div></div>`;
    }
    if (u.status === 'pending') {
      title = 'Waiting for verification'; text = 'An admin is reviewing your student ID. Check back next time you sign in to see your new status.';
      btns = '<button class="btn btn-maroon" data-act="signout">Sign out</button><button class="btn btn-out" data-go="landing">Back to landing page</button>';
    } else if (u.status === 'rejected') {
      cls = 'maroon'; title = 'Verification rejected';
      text = 'Your student ID could not be verified. Resubmit a clearer photo, or sign out for now.' + (u.rejectReason ? ' Reason: ' + esc(u.rejectReason) : '');
      btns = '<button class="btn btn-maroon" data-act="resubmit">Resubmit ID photo</button><button class="btn btn-out" data-act="signout">Not now</button>';
    } else if (u.status === 'suspended') {
      pill = 'Suspended'; pc = 'suspended'; title = 'Account suspended';
      text = 'Your account is suspended. Contact an admin to find out why and how to get it restored.';
      btns = '<button class="btn btn-maroon" data-act="contact-admin">Contact admin</button><button class="btn btn-out" data-act="signout">Sign out</button>';
    } else {
      cls = 'maroon'; pill = 'Locked'; pc = 'locked'; title = 'Account permanently locked';
      text = 'Your credit score fell below 2.5. You can ask an admin to review your case.';
      btns = '<button class="btn btn-maroon" data-act="appeal">Submit an appeal</button><button class="btn btn-out" data-act="signout">Sign out</button>';
    }
    return `<div class="status-wrap"><div class="scard ${cls === 'maroon' ? '' : cls}"><div class="in"><span class="pill ${pc}">${pill}</span><div class="dot"></div><h3>${title}</h3><p>${text}</p><div class="btn-row">${btns}</div></div></div></div>`;
  };

  VIEWS.dashboard = (a, u) => {
    const ns = S.notifs.filter(n => n.to === u.email).slice(0, 6);
    return `
    <div class="dash">
      <aside class="notifs"><div class="inner"><span class="tag">Notifications</span>
        ${ns.map(n => `<div class="notif">${esc(n.text)}<span class="pill active">${ago(n.t)}</span></div>`).join('') || '<div class="notif">No notifications yet.</div>'}
      </div></aside>
      <section class="panel dash-main">
        ${u.status === 'pending' ? '<div class="vbanner"><span class="pill pending">Pending</span><div><b>Waiting for verification</b><br>An admin is reviewing your student ID. You can look around while you wait.</div><button class="btn btn-out" data-go="status">View status</button></div>' : ''}
        <h1>Welcome${u.status === 'pending' ? '' : ' back'}, ${esc(firstName(u))}.</h1>
        <div class="stats">
          <div class="stat"><div class="in"><span class="pill">Credit score</span><div class="num">${credit(u.credit)}</div><small>Out of 5.0. Below 2.5 locks your account</small></div></div>
          <div class="stat"><div class="in"><span class="pill">Active borrows</span><div class="num">${activeBorrows(u.email)}/${MAX_ACTIVE}</div><small>Total active borrows.</small></div></div>
          <div class="stat"><div class="in"><span class="pill">Active listing</span><div class="num">${activeListings(u.email)}/${MAX_ACTIVE}</div><small>Total active listing.</small></div></div>
          <div class="stat"><div class="in"><span class="pill">Pending request</span><div class="num">${pendingIncoming(u.email).length}</div><small>Your pending request.</small></div></div>
        </div>
        <h2>Where to?</h2>
        <div class="tiles">
          <div class="tile gold"><h3>Browse items</h3><p>Search what others are lending</p><button data-go="browse">Find an item</button></div>
          <div class="tile maroon"><h3>Create a listing</h3><p>Offer an item to other student.</p><button data-go="create">Start Listing</button></div>
          <div class="tile green"><h3>My request</h3><p>Offer an item to other student.</p><button data-go="listings">Request</button></div>
          <div class="tile gold"><h3>My borrows</h3><p>Track requests, due dates and returns.</p><button data-go="borrows">Borrows</button></div>
        </div>
      </section>
    </div>`;
  };

  const bf = { q: '', cat: '', avail: '', sort: 'newest', page: 1 };
  const PAGE = 8;
  VIEWS.browse = (a, u) => {
    let list = live().filter(i => {
      const q = bf.q.toLowerCase();
      if (q && !(i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))) return false;
      if (bf.cat && i.category !== bf.cat) return false;
      if (bf.avail === 'available' && isBusy(i.id)) return false;
      if (bf.avail === 'borrowed' && !isBusy(i.id)) return false;
      return true;
    });
    list.sort((x, y) => bf.sort === 'name' ? x.name.localeCompare(y.name) : bf.sort === 'oldest' ? x.created - y.created : y.created - x.created);
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    bf.page = Math.min(bf.page, pages);
    const view = list.slice((bf.page - 1) * PAGE, bf.page * PAGE);
    return `
    <div class="shell">
      <div class="filters">
        <div><label>Search</label><input class="field" id="f-q" placeholder="Search by item name or keyword" value="${esc(bf.q)}"></div>
        <div><label>Category</label><select class="field" id="f-cat"><option value="">All categories</option>${CATEGORIES.map(c => `<option ${bf.cat === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div><label>Availability</label><select class="field" id="f-avail"><option value="">All</option><option value="available" ${bf.avail === 'available' ? 'selected' : ''}>Available now</option><option value="borrowed" ${bf.avail === 'borrowed' ? 'selected' : ''}>Borrowed</option></select></div>
        <div><label>Sort by</label><select class="field" id="f-sort"><option value="newest" ${bf.sort === 'newest' ? 'selected' : ''}>Newest</option><option value="oldest" ${bf.sort === 'oldest' ? 'selected' : ''}>Oldest</option><option value="name" ${bf.sort === 'name' ? 'selected' : ''}>Name</option></select></div>
        <button class="btn btn-maroon" data-act="search">Search</button>
      </div>
      <div class="count-row"><span>Showing ${view.length} items</span><span>You have ${activeBorrows(u.email)} of ${MAX_ACTIVE} active borrows</span></div>
      <div class="grid">
        ${view.map(i => `
          <div class="card icard">
            <div class="img" data-go="item/${i.id}" style="cursor:pointer"><img src="${esc(imgOf(i))}" alt="${esc(i.name)}"></div>
            <div class="t"><b>${esc(i.name)}</b><span class="pill ${isBusy(i.id) ? 'borrowed' : 'available'}">${isBusy(i.id) ? 'Borrowed' : 'Available'}</span></div>
            <small>${esc(i.category)} · ${i.owner === u.email ? 'Your listing' : esc(displayName(user(i.owner)))}</small>
            ${i.owner === u.email ? `<button data-go="item/${i.id}">View Item</button>` : `<button data-go="item/${i.id}">Request to borrow</button>`}
          </div>`).join('') || '<p style="grid-column:1/-1;text-align:center;color:#777">No items match your search.</p>'}
      </div>
      <div class="pager">
        <button data-act="page" data-p="${Math.max(1, bf.page - 1)}">PREV</button>
        ${Array.from({ length: pages }, (_, k) => `<button class="${k + 1 === bf.page ? 'cur' : ''}" data-act="page" data-p="${k + 1}">${k + 1}</button>`).join('')}
        <button data-act="page" data-p="${Math.min(pages, bf.page + 1)}">NEXT</button>
      </div>
    </div>`;
  };

  VIEWS.item = (id, u) => {
    const i = item(id); if (!i) return '<p>Item not found.</p>';
    const owner = user(i.owner), mine = i.owner === u.email, busy = isBusy(i.id);
    const imgs = i.images;
    return `
    <div class="shell">
      <p class="crumb"><a href="#browse">Brows items</a> / ${esc(i.name)}</p>
      <div class="detail">
        <div>
          <div class="gal-main"><img id="gal-main" src="${esc(imgOf(i))}" alt="${esc(i.name)}"></div>
          ${imgs.length > 1 ? `<div class="gal-th">${imgs.slice(0, 4).map(s => `<button data-act="gal" data-src="${esc(s)}"><img src="${esc(s)}" alt=""></button>`).join('')}</div>` : ''}
          <div class="card desc"><h3>Description</h3><p style="font-size:14px">${esc(i.description)}</p></div>
        </div>
        <div>
          <span class="pill ${busy ? 'borrowed' : 'available'}">${busy ? 'Borrowed' : 'Available'}</span>
          <h1>${esc(i.name)}</h1>
          <div class="meta">${esc(i.category)} · Condition: ${esc(i.condition)}<br><span>Pickup</span>${esc(i.pickup)}<br><span>Max borrow period</span>${i.maxDays} days</div>
          <div class="card owner"><i ${owner.email === u.email ? avBg(u) : ''}>${owner.email === u.email ? avIni(u) : esc(initials(owner))}</i><div><b>${esc(displayName(owner))}</b><small>${esc(owner.college)} · <b>Credit score ${credit(owner.credit)}</b></small></div>${mine ? '' : `<button class="btn btn-out-green" style="margin-left:auto;padding:6px 14px;font-size:12px" data-go="messages/${esc(owner.email)}">Message owner</button>`}</div>
          <div class="card reqbox${mine ? ' own' : ''}">
            <h3>${mine ? 'Your listing' : 'Request to borrow'}</h3>
            ${!mine && busy ? '<p class="help" style="color:#9A6B00">This item is currently borrowed. You can still send a request; the owner decides when to approve it.</p>' : ''}
            ${mine ? `<p class="ownnote">You can only borrow items listed by other students. This item is yours.</p><div class="btn-row" style="justify-content:flex-start"><button class="btn btn-out-dark" data-go="create/${i.id}">Edit listing</button><button class="btn btn-out-green" data-go="browse">Back to browse</button></div>` : ''}
            <div class="row2">
              <div><label class="lbl" style="font-size:10px">Pickup date</label><input class="field" type="date" id="rq-pick" min="${todayISO()}"></div>
              <div><label class="lbl" style="font-size:10px">Return date</label><input class="field" type="date" id="rq-ret" min="${todayISO()}"></div>
            </div>
            <label class="lbl" style="font-size:10px;margin-top:12px">Message to owner (optional)</label>
            <textarea class="field" id="rq-msg" style="min-height:110px"></textarea>
            <p class="help">You have ${activeBorrows(u.email)} of ${MAX_ACTIVE} active borrows. Return date must be within the owner's maximum borrow period.</p>
            <div class="btn-row" style="justify-content:flex-start">
              <button class="btn btn-green" data-act="send-request" data-id="${i.id}" ${mine || i.deleted ? 'disabled' : ''}>Send borrowing request</button>
              <button class="btn btn-out-green" data-go="browse">Back to browse</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  };

  let draftPhotos = [];
  VIEWS.create = (id, u) => {
    const i = id ? item(id) : null;
    if (i && draftPhotos.length === 0) draftPhotos = i.images.slice();
    const photo = n => draftPhotos[n] ? `<img src="${draftPhotos[n]}" alt="">` : '';
    return `
    <div class="shell">
      <div class="sub-line"><span>Share a item other students can request to borrow.</span><span>Active listings: ${activeListings(u.email)}/${MAX_ACTIVE}</span></div>
      <div class="create">
        <div class="card photo">
          <h3>Photo</h3>
          <div class="drop big" id="cl-main">${photo(0)}</div>
          <div class="thumbs"><div class="drop">${photo(1)}</div><div class="drop">${photo(2)}</div><div class="drop">${photo(3)}</div></div>
          <h3 style="font-size:14px">Add photos</h3>
          <div class="file-row"><input type="file" id="cl-files" accept="image/*" multiple></div>
        </div>
        <div class="card detailsbox">
          <h3>Item details</h3>
          <div class="fieldwrap"><label class="lbl" style="font-size:10px">Item name</label><input class="field" id="cl-name" placeholder="e.g. Scientific calculator" value="${esc(i ? i.name : '')}"></div>
          <div class="row2">
            <div class="fieldwrap"><label class="lbl" style="font-size:10px">Category</label><select class="field" id="cl-cat"><option value="">Select category</option>${CATEGORIES.map(c => `<option ${i && i.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            <div class="fieldwrap"><label class="lbl" style="font-size:10px">Condition</label><select class="field" id="cl-cond">${CONDITIONS.map(c => `<option ${(i ? i.condition : 'Like new') === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          </div>
          <div class="fieldwrap"><label class="lbl" style="font-size:10px">Description</label><textarea class="field" id="cl-desc" style="min-height:90px">${esc(i ? i.description : '')}</textarea></div>
          <div class="row2">
            <div class="fieldwrap"><label class="lbl" style="font-size:10px">Maximum borrow period</label><input class="field" id="cl-max" placeholder="3 days" value="${i ? i.maxDays + ' days' : ''}"></div>
            <div class="fieldwrap"><label class="lbl" style="font-size:10px">Pickup Location</label><input class="field" id="cl-loc" placeholder="Building or area on campus" value="${esc(i ? i.pickup : '')}"></div>
          </div>
          <p class="hint" id="cl-hint">Validation example: "Add an item name and category to publish"</p>
          <div class="btn-row" style="justify-content:flex-start"><button class="btn btn-green" data-act="publish" data-id="${i ? i.id : ''}">Publish listing</button><button class="btn btn-out-green" data-act="cancel-create">Cancel</button></div>
        </div>
      </div>
    </div>`;
  };

  VIEWS.listings = (a, u) => {
    const incoming = pendingIncoming(u.email);
    const lent = S.requests.filter(r => r.owner === u.email && r.status === 'borrowing');
    const mine = live().filter(i => i.owner === u.email);
    const info = (r, extra) => { const b = user(r.borrower); return `<div class="info"><b>${esc(item(r.itemId).name)}</b><small>${esc(displayName(b))}, ${esc(b.college)} · Credit score ${credit(b.credit)}</small><small>Pickup ${fmt(r.pickup)} · Return ${fmt(r.ret)}</small>${r.message ? `<small>"${esc(r.message)}"</small>` : ''}</div>`; };
    return `
    <div class="shell"><div class="stack">
      <div class="group"><h3>Incoming requests (${incoming.length})</h3>
        ${incoming.map(r => `<div class="lrow" id="row-${r.id}">${thumb(item(r.itemId), 'sq')}${info(r)}<span class="pill pending">Pending</span>
          <div class="acts"><button class="btn btn-out-dark" data-go="messages/${esc(r.borrower)}">Message</button><button class="btn btn-out-dark" data-act="view-request" data-id="${r.id}">View request</button><button class="btn btn-green" data-act="approve" data-id="${r.id}">Approve</button><button class="btn btn-out" data-act="reject" data-id="${r.id}">Reject</button></div></div>`).join('')}
        <p class="hint-line">Rejecting opens a short reason field so the borrower knows why</p>
      </div>
      <div class="group"><h3>Borrows (${lent.length}/${MAX_ACTIVE})</h3>
        ${lent.map(r => `<div class="lrow">${thumb(item(r.itemId), 'sq')}${info(r)}<span class="pill ${r.returnSent ? 'pending' : isOverdue(r) ? 'overdue' : 'borrowed'}">${r.returnSent ? 'Borrower returned it' : isOverdue(r) ? 'Overdue' : 'Borrowed'}</span>
          <div class="acts"><button class="btn btn-out-dark" data-go="messages/${esc(r.borrower)}">Message</button><button class="btn btn-green" data-go="return/${r.id}">Mark as returned</button><button class="btn btn-out-green" data-go="item/${r.itemId}">View</button></div></div>`).join('')}
      </div>
      <div class="group"><h3>My Listings (${mine.length}/${MAX_ACTIVE}) <button class="btn-new" data-go="create">+ new listing</button></h3>
        ${mine.map(i => `<div class="lrow">${thumb(i, 'sq')}<div class="info"><b>${esc(i.name)}</b><small>${esc(i.category)} · Condition: ${esc(i.condition)}</small><small>Pickup ${esc(i.pickup)} · Max ${i.maxDays} days</small></div>
          <span class="pill ${isBusy(i.id) ? 'borrowed' : 'available'}">${isBusy(i.id) ? 'Borrowed' : 'Available'}</span><div class="acts"><button class="btn btn-out-dark" data-go="create/${i.id}">Edit</button><button class="btn btn-red" data-act="delete-listing" data-id="${i.id}">Delete</button></div></div>`).join('')}
      </div>
    </div></div>`;
  };

  let returnPhoto = null;
  VIEWS.return = (id) => {
    const r = reqOf(id); if (!r) return '<p>Not found.</p>';
    const b = user(r.borrower), it = item(r.itemId);
    return `
    <div class="shell"><div class="blush pad-pink"><div class="retbox">
      <div>
        <div class="top">${thumb(it)}<div><b style="font-size:12px;font-weight:600">${esc(it.name)}</b><small>${esc(displayName(b))}, ${esc(b.college)} · Credit score ${credit(b.credit)}</small><small>Pickup ${fmt(r.pickup)} · Return ${fmt(r.ret)}</small></div></div>
        <label class="lbl">Item status</label><input class="field" id="rt-status" placeholder="e.g. Damage, Lost">
        <label class="lbl">Rate ${esc(displayName(b))}</label><input class="field" id="rt-rate" placeholder="e.g. 5">
      </div>
      <div class="center">
        <label class="drop" for="rt-file" style="height:130px;cursor:pointer" id="rt-drop"></label>
        <input type="file" id="rt-file" accept="image/*" class="hidden">
        <p class="cap">Returned Photo</p>
        <button class="btn btn-green" style="padding:12px 50px;font-size:15px" data-act="confirm-return" data-id="${r.id}">Returned</button>
      </div>
    </div></div></div>`;
  };

  VIEWS.viewreturned = (id, u) => {
    const r = reqOf(id); if (!r || r.status !== 'returned' || (r.borrower !== u.email && r.owner !== u.email)) return '<div class="shell"><p>Return record not found.</p></div>';
    const b = user(r.borrower), o = user(r.owner), it = item(r.itemId), asOwner = r.owner === u.email;
    return `
    <div class="shell"><div class="blush pad-pink"><div class="retbox">
      <div>
        <div class="top">${thumb(it)}<div><b style="font-size:12px;font-weight:600">${esc(it.name)}</b><small>${esc(displayName(b))}, ${esc(b.college)} · Credit score ${credit(b.credit)}</small><small>Pickup ${fmt(r.pickup)} · Return ${fmt(r.ret)}</small></div></div>
        <label class="lbl">Item status</label><input class="field" value="${esc(r.itemStatus || 'Returned in good condition')}" readonly>
        <label class="lbl">${asOwner ? 'Rate ' + esc(displayName(b)) : 'Rating from ' + esc(displayName(o))}</label><input class="field" value="${esc(r.rating || 'No rating given')}" readonly>
      </div>
      <div class="center">
        <div class="drop" style="height:130px">${r.returnedPhoto ? `<img src="${r.returnedPhoto}" alt="Returned photo">` : '<small>No photo uploaded</small>'}</div>
        <p class="cap">Returned Photo</p>
        <button class="btn btn-green" style="padding:12px 50px;font-size:15px" data-go="${asOwner ? 'listings' : 'borrows'}">Returned</button>
      </div>
    </div></div></div>`;
  };

  let pin = { x: 44.5, y: 63.5 };
  VIEWS.location = (id) => `
    <div class="loc">
      <div class="l">
        <span class="pill">Approve</span>
        <h2>Add your Location</h2>
        <p>Enter your address so other students can identify your item pickup location.</p>
        <div class="fieldwrap"><label class="lbl" style="font-size:10px">Location Name</label><input class="field" id="lc-name" placeholder="e.g. My Home, Campus Pickup"></div>
        <div class="fieldwrap"><label class="lbl" style="font-size:10px">Region / Province / City</label><select class="field" id="lc-city"><option value="">Select your location</option><option>Batangas City</option><option>Lipa City</option><option>Tanauan City</option><option>Santo Tomas</option></select></div>
        <div class="fieldwrap"><label class="lbl" style="font-size:10px">Postal Code</label><input class="field" id="lc-zip"></div>
        <div class="fieldwrap"><label class="lbl" style="font-size:10px">Street Address</label><input class="field" id="lc-street" placeholder="Street Name, Building, House No."></div>
        <div class="fieldwrap"><label class="lbl" style="font-size:10px">Location Type</label><select class="field" id="lc-type"><option value="">Select: Home / Campus / Other</option><option>Home</option><option>Campus</option><option>Other</option></select></div>
        <button class="btn btn-maroon" data-act="save-location" data-id="${id}">Save Location</button>
        <div class="foot"><img src="assets/logo.png" alt=""><div>LEND. BORROW. CONNECT</div></div>
      </div>
      <div class="r">
        <button class="btn-use" data-act="use-location">📍 Use My Current Location</button>
        <div class="map" id="map"><img src="assets/map.jpg" alt="Map"><span class="pin" id="pin" style="left:${pin.x}%;top:${pin.y}%"></span></div>
        <h3>Select your pickup location on the map</h3>
        <small>Move the map or select a pin to choose your location.</small>
      </div>
    </div>`;

  let bTab = 'all';
  VIEWS.borrows = (a, u) => {
    const mine = S.requests.filter(r => r.borrower === u.email).sort((x, y) => y.created - x.created);
    const list = mine.filter(r => bTab === 'all' || (bTab === 'requested' ? ['pending', 'approved', 'borrowing', 'rejected'].includes(r.status) : r.status === 'returned'));
    return `
    <div class="shell"><div class="blush" style="min-height:520px">
      <div class="chips">${[['all', 'All'], ['requested', 'Requested'], ['returned', 'Returned']].map(t => `<button class="${bTab === t[0] ? 'on' : ''}" data-act="btab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
      ${list.map(r => {
      const it = item(r.itemId), o = user(r.owner), p = statusPill(r);
      return `<div class="lrow">${thumb(it, 'sq')}<div class="info"><b>${esc(it.name)}</b><small>${esc(displayName(o))}, ${esc(o.college)} · Credit score ${credit(o.credit)}</small><small>Pickup ${fmt(r.pickup)} · Return ${fmt(r.ret)}</small></div>
          <div class="statcell"><span class="pill ${p[0]}">${p[1]}</span><br>${esc(p[2])}</div>
          <button class="btn btn-out" style="padding:12px 18px;font-size:15px" data-go="messages/${esc(r.owner)}">Message</button>${r.status === 'borrowing' ? `<button class="btn btn-green" style="padding:12px 24px;font-size:15px" data-act="return-item" data-id="${r.id}" ${r.returnSent ? 'disabled' : ''}>${r.returnSent ? 'Return sent' : 'Return item'}</button>` : ''}${r.status === 'approved' ? `<button class="btn btn-out" style="padding:12px 30px;font-size:15px" data-act="pickup" data-id="${r.id}">Pickup</button>`
          : `<button class="btn btn-out" style="padding:12px 30px;font-size:15px" data-go="${r.status === 'returned' ? 'viewreturned/' + r.id : 'item/' + r.itemId}">View</button>`}</div>`;
    }).join('') || '<p style="text-align:center;color:#777;margin-top:30px">Nothing here yet.</p>'}
    </div></div>`;
  };

  let editing = false;
  VIEWS.profile = (a, u) => `
    <div class="prof">
      <div class="card me">
        <span class="pill active">Active · ID verified</span>
        <div class="av" ${avBg(u)}></div><label class="btn btn-out photo-btn" for="pf-photo">Change photo</label><input type="file" id="pf-photo" accept="image/*" hidden>
        <h2>${esc(displayName(u))}</h2><div class="mail">${esc(u.email)}</div>
        <div class="fieldwrap"><label class="lbl" style="font-size:9px">Full name</label><input class="field" id="pf-name" value="${esc(u.name)}" ${editing ? '' : 'readonly'}></div>
        <div class="fieldwrap"><label class="lbl" style="font-size:9px">Student ID number</label><input class="field" id="pf-id" value="${esc(u.studentId)}" ${editing ? '' : 'readonly'}></div>
        <div class="row2">
          <div class="fieldwrap"><label class="lbl" style="font-size:9px">College</label><select class="field" id="pf-college" ${editing ? '' : 'disabled'}>${COLLEGES.map(c => `<option ${u.college === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="fieldwrap"><label class="lbl" style="font-size:9px">Campus</label><input class="field" value="${esc(u.campus)}" readonly></div>
        </div>
        <div class="fieldwrap"><label class="lbl" style="font-size:9px">Contact number</label><input class="field" id="pf-contact" value="${esc(u.contact)}" ${editing ? '' : 'readonly'}></div>
        <div class="btn-row"><button class="btn btn-maroon" data-act="edit-profile">${editing ? 'Save Profile' : 'Edit Profile'}</button><button class="btn btn-out" data-act="signout">Sign out</button></div>
      </div>
      <div>
        <div class="credit">
          <div class="top"><b>Credit Score</b><span>${credit(u.credit)}<small>/5.0</small></span></div>
          <div class="bar"><i style="width:${u.credit / 5 * 100}%"></i></div>
          <p>On-time returns help your score. Late returns lower it.<br>Below 2.5: The account is locked.</p>
        </div>
        <div class="mini"><div>Active borrows<b>${activeBorrows(u.email)}/${MAX_ACTIVE}</b></div><div>Active listings<b>${activeListings(u.email)}/${MAX_ACTIVE}</b></div><div class="g">On-time returns<b>${u.onTime}</b></div></div>
        <div class="card recent"><h3>Recent credit activity</h3>
          ${u.log.slice(0, 4).map(l => `<div class="lrow"><span class="thumb"></span><div class="info"><b>${esc(l.text)}</b><small>${esc(l.t ? ago(l.t) : l.when)}</small></div><span class="pill ${l.delta >= 0 ? 'active' : 'overdue'}">${l.delta >= 0 ? '+' : ''}${credit(l.delta)}</span></div>`).join('') || '<p style="font-size:12px;color:#777">No credit activity yet.</p>'}
        </div>
      </div>
    </div>`;

  let selStudent = null;
  VIEWS['admin-queue'] = () => {
    const q = Object.values(S.users).filter(x => x.status === 'pending' && x.role !== 'admin');
    if (!q.find(x => x.email === selStudent)) selStudent = q[0] ? q[0].email : null;
    const s = selStudent ? user(selStudent) : null;
    return `
    <div class="adm">
      <div class="card"><h3 class="q">Verification queue</h3>
        ${q.map(x => `<button class="qrow ${x.email === selStudent ? 'sel' : ''}" data-act="pick-student" data-e="${esc(x.email)}">${x.idPhoto ? `<img class="thumb" src="${x.idPhoto}" alt="">` : '<span class="thumb"></span>'}<div>${esc(displayName(x))}<small>${esc(x.studentId)} · ${esc(x.college)} · Today</small></div><span class="pill pending">Pending</span></button>`).join('') || '<p style="font-size:12px;color:#777">No pending verifications.</p>'}
      </div>
      <div class="card review">
        ${s ? `<h2>Review: ${esc(displayName(s))}</h2><p class="m">Student id ${esc(s.studentId)} · ${esc(s.college)} · ${esc(s.email)}</p>
          ${s.idPhoto ? `<img src="${s.idPhoto}" alt="Student ID" style="max-width:100%;max-height:160px;border-radius:8px;margin-bottom:10px">` : ''}
          <h4>Reason (required to reject)</h4><textarea class="field" id="ad-reason"></textarea>
          <div class="btn-row"><button class="btn btn-green" data-act="approve-id">Approve</button><button class="btn btn-out" data-act="reject-id">Reject with reason</button></div>`
        : '<h2>Review</h2><p class="m">Select a student from the queue.</p>'}
      </div>
    </div>`;
  };
  VIEWS['admin-appeals'] = () => {
    const l = Object.values(S.users).filter(x => x.status === 'locked' && x.appeal);
    return `<div class="appwrap"><div class="appbox"><h2>Appeals</h2>
      ${l.map(x => `<div class="arow"><div><h4>${esc(displayName(x))} <span class="pill locked">Locked</span><span>Credit score below 2.5</span></h4><p>${esc(x.appeal)}</p></div>
        <div style="display:flex;gap:12px"><button class="btn btn-green" data-act="restore" data-e="${esc(x.email)}">Restore account</button><button class="btn btn-out-green" data-act="keep" data-e="${esc(x.email)}">Keep locked</button></div></div>`).join('') || '<p style="margin-left:10px">No appeals waiting.</p>'}
    </div></div>`;
  };
  VIEWS['admin-analytics'] = () => {
    const base = { 'Art materials': 14, 'Engineering tools': 19, 'Lab': 5, 'Electronics': 27 };
    S.items.forEach(i => { const k = i.category === 'Tool' ? 'Engineering tools' : i.category; if (k in base) base[k]++; });
    const max = Math.max(...Object.values(base));
    const cols = ['#E4A62E', '#A03030', '#2E7D57', '#E57B5A'];
    const o = S.outcomes, tot = o.ontime + o.late + o.lost;
    return `<div class="anal">
      <div class="chart"><div class="in"><h3>Items listed by category</h3>
        <div class="bars">${Object.entries(base).map(([k, v], n) => `<div><i style="height:${v / max * 85}%;background:${cols[n]}"></i>${k}</div>`).join('')}</div></div></div>
      <div class="outc"><h3>Return outcomes</h3>
        <div class="outbar"><i style="width:${o.ontime / tot * 100}%;background:#2E7D57"></i><i style="width:${o.late / tot * 100}%;background:#E4A62E"></i><i style="width:${o.lost / tot * 100}%;background:#8E1B24"></i></div>
        <div class="legend"><span><i style="background:#E4A62E"></i>Late</span><span><i style="background:#2E7D57"></i>On-time</span><span><i style="background:#8E1B24"></i>Not returned</span></div></div>
    </div>`;
  };
  const unreadCount = e => S.messages.filter(x => x.to === e && !x.read).length;
  const selChat = (arg, u) => { let e = arg ? decodeURIComponent(arg) : ''; if (e === u.email || !S.users[e]) e = ''; return e || (threadsOf(u.email)[0] || [''])[0]; };
  function threadsOf(e) { const m = {}; S.messages.forEach(x => { if (x.from === e || x.to === e) { const o = x.from === e ? x.to : x.from; if (!m[o] || m[o].t < x.t) m[o] = x; } }); return Object.entries(m).sort((a, b) => b[1].t - a[1].t); }
  function markRead(sel, u) { let c = false; S.messages.forEach(x => { if (x.to === u.email && x.from === sel && !x.read) { x.read = true; c = true; } }); return c; }
  function chatLog(sel, u) {
    const l = S.messages.filter(x => (x.from === u.email && x.to === sel) || (x.from === sel && x.to === u.email)).sort((a, b) => a.t - b.t);
    return l.map(x => `<div class="bub ${x.from === u.email ? 'me' : 'them'}">${esc(x.text)}<small>${ago(x.t)}</small></div>`).join('') || '<p class="empty">No messages yet. Say hi!</p>';
  }
  function threadList(sel, u) {
    const th = threadsOf(u.email); if (sel && !th.find(t => t[0] === sel)) th.unshift([sel, null]);
    return th.map(([e, m]) => {
      const o = user(e), n = S.messages.filter(x => x.from === e && x.to === u.email && !x.read).length;
      return `<button class="trow ${e === sel ? 'sel' : ''}" data-go="messages/${esc(e)}"><span class="thumb">${esc(initials(o))}</span><div><b>${esc(displayName(o))}</b><small>${m ? esc(m.text.slice(0, 40)) : 'New conversation'}</small></div>${n ? `<i class="dot">${n}</i>` : ''}</button>`;
    }).join('') || '<p class="empty">No conversations yet. Open an item or a request and tap Message.</p>';
  }
  VIEWS.messages = (arg, u) => {
    const sel = selChat(arg, u); if (sel && markRead(sel, u)) save();
    const o = sel ? user(sel) : null;
    return `<div class="shell"><div class="chat">
      <aside class="card thr"><h3>Messages</h3><div id="thr-list">${threadList(sel, u)}</div></aside>
      <section class="card conv">${o ? `<div class="ch"><b>${esc(displayName(o))}</b><small>${esc(o.college)} · Credit score ${credit(o.credit)}</small></div>
        <div id="chat-log" class="clog">${chatLog(sel, u)}</div>
        <div class="cin"><input class="field" id="msg-text" placeholder="Type a message" autocomplete="off" maxlength="500"><button class="btn btn-maroon" data-act="send-msg" data-to="${esc(sel)}">Send</button></div>`
        : '<p class="empty" style="margin:30px">Pick a conversation, or open an item or a request and tap Message.</p>'}</section></div></div>`;
  };
  AFTER.messages = () => { const l = $('#chat-log'); if (l) l.scrollTop = l.scrollHeight; const i = $('#msg-text'); if (i) i.focus(); };
  function refreshChat() {
    const u = me(), name = location.hash.slice(1).split('/'), sel = u && selChat(name[1], u), l = $('#chat-log'); if (!sel || !l) return;
    if (markRead(sel, u)) save();
    l.innerHTML = chatLog(sel, u); l.scrollTop = l.scrollHeight; $('#thr-list').innerHTML = threadList(sel, u); renderHeader('messages', u);
  }

  function reqDefaults(d) {
    const p = $('#rq-pick'), r = $('#rq-ret'); if (!p || !r) return;
    p.value = plus(1); p.dataset.max = d; r.min = p.value; r.max = plus(1 + d); r.value = r.max;
  }
  function openRequest(id) {
    const i = item(id), old = document.getElementById('reqm'); if (old) old.remove(); if (!i) return;
    const d = document.createElement('div'); d.id = 'reqm'; d.className = 'authm';
    d.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-label="Request to borrow">
      <div class="g"><img class="thumb" src="${esc(imgOf(i))}" alt="${esc(i.name)}"><div><b>Request to borrow</b><br><small>${esc(i.name)} · max ${i.maxDays} days</small></div></div>
      <div class="row2"><div><label class="lbl" style="font-size:10px">Pickup date</label><input class="field" type="date" id="rq-pick" min="${todayISO()}"></div>
      <div><label class="lbl" style="font-size:10px">Return date</label><input class="field" type="date" id="rq-ret" min="${todayISO()}"></div></div>
      <label class="lbl" style="font-size:10px;margin-top:12px">Message to owner (optional)</label><textarea class="field" id="rq-msg" style="min-height:80px"></textarea>
      ${isBusy(i.id) ? '<p class="aerr" style="color:#9A6B00">This item is currently borrowed. The owner decides when to approve.</p>' : ''}
      <div class="btn-row" style="margin-top:14px;align-items:center"><button class="btn btn-green" data-act="send-request" data-id="${i.id}">Send request</button><button class="btn btn-out-green" data-act="close-request">Cancel</button><button class="link" data-go="item/${i.id}">View details</button></div></div>`;
    document.body.appendChild(d); reqDefaults(i.maxDays);
  }
  document.addEventListener('change', e => {
    if (e.target.id !== 'rq-pick' || !e.target.value) return;
    const r = $('#rq-ret'), lim = new Date(e.target.value + 'T12:00:00Z'); lim.setUTCDate(lim.getUTCDate() + (+e.target.dataset.max || 3));
    r.min = e.target.value; r.max = lim.toISOString().slice(0, 10); r.value = r.max;
  });

  AFTER.item = id => { const i = item(id); if (i) reqDefaults(i.maxDays); };
  AFTER.return = () => { returnPhoto = null; fillDrop('rt-drop', null, '#rt-drop'); };
  function fillDrop(id, src) { const d = document.getElementById(id); if (d) d.innerHTML = src ? `<img src="${src}" alt="">` : ''; }

  function closeAuth() { const d = document.getElementById('authm'); if (d) d.remove(); }
  function openAuth(pre) {
    closeAuth();
    const d = document.createElement('div'); d.id = 'authm'; d.className = 'authm';
    d.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-label="Sign in with Google">
      <div class="g">${googleIcon}<b>Sign in with Google</b></div>
      <label class="lbl" for="au-id">Student ID or BatStateU email</label>
      <div class="idwrap"><input class="field" id="au-id" placeholder="e.g. 23-12345" autocomplete="off"><span class="sfx" id="au-sfx">${DOMAIN}</span></div>
      <p class="aerr" id="au-err" role="alert"></p>
      <div class="btn-row"><button class="btn btn-maroon" data-act="auth-submit">Continue</button><button class="btn btn-out" data-act="auth-close">Cancel</button></div>
      <p class="note" style="margin-top:12px">No account yet? <button class="link" data-act="auth-signup">Sign up</button></p></div>`;
    document.body.appendChild(d);
    $('#au-id').value = pre || ''; $('#au-id').focus();
  }

  const ACT = {
    google() { openAuth(); },
    'auth-close'() { closeAuth(); },
    'open-request'(el, u) {
      const i = item(el.dataset.id); if (!i) return;
      if (i.owner === u.email) return toast('You can only borrow items listed by other students.');
      openRequest(i.id);
    },
    'return-item'(el, u) {
      const r = reqOf(el.dataset.id); if (!r || r.borrower !== u.email || r.status !== 'borrowing' || r.returnSent) return;
      r.returnSent = Date.now(); notify(r.owner, displayName(u) + ' says ' + item(r.itemId).name + ' was returned. Check it and mark it as returned.');
      save(); toast('Return sent. The owner will confirm once they have the item.'); route();
    },
    'send-msg'(el, u) {
      const to = el.dataset.to, text = fieldVal('msg-text'); if (!text || !S.users[to]) return;
      if (!S.messages.some(x => x.from === u.email && x.to === to && !x.read)) notify(to, displayName(u) + ' sent you a message.');
      S.messages.push({ id: Date.now() + Math.random(), from: u.email, to, text, t: Date.now(), read: false });
      save(); route();
    },
    'close-request'() { const m = document.getElementById('reqm'); if (m) m.remove(); },
    'auth-signup'() { closeAuth(); go('signup'); },
    'auth-submit'() {
      let v = fieldVal('au-id').toLowerCase(), err = $('#au-err');
      if (!v) { err.textContent = 'Enter your Student ID.'; return; }
      if (!v.includes('@')) v += DOMAIN;
      if (!v.endsWith(DOMAIN)) { closeAuth(); signinError = true; return go('signin'); }
      const u = S.users[v];
      if (!u) { signupPrefill = v.slice(0, -DOMAIN.length); closeAuth(); go('signup'); return toast('No account found for ' + v + '. Create your account first.'); }
      signinError = false; S.session = v; save(); closeAuth(); go(homeFor(u));
    },
    signup() { pendingIdPhoto = null; signupPrefill = ''; go('signup'); },
    auth(mode) {
      const e = (prompt(mode === 'signup' ? 'Sign up with Google — enter your BatStateU email:' : 'Sign in with Google — enter your BatStateU email:', mode === 'signup' ? '' : DEMO) || '').trim().toLowerCase();
      if (!e) return;
      if (!e.endsWith(DOMAIN)) { signinError = true; return go('signin'); }
      if (mode === 'signin' && !S.users[e]) { toast('No account found for that email. Use Sign Up to register.'); return go('landing'); }
      if (mode === 'signup' && S.users[e] && S.users[e].status !== 'new') { toast('That email already has an account. Sign in instead.'); signinError = false; return go('signin'); }
      signinError = false;
      if (!S.users[e]) S.users[e] = { email: e, name: '', studentId: '', college: '', campus: 'Alangilan', contact: '', status: 'new', role: 'student', credit: 5, onTime: 0, log: [], idPhoto: null };
      S.session = e; save();
      go(homeFor(S.users[e]));
    },
    signout() { S.session = null; pendingIdPhoto = null; save(); go('landing'); },
    'verified-continue'() { const u = me(); u.justVerified = false; save(); go('dashboard'); },
    'submit-verification'() {
      let u = me(), name = fieldVal('ob-name'), id = fieldVal('ob-id'), col = fieldVal('ob-college'), con = fieldVal('ob-contact');
      const photo = pendingIdPhoto || (u && u.idPhoto);
      if (!name || !id || !col || !con) return toast('Please complete all your details.');
      if (!photo) return toast('Upload your ID to continue.');
      if (!$('#ob-terms').checked) return toast('Please agree to the Terms of Use and Privacy Policy.');
      if (!u) {
        if (!/^\d{2}-\d{4,6}$/.test(id)) return toast('Enter your Student ID like 22-10482.');
        const email = id.toLowerCase() + DOMAIN;
        if (S.users[email] && S.users[email].status !== 'new') { toast('You already have an account. Sign in instead.'); go('signin'); return openAuth(id); }
        u = S.users[email] = { email, name, studentId: id, college: col, campus: 'Alangilan', contact: con, status: 'new', role: 'student', credit: 5, onTime: 0, log: [], idPhoto: null };
        S.session = email;
      }
      Object.assign(u, { name, studentId: id, college: col, contact: con, idPhoto: photo, status: 'pending', rejectReason: '' });
      notify(u.email, 'Your student ID was submitted for verification.');
      pendingIdPhoto = null; save(); go('dashboard'); toast('Account created. An admin will verify your student ID soon.');
    },
    resubmit() { const u = me(); u.status = 'new'; u.idPhoto = null; save(); go('onboarding'); },
    'contact-admin'() { toast('An admin has been notified. You will be contacted by email.'); },
    appeal() {
      const m = prompt('Write a short message for the admin:');
      if (!m) return; me().appeal = m.trim(); save(); toast('Appeal submitted. An admin will review your case.');
    },
    search() { bf.q = fieldVal('f-q'); bf.cat = fieldVal('f-cat'); bf.avail = fieldVal('f-avail'); bf.sort = fieldVal('f-sort'); bf.page = 1; route(); },
    page(el) { bf.page = +el.dataset.p; route(); },
    gal(el) { const m = $('#gal-main'); if (m) m.src = el.dataset.src; },
    'send-request'(el, u) {
      const i = item(el.dataset.id), p = fieldVal('rq-pick'), r = fieldVal('rq-ret');
      if (i.owner === u.email) return toast('You can only borrow items listed by other students.');
      if (i.deleted) return toast('This listing was removed.');
      if (S.requests.some(x => x.itemId === i.id && x.borrower === u.email && x.status === 'pending')) return toast('You already have a pending request for this item.');
      if (!p || !r) return toast('Choose a pickup date and a return date.');
      if (r < p) return toast('Return date must be after the pickup date.');
      if ((new Date(r) - new Date(p)) / 864e5 > i.maxDays) return toast('Return date must be within the owner\'s maximum borrow period (' + i.maxDays + ' days).');
      if (activeBorrows(u.email) >= MAX_ACTIVE) return toast('You already have ' + MAX_ACTIVE + ' active borrows.');
      S.requests.push({ id: Date.now(), itemId: i.id, borrower: u.email, owner: i.owner, status: 'pending', pickup: p, ret: r, message: fieldVal('rq-msg'), created: Date.now() });
      notify(i.owner, displayName(u) + ' requested to borrow ' + i.name + '.');
      notify(u.email, 'Your request for ' + i.name + ' was sent to ' + displayName(user(i.owner)) + '.');
      save(); bTab = 'all'; go('borrows');
      toast('Request sent. The owner will approve or reject it. Track it in My borrows.', 'Pending');
    },
    publish(el, u) {
      const name = fieldVal('cl-name'), cat = fieldVal('cl-cat'), hint = $('#cl-hint');
      if (!name || !cat) { hint.textContent = 'Add an item name and category to publish'; hint.style.color = '#A31F2A'; return; }
      const editId = el.dataset.id;
      if (!editId && activeListings(u.email) >= MAX_ACTIVE) { hint.textContent = 'You already have ' + MAX_ACTIVE + ' active listings.'; hint.style.color = '#A31F2A'; return; }
      const data = { name, category: cat, condition: fieldVal('cl-cond'), description: fieldVal('cl-desc'), maxDays: parseInt(fieldVal('cl-max'), 10) || 3, pickup: fieldVal('cl-loc') || 'Campus building or area', images: draftPhotos.slice() };
      if (editId) Object.assign(item(editId), data);
      else { const id = Date.now(); S.items.push(Object.assign({ id, owner: u.email, created: id }, data)); }
      notify(u.email, editId ? 'You updated your listing ' + name + '.' : 'Your listing ' + name + ' is now live.');
      draftPhotos = []; save(); go('listings');
    },
    'delete-listing'(el, u) {
      const i = item(el.dataset.id); if (!i || i.owner !== u.email) return;
      if (isBusy(i.id)) return toast('This item is borrowed or has an approved pickup. Mark it as returned first.');
      if (!confirm('Delete "' + i.name + '"? Pending requests for it will be cancelled.')) return;
      S.requests.filter(r => r.itemId === i.id && r.status === 'pending').forEach(r => {
        r.status = 'rejected'; r.reason = 'The owner removed this listing.';
        notify(r.borrower, 'Your request for ' + i.name + ' was cancelled because the listing was removed.');
      });
      i.deleted = true; notify(u.email, 'You deleted your listing ' + i.name + '.');
      save(); toast('Listing deleted.'); route();
    },
    'cancel-create'() { draftPhotos = []; go('listings'); },
    'view-request'(el) {
      const r = reqOf(el.dataset.id), row = document.getElementById('row-' + r.id), ex = row.querySelector('.why');
      if (ex) return ex.remove();
      const d = document.createElement('div'); d.className = 'why'; d.style.fontSize = '11px';
      d.textContent = `Requested ${fmt(r.pickup)} to ${fmt(r.ret)}${r.message ? ' — "' + r.message + '"' : ' — no message.'}`;
      row.appendChild(d);
    },
    approve(el, u) {
      const r = reqOf(el.dataset.id); if (isBusy(r.itemId)) return toast('This item is still borrowed. Approve it after it is returned.'); r.status = 'approved';
      notify(r.borrower, displayName(u) + ' approved your request for ' + item(r.itemId).name + '.');
      save(); pin = { x: 44.5, y: 63.5 }; go('location/' + r.id);
    },
    reject(el) {
      const row = document.getElementById('row-' + el.dataset.id);
      if (row.querySelector('.why input')) return;
      const d = document.createElement('div'); d.className = 'why';
      d.innerHTML = `<input class="field" placeholder="Reason for rejecting" style="padding:8px 12px"><button class="btn btn-maroon" data-act="confirm-reject" data-id="${el.dataset.id}">Confirm</button>`;
      row.appendChild(d);
    },
    'confirm-reject'(el, u) {
      const row = document.getElementById('row-' + el.dataset.id), why = row.querySelector('.why input').value.trim();
      if (!why) return toast('Add a short reason so the borrower knows why.');
      const r = reqOf(el.dataset.id); r.status = 'rejected'; r.reason = why;
      notify(r.borrower, displayName(u) + ' rejected your request for ' + item(r.itemId).name + '.');
      save(); route();
    },
    'confirm-return'(el, u) {
      const r = reqOf(el.dataset.id), it = item(r.itemId), st = fieldVal('rt-status').toLowerCase();
      const late = r.ret < todayISO(), lost = /lost/.test(st);
      r.status = 'returned'; r.itemStatus = fieldVal('rt-status'); r.rating = fieldVal('rt-rate'); r.returnedPhoto = returnPhoto;
      const b = S.users[r.borrower];
      if (lost) { S.outcomes.lost++; addCredit(r.borrower, -1, it.name + ' reported lost'); }
      else if (late) { S.outcomes.late++; addCredit(r.borrower, -0.3, it.name + ' returned late'); }
      else { S.outcomes.ontime++; b.onTime++; addCredit(r.borrower, 0.1, it.name + ' returned on time'); }
      notify(r.borrower, 'Return of ' + it.name + ' was confirmed.');
      save(); go('listings');
    },
    btab(el) { bTab = el.dataset.t; route(); },
    pickup(el) {
      const r = reqOf(el.dataset.id);
      if (r.status === 'approved') { r.status = 'borrowing'; notify(r.owner, displayName(me()) + ' picked up ' + item(r.itemId).name + '.'); save(); toast('Pickup confirmed. Return by ' + fmt(r.ret) + '.'); route(); }
      else if (r.status === 'pending') toast('Waiting for the owner to respond.');
      else toast('Request rejected. Reason: ' + (r.reason || '—'));
    },
    'use-location'() {
      if (!navigator.geolocation) return toast('Location is not available on this device.');
      navigator.geolocation.getCurrentPosition(p => toast('Current location captured (' + p.coords.latitude.toFixed(4) + ', ' + p.coords.longitude.toFixed(4) + ').'), () => toast('Could not get your location.'));
    },
    'save-location'(el) {
      const name = fieldVal('lc-name'), type = fieldVal('lc-type');
      if (!name || !type) return toast('Add a location name and type.');
      const r = reqOf(el.dataset.id);
      r.location = [name, fieldVal('lc-street'), fieldVal('lc-city')].filter(Boolean).join(', ');
      notify(r.borrower, 'Pickup location for ' + item(r.itemId).name + ': ' + r.location + '.'); save(); toast('Location saved.'); go('listings');
    },
    'edit-profile'(el, u) {
      if (editing) {
        const name = fieldVal('pf-name'), id = fieldVal('pf-id');
        if (!name || !id) return toast('Name and student ID are required.');
        Object.assign(u, { name, studentId: id, college: fieldVal('pf-college'), contact: fieldVal('pf-contact') }); notify(u.email, 'Your profile was updated.'); save();
      }
      editing = !editing; route();
    },
    'pick-student'(el) { selStudent = el.dataset.e; route(); },
    'approve-id'() {
      const s = S.users[selStudent]; s.status = 'active'; s.justVerified = true;
      notify(s.email, 'Your student ID was verified. Welcome to lendNborrow!'); s.log.unshift({ text: 'Account verified', delta: 0, t: Date.now() }); save(); route();
    },
    'reject-id'() {
      const why = fieldVal('ad-reason'); if (!why) return toast('A reason is required to reject.');
      const s = S.users[selStudent]; s.status = 'rejected'; s.rejectReason = why; notify(s.email, 'Your student ID was rejected: ' + why); save(); route();
    },
    restore(el) { const s = S.users[el.dataset.e]; s.status = 'active'; s.credit = 2.5; s.appeal = ''; s.log.unshift({ text: 'Account restored after appeal', delta: 0, t: Date.now() }); notify(s.email, 'An admin restored your account.'); save(); route(); },
    keep(el) { const s = S.users[el.dataset.e]; s.appeal = ''; notify(s.email, 'An admin reviewed your appeal and kept the account locked.'); save(); route(); }
  };

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g && !e.target.closest('[data-act]')) { e.preventDefault(); return go(g.dataset.go); }
    const a = e.target.closest('[data-act]');
    if (a && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a, me()); return; }
    const m = e.target.closest('#map');
    if (m) {
      const b = m.getBoundingClientRect();
      pin = { x: (e.clientX - b.left) / b.width * 100, y: (e.clientY - b.top) / b.height * 100 };
      const p = $('#pin'); p.style.left = pin.x + '%'; p.style.top = pin.y + '%';
    }
  });
  document.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f && e.target.id !== 'cl-files') return;
    if (e.target.id === 'pf-photo') readImage(f, d => { me().avatar = d; notify(me().email, 'Your profile photo was updated.'); save(); route(); }, 320);
    if (e.target.id === 'ob-file') readImage(f, d => { pendingIdPhoto = d; fillDrop('ob-drop', d); });
    if (e.target.id === 'rt-file') readImage(f, d => { returnPhoto = d; fillDrop('rt-drop', d); });
    if (e.target.id === 'cl-files') {
      const files = Array.from(e.target.files).slice(0, 4 - draftPhotos.length);
      let left = files.length;
      files.forEach(file => readImage(file, d => {
        draftPhotos.push(d);
        if (--left === 0) {
          const imgs = [$('#cl-main'), ...document.querySelectorAll('.thumbs .drop')];
          imgs.forEach((el, n) => el.innerHTML = draftPhotos[n] ? `<img src="${draftPhotos[n]}" alt="">` : '');
        }
      }));
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'f-q') ACT.search();
    if (e.key === 'Enter' && e.target.id === 'msg-text') ACT['send-msg']($('[data-act=send-msg]'), me());
    if (e.key === 'Enter' && e.target.id === 'au-id') ACT['auth-submit']();
    if (e.key === 'Escape') { closeAuth(); const rm = document.getElementById('reqm'); if (rm) rm.remove(); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'au-id') $('#au-sfx').style.display = e.target.value.includes('@') ? 'none' : ''; });
  window.addEventListener('hashchange', route);
  document.addEventListener('error', e => { const t = e.target; if (t.tagName === 'IMG' && !t.dataset.fb && /^assets\/(?!logo)/.test(t.getAttribute('src') || '')) { t.dataset.fb = 1; t.src = ph({ name: t.alt }); } }, true);
  window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) { load(); if (!document.activeElement || !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) route(); } });

  load();
  const boot = () => { if (S.session) { S.session = null; save(); } if (location.hash !== '#landing') location.hash = 'landing'; else route(); };   // always start on the landing page
  if (SYNC) {   // load shared data first so a sign-up form is never wiped by a late sync
    let done = false; const go1 = () => { if (!done) { done = true; boot(); setInterval(pull, 3000); } };
    pull(true, true).then(go1, go1); setTimeout(go1, 2000);
  } else boot();
})();