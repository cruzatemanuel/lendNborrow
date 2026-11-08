/* lendNborrow — admin portal. Shares the student app's localStorage state, so
   verifications, appeals and analytics here are live with index.html. */
(() => {
  'use strict';
  const KEY = 'lendnborrow_state_v1', DOMAIN = '@g.batstate-u.edu.ph';
  const CATS = ['Electronics', 'Engineering tools', 'Art materials', 'Lab'];
  const COLS = ['#E57B5A', '#A03030', '#E4A62E', '#2E7D57'];
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const name = u => { const p = (u.name || '').split(','); return p[1] ? p[1].trim() + ' ' + p[0].trim() : (p[0] || u.email); };
  const credit = n => (Math.round(n * 10) / 10).toFixed(1);

  let S, tab = 'queue', sel = null;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save changes.'); } }
  function notify(to, text) { (S.notifs = S.notifs || []).unshift({ id: Date.now() + Math.random(), to, text, t: Date.now() }); }
  let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.remove('hidden'); clearTimeout(tt); tt = setTimeout(() => t.classList.add('hidden'), 2600); }

  const admin = () => S && S.session && S.users[S.session] && S.users[S.session].role === 'admin' ? S.users[S.session] : null;
  const users = () => Object.values(S.users || {}).filter(u => u.role !== 'admin');
  const pending = () => users().filter(u => u.status === 'pending');
  const appeals = () => users().filter(u => u.status === 'locked' && u.appeal);

  /* ---------- views ---------- */
  function header() {
    const a = admin();
    $('#header').innerHTML = '<a class="brand" href="../index.html" style="text-decoration:none"><img src="../assets/logo.png" alt="">lendNborrow</a>' + (a ? `
      <nav class="nav">
        <a href="#queue" class="${tab === 'queue' ? 'on' : ''}">Verification queue<span class="n">${pending().length}</span></a>
        <a href="#appeals" class="${tab === 'appeals' ? 'on' : ''}">Appeals<span class="n">${appeals().length}</span></a>
        <a href="#analytics" class="${tab === 'analytics' ? 'on' : ''}">Analytics</a>
      </nav><div class="hdr-right"><span>${esc(a.email)}</span><button class="btn btn-gold" data-act="signout">Sign out</button></div>` : '');
  }

  function gate() {
    return `<div class="gate card"><h2>Admin sign in</h2><p class="m">Use an administrator BatStateU account.</p>
      <input class="field" id="g-email" placeholder="admin${DOMAIN}" autocomplete="off">
      <p class="err" id="g-err"></p><button class="btn btn-maroon" data-act="signin">Continue</button></div>`;
  }

  function stats() {
    const u = users(), it = (S.items || []).filter(i => !i.deleted);
    const borrowing = (S.requests || []).filter(r => r.status === 'borrowing').length;
    return `<div class="stats">
      <div class="stat"><b>${u.length}</b><small>Students</small></div>
      <div class="stat"><b>${pending().length}</b><small>Awaiting verification</small></div>
      <div class="stat"><b>${it.length}</b><small>Active listings</small></div>
      <div class="stat"><b>${borrowing}</b><small>Items on loan</small></div></div>`;
  }

  function queue() {
    const q = pending();
    if (!q.find(x => x.email === sel)) sel = q[0] ? q[0].email : null;
    const s = sel ? S.users[sel] : null;
    return `<div class="panel">${stats()}<div class="adm">
      <div class="card"><h3 class="q">Verification queue</h3>
        ${q.map(x => `<button class="qrow ${x.email === sel ? 'sel' : ''}" data-act="pick" data-e="${esc(x.email)}">
          ${x.idPhoto ? `<img class="thumb" src="${x.idPhoto}" alt="">` : '<span class="thumb"></span>'}
          <div>${esc(name(x))}<small>${esc(x.studentId)} · ${esc(x.college)}</small></div><span class="pill pending">Pending</span></button>`).join('') || '<p class="empty">No pending verifications.</p>'}
      </div>
      <div class="card review">${s ? `<h2>Review: ${esc(name(s))}</h2>
        <p class="m">Student ID ${esc(s.studentId)} · ${esc(s.college)} · ${esc(s.email)}<br>Contact ${esc(s.contact || '—')}</p>
        ${s.idPhoto ? `<img class="idimg" src="${s.idPhoto}" alt="Student ID photo">` : '<p class="empty">No ID photo uploaded.</p>'}
        <h4>Reason (required to reject)</h4><textarea class="field" id="reason"></textarea>
        <div class="btn-row"><button class="btn btn-green" data-act="approve">Approve</button><button class="btn btn-out" data-act="reject">Reject with reason</button></div>`
        : '<h2>Review</h2><p class="m">Select a student from the queue.</p>'}</div>
    </div></div>`;
  }

  function appealsView() {
    const l = appeals();
    return `<div class="panel"><div class="card" style="border-radius:14px"><h2 style="margin-bottom:14px;color:var(--maroon)">Appeals</h2>
      ${l.map(x => `<div class="arow"><div><h4>${esc(name(x))}<span class="pill locked">Locked</span><span>Credit score ${credit(x.credit)} (below 2.5)</span></h4><p>${esc(x.appeal)}</p></div>
        <div class="btn-row" style="margin:0"><button class="btn btn-green" data-act="restore" data-e="${esc(x.email)}">Restore account</button><button class="btn btn-out-green" data-act="keep" data-e="${esc(x.email)}">Keep locked</button></div></div>`).join('') || '<p class="empty">No appeals waiting.</p>'}
    </div></div>`;
  }

  function analytics() {
    const base = { Electronics: 0, 'Engineering tools': 0, 'Art materials': 0, Lab: 0 };
    (S.items || []).forEach(i => { if (i.deleted) return; const k = i.category === 'Tool' ? 'Engineering tools' : i.category; if (k in base) base[k]++; });
    const max = Math.max(1, ...Object.values(base));
    const o = S.outcomes || { ontime: 0, late: 0, lost: 0 }, tot = (o.ontime + o.late + o.lost) || 1;
    const pct = n => Math.round(n / tot * 100);
    return `<div class="panel">${stats()}
      <div class="card sec"><h3>Items listed by category</h3><div class="bars" style="margin-top:34px">
        ${CATS.map((k, n) => `<div><i style="height:${base[k] / max * 85}%;background:${COLS[n]}"><em>${base[k]}</em></i><span>${k}</span></div>`).join('')}</div></div>
      <div class="card"><h3>Return outcomes</h3>
        <div class="outbar"><i style="width:${o.ontime / tot * 100}%;background:#2E7D57"></i><i style="width:${o.late / tot * 100}%;background:#E4A62E"></i><i style="width:${o.lost / tot * 100}%;background:#8E1B24"></i></div>
        <div class="legend"><span><i style="background:#2E7D57"></i>On-time ${pct(o.ontime)}%</span><span><i style="background:#E4A62E"></i>Late ${pct(o.late)}%</span><span><i style="background:#8E1B24"></i>Not returned ${pct(o.lost)}%</span></div></div></div>`;
  }

  function render() {
    load();
    tab = (location.hash || '#queue').slice(1);
    if (!['queue', 'appeals', 'analytics'].includes(tab)) tab = 'queue';
    header();
    $('#app').innerHTML = '<div class="wrap">' + (!S || !S.users ? '<p class="empty">No data yet. Open index.html first to create the demo data.</p>' + gate()
      : !admin() ? gate() : tab === 'queue' ? queue() : tab === 'appeals' ? appealsView() : analytics()) + '</div>';
  }

  /* ---------- actions ---------- */
  const ACT = {
    signin() {
      const v = ($('#g-email').value.trim().toLowerCase()), err = $('#g-err');
      const e = v.includes('@') ? v : v + DOMAIN, u = S && S.users && S.users[e];
      if (!u || u.role !== 'admin') { err.textContent = 'That account is not an administrator.'; return; }
      S.session = e; save(); render();
    },
    signout() { S.session = null; save(); render(); },
    pick(el) { sel = el.dataset.e; render(); },
    approve() {
      const s = S.users[sel]; if (!s) return;
      s.status = 'active'; s.justVerified = true; s.rejectReason = '';
      (s.log = s.log || []).unshift({ text: 'Account verified', delta: 0, t: Date.now() });
      notify(s.email, 'Your student ID was verified. Welcome to lendNborrow!'); save(); toast('Approved ' + name(s) + '.'); render();
    },
    reject() {
      const why = ($('#reason') || {}).value; const s = S.users[sel];
      if (!why || !why.trim()) return toast('A reason is required to reject.');
      s.status = 'rejected'; s.rejectReason = why.trim();
      notify(s.email, 'Your student ID was rejected: ' + why.trim()); save(); toast('Rejected ' + name(s) + '.'); render();
    },
    restore(el) {
      const s = S.users[el.dataset.e];
      s.status = 'active'; s.credit = 2.5; s.appeal = '';
      (s.log = s.log || []).unshift({ text: 'Account restored after appeal', delta: 0, t: Date.now() });
      notify(s.email, 'An admin restored your account.'); save(); toast('Account restored.'); render();
    },
    keep(el) {
      const s = S.users[el.dataset.e]; s.appeal = '';
      notify(s.email, 'An admin reviewed your appeal and kept the account locked.'); save(); toast('Account kept locked.'); render();
    }
  };

  document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (a && ACT[a.dataset.act]) { e.preventDefault(); load(); ACT[a.dataset.act](a); } });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'g-email') { load(); ACT.signin(); } });
  window.addEventListener('hashchange', render);
  window.addEventListener('storage', e => { if (e.key === KEY && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) render(); });
  render();
})();
