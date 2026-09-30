'use strict';
/* =========================================================
   A.K.T.A. – 7. akta – Robotzsaru Adattár (telefonra tervezve)
   Téma: pénzügyi szextortion / hamis profillal elkövetett csalás.
   Minden szereplő, név, fiók, kép és adat KITALÁLT.
   Az intim kép sehol nem jelenik meg, még helyőrzőként sem.
   ========================================================= */

const STORE = 'akta7_state_v1';

/* ---------- Segédfüggvények ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const deacc = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const norm = s => deacc(s).replace(/\s+/g, '').replace(/\.+$/, '');
const digits = s => String(s).replace(/\D/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CLUE_LABELS = { lopott: 'Lopott profilkép', hamis: 'Hamis, új fiók', sablon: 'Sablonos fenyegetés', penz: 'Külföldre futó pénz' };
const CLUE_KEYS = Object.keys(CLUE_LABELS);
const defaultState = () => ({
  auth: false,
  clues: { lopott: false, hamis: false, sablon: false, penz: false },
  solved: false
});
let S = loadState();
function loadState() { try { const r = localStorage.getItem(STORE); if (r) return Object.assign(defaultState(), JSON.parse(r)); } catch (e) { } return defaultState(); }
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { } }
const clueCount = () => CLUE_KEYS.filter(k => S.clues[k]).length;
function addClue(k) { if (S.clues[k]) return; S.clues[k] = true; save(); toast(`Új bizonyíték a nyomozati laphoz (${clueCount()}/4)`); }

let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 3200); }
function openModal(html) { $('#modal-body').innerHTML = html; $('#modal').hidden = false; $('.modal-box').scrollTop = 0; }
function closeModal() { $('#modal').hidden = true; $('#modal-body').innerHTML = ''; }
$('.modal-close').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

/* ---------- Kép- és avatar-segédek (változatlan a 6. aktához képest) ---------- */
const asPic = o => typeof o === 'string' ? { pic: o } : (o || {});
const imgPath = name => 'img/' + encodeURIComponent(name) + '.jpg';
function picSrc(o) {
  o = asPic(o);
  if (o.pic === 'party' || o.pic === 'buli') return PARTY_IMG[o.img || 0];
  if (o.pic) return imgPath(o.pic);
  return null;
}
function picHue(o) { o = asPic(o); if (o.h != null) return o.h; return 260; }
function picLabel(o) { o = asPic(o); if (o.txt) return esc(o.txt); return '<b>📷</b>'; }
function imgErr(el) {
  const tile = el.closest('.grid3 > button'); if (tile) { tile.remove(); return; }
  const box = el.parentElement; el.remove(); if (box) box.classList.remove('has-img');
}
function pic(o, cls) {
  const src = picSrc(o);
  const img = src ? `<img src="${src}" onerror="imgErr(this)" alt="" decoding="async">` : '';
  return `<div class="pic ${src ? 'has-img' : ''} ${cls || ''}" style="--h:${picHue(o)}">${img}<span>${picLabel(o)}</span></div>`;
}
function ppSrc(k) { const p = who(k) || {}; return imgPath(p.pic || k + 'prof'); }
function pp(k) {
  const p = who(k) || {};
  if (p.anon) return '<div class="pp anon" aria-hidden="true"></div>';
  return `<div class="pp has-img" style="--h:${p.h != null ? p.h : 260}"><img src="${ppSrc(k)}" onerror="imgErr(this)" alt="">${esc((p.n || '?')[0])}</div>`;
}

const PRELOADED = [];
function preloadImages() {
  const srcs = new Set(PARTY_IMG);
  const add = o => { const s = picSrc(o); if (s) srcs.add(s); };
  IG_FEED.forEach(p => p.imgs.forEach(add));
  IG_STORIES.forEach(s => s.slides.forEach(add));
  Object.values(IG_PROFILES).forEach(p => { (p.grid || []).forEach(add); (p.highlights || []).forEach(add); });
  Object.keys(P).forEach(k => { if (P[k].pic) srcs.add(ppSrc(k)); });
  srcs.forEach(src => { const i = new Image(); i.decoding = 'async'; i.src = src; PRELOADED.push(i); });
}
const handle = k => (who(k) || {}).u || k;
const dispName = k => (who(k) || {}).n || k;

/* =========================================================
   ROUTER
   ========================================================= */
const app = $('#app');
const views = {
  login: vLogin, adattar: vDash, insta: vIG, snap: vSC,
  kepkereso: vKepkereso, uzenetelemzes: vUzenetelemzes,
  nyomozas: vNyomozas, fiokelemzes: vNyomozas, penznyom: vNyomozas, // régi hivatkozások is ide vezetnek
  csalasdb: vCsalasDB, reakcio: vReakcio
};
function route() {
  let h = location.hash.replace(/^#\/?/, '') || 'login';
  if (!views[h]) h = 'adattar';
  if (!S.auth) h = 'login'; else if (h === 'login') h = 'adattar';
  if (h === 'insta') { IG.view = 'home'; IG.arg = null; IG.back = null; }
  if (h === 'snap') { SC.view = 'chats'; SC.arg = null; }
  closeModal(); closeStory(); views[h](); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
const backBar = title => `<div class="rz-top"><a class="back-link" href="#/adattar" aria-label="Vissza az adattárba">←</a><h2>${title}</h2></div>`;

/* =========================================================
   ROBOTZSARU – belépés / főoldal / dokumentumok
   ========================================================= */
function vLogin() {
  app.className = 'v-rz';
  app.innerHTML = `<section class="rz-frame rz-login">
    <h1 class="rz-title">ROBOTZSARU ADATTÁR</h1>
    <p class="rz-sub">A.K.T.A. Központi Bizonyítékkezelő v4.2<br>RENDSZER ONLINE</p>
    <input id="caseIn" class="rz-input" placeholder="ADJA MEG AZ ÜGYIRATSZÁMOT" autocomplete="off" aria-label="Ügyiratszám">
    <button id="caseBtn" class="rz-btn solid">ADATOK LEKÉRÉSE</button>
    <p id="caseErr" class="rz-err" role="alert"></p></section>`;
  const go = () => {
    if (norm($('#caseIn').value) === norm(CASE_NO)) { S.auth = true; save(); location.hash = '#/adattar'; }
    else $('#caseErr').textContent = 'Nincs ilyen ügyiratszám. Nézzétek meg a jegyzőkönyv jobb felső sarkát.';
  };
  $('#caseBtn').onclick = go; $('#caseIn').onkeydown = e => { if (e.key === 'Enter') go(); };
}

function vDash() {
  const n = clueCount();
  const chip = (k) => `<span class="clue-chip ${S.clues[k] ? 'on' : ''}">${S.clues[k] ? '✓' : '○'} ${CLUE_LABELS[k]}</span>`;
  const card = (t, p, btn) => `<article class="rz-card"><h3>${t}</h3><p>${p}</p>${btn}</article>`;
  app.className = 'v-rz';
  app.innerHTML = `<section class="rz-frame">
    <h1 class="rz-title">HOZZÁFÉRÉS ENGEDÉLYEZVE</h1>
    <p class="rz-case">Aktaszám: <strong>${CASE_NO}</strong><span class="closed">LEZÁRT ÜGY</span></p>
    <div class="rz-list">
      ${card('Feljelentési jegyzőkönyv', 'A sértett és édesanyja meghallgatása, 2025. november 18.', '<button class="rz-btn" data-doc="jkv">MEGTEKINTÉS</button>')}
      ${card('Sértett adatlapja', 'N. Bálint, 15 éves (kiskorú, adatai anonimizálva).', '<button class="rz-btn" data-doc="sertett">MEGTEKINTÉS</button>')}
      ${card('Nyomozati kérdések', 'Az aktához tartozó kérdések.', '<button class="rz-btn" data-doc="kerdesek">MEGTEKINTÉS</button>')}
      ${card('Adatmentés: Instagram-fiók', 'A sértett fiókja: bejegyzések, sztorik, és a „Lénával” folytatott üzenetváltás.', '<a class="rz-btn" href="#/insta">MEGNYITÁS</a>')}
      ${card('Adatmentés: Snapchat-fiók', 'A fenyegetés és a pénzkövetelés – itt fordult át a beszélgetés.', '<a class="rz-btn" href="#/snap">MEGNYITÁS</a>')}
      ${card('Fordított képkeresés', 'Honnan származik „Léna” profilképe? Hol tűnik még fel a neten?', '<a class="rz-btn" href="#/kepkereso">ESZKÖZ MEGNYITÁSA</a>')}
      ${card('Üzenetelemzés', 'A beszélgetés mintázata: mi árulja el a csalót?', '<a class="rz-btn" href="#/uzenetelemzes">ELEMZÉS</a>')}
      ${card('Fiók- és pénznyomozás', 'Ki áll a profil mögött, és hová vezet a pénz? Két lépés, két bizonyíték.' + (S.clues.hamis && S.clues.penz ? ' <b style="color:#2fd07a">✓ kész</b>' : ` <span class="muted">(${(S.clues.hamis ? 1 : 0) + (S.clues.penz ? 1 : 0)}/2)</span>`), '<a class="rz-btn" href="#/nyomozas">ELEMZÉS INDÍTÁSA</a>')}
      <article class="rz-card ${n < 4 ? 'locked' : ''}"><h3>Csalás-adatbázis ${n < 4 ? '🔒' : ''}</h3>
        <p>${n < 4 ? 'A lekérdezéshez négy bizonyíték kell. Gyűjtsétek össze őket az eszközökkel!' : 'Minden bizonyíték megvan. Futtassátok le a csalás-adatbázis lekérdezését!'}</p>
        <div class="meter"><span style="width:${n * 25}%"></span></div>
        <div class="clue-row">${CLUE_KEYS.map(chip).join('')}</div>
        ${n < 4 ? `<button class="rz-btn" disabled style="width:100%">SZÜKSÉGES BIZONYÍTÉK: ${n}/4</button>` : `<a class="rz-btn" style="display:block" href="#/csalasdb">LEKÉRDEZÉS</a>`}
      </article>
      ${card('A helyes reakció', 'Mit tegyen az áldozat? Döntsetek a helyes lépésekről.', '<a class="rz-btn" href="#/reakcio">MEGNYITÁS</a>')}
    </div>
    <div class="rz-foot"><button class="rz-btn" id="logout">RENDSZER LEZÁRÁSA</button></div></section>`;
  $$('[data-doc]').forEach(b => b.onclick = () => showDoc(b.dataset.doc));
  $('#logout').onclick = () => { if (confirm('Biztosan lezárod a rendszert? Minden haladás törlődik.')) { S = defaultState(); save(); location.hash = '#/login'; route(); } };
}

function showDoc(w) {
  if (w === 'jkv') openModal(`<div class="paper">
    <div class="head">Budapesti Rendőr-főkapitányság<br>Bűnügyi Osztály</div>
    <div class="ref">Szám: ${CASE_NO}<br>Tárgy: kiskorú sérelmére, hamis profillal elkövetett zsarolás (pénzügyi szextortion) gyanúja</div>
    <h4>JEGYZŐKÖNYV</h4>
    <p>Készült: Budapest, 2025. november 18-án, a feljelentő és a sértett meghallgatásáról. Jelen van: Varga Eszter r. főhadnagy, jegyzőkönyvvezető; N. Bálint (15) sértett és édesanyja, N. Andrea.</p>
    <p>„A fiamnak, Bálintnak pár hete írt egy »Léna« nevű, vele egyidősnek tűnő lány Instagramon. Néhány nap múlva átterelte a beszélgetést Snapchatre, és több mint egy héten át »barátkozott« vele – közben képeket is küldött magáról –, majd rávette, hogy küldjön magáról egy bizalmas képet.</p>
    <p>Amint a kép megvolt, a hangnem megváltozott: a »lány« közölte, hogy képernyőképet készített, és ha Bálint nem utal el 150 000 forintot, elküldi a képet a követőinek, nekem és a barátainak. Határidőt is szabott. Bálint megijedt, de végül elmondta a nővérének, ő pedig nekem – így tettünk feljelentést.”</p>
    <p>A sértett előadta, hogy fizetni nem fizetett; a fenyegető üzenetekről képernyőképeket készített.</p>
    <p><b>Záradék:</b> A sértett Instagram- és Snapchat-fiókjáról igazságügyi adatmentés készült (BJ: 2025/BJ/1471). A nyomozás megállapította, hogy a »Léna« profil hamis, lopott fotókból, külföldről létrehozott álprofil, a pénzcsatorna pedig egy ismert, nemzetközi csaló-mintázathoz köthető.</p>
    <p style="margin-top:18px">Kelt: Budapest, 2025. 11. 18.<br>Varga Eszter r. főhadnagy</p></div>`);
  if (w === 'sertett') openModal(`<div class="inner"><h2 style="color:var(--rz-accent);margin-top:0">Sértett adatlapja</h2>
    <div class="mug big">KITAKARVA</div><div class="meta">
    <span>Név:</span><b>N. Bálint (kiskorú)</b><span>Életkor:</span><b>15 év</b><span>Lakóhely:</span><b>Budapest, XV. kerület</b>
    <span>Instagram:</span><b>${handle('balint')}</b><span>Snapchat:</span><b>balint_ngy</b>
    <span>Lefoglalt adat:</span><b>Instagram + Snapchat mentés (BJ: 2025/BJ/1471)</b><span>Kapcsolattartó:</span><b>N. Andrea (édesanya)</b></div>
    <p class="muted" style="margin-top:12px">Fontos: az ügy középpontjában álló kép a vizsgálati anyagban nem szerepel és nem megjeleníthető. A feladat megoldásához nincs is rá szükség.</p></div>`);
  if (w === 'kerdesek') openModal(`<div class="inner"><h2 style="color:var(--rz-accent);margin-top:0">Nyomozati kérdések</h2><ol class="q-list">
    <li>Hogyan és melyik felületen vette fel a kapcsolatot „Léna”, és mi árulkodott már az elején a fiókról?</li>
    <li>Mikor és hogyan váltott a beszélgetés fenyegetésbe, és pontosan mit követeltek?</li>
    <li>Mi bizonyítja, hogy „Léna” nem is létezett?</li>
    <li>Hová vezetett a pénz nyoma, és mit árul el a csalás jellegéről?</li>
    <li>Mit kellett volna tennie Bálintnak – és mit NEM szabad tenni?</li></ol></div>`);
}

/* =========================================================
   INSTAGRAM MOCK  (a 6. aktából átvett szerkezet)
   ========================================================= */
let IG = { view: 'home', arg: null, acct: 'balint' };
const igShell = (title, body, nav, opts = {}) => {
  const back = opts.back ? `<button class="ig-ic" id="igBack" aria-label="Vissza">←</button>` : `<a class="ig-ic" href="#/adattar" aria-label="Adattár" title="Adattár">🏠</a>`;
  const nUnread = Object.values(IG_DMS).filter(d => d.unread).length;
  const top = opts.logo
    ? `<div class="ig-top"><span class="ig-logo">Instagram</span><button class="ig-ic" data-igv="dm" aria-label="Üzenetek">✉️${nUnread ? `<span class="dot" style="position:static;margin-left:-6px">${nUnread}</span>` : ''}</button></div>`
    : `<div class="ig-top">${back}<span class="t">${title}</span>${opts.right || '<span style="width:28px"></span>'}</div>`;
  const navBar = nav === false ? '' : `<nav class="ig-nav">
      <button data-igv="home" class="${IG.view === 'home' ? 'on' : ''}">🏠</button>
      <button data-igv="search" class="${IG.view === 'search' || IG.view === 'profile' ? 'on' : ''}">🔍</button>
      <button data-igv="dm" class="${IG.view === 'dm' || IG.view === 'thread' ? 'on' : ''}">✉️${nUnread ? `<span class="dot">${nUnread}</span>` : ''}</button></nav>`;
  return `<div class="ig-note">🔒<span>Igazságügyi adatmentés – ${handle('balint')} fiókja. Csak megtekintésre.</span></div>${top}<div class="ig-body">${body}</div>${navBar}`;
};

function vIG() {
  app.className = 'v-ig';
  if (IG.view === 'search') return igSearch();
  if (IG.view === 'profile') return igProfile(IG.arg);
  if (IG.view === 'dm') return igDMList();
  if (IG.view === 'thread') return igThread(IG.arg);
  igHome();
}
function igNavBind() {
  $$('[data-igv]').forEach(b => b.onclick = () => { IG.view = b.dataset.igv; IG.arg = null; vIG(); });
  const bk = $('#igBack'); if (bk) bk.onclick = () => { IG.view = IG.back || 'home'; IG.arg = IG.backArg || null; IG.back = null; vIG(); };
}

function igHome() {
  const stories = IG_STORIES.map((s, i) => `<button class="ig-story" data-story="${i}">
      <span class="ring">${pp(s.k)}</span>
      <span class="n">${s.me ? 'Te' : esc(dispName(s.k))}</span></button>`).join('');
  const feed = IG_FEED.map(postHTML).join('');
  app.innerHTML = igShell('', `<div class="ig-stories">${stories}</div>${feed}`, true, { logo: true });
  igNavBind();
  $$('[data-story]').forEach(b => b.onclick = () => openStory(+b.dataset.story));
  bindPostActions();
}
function postHTML(p, idx) {
  const multi = p.imgs.length > 1;
  const slides = p.imgs.map((im, i) => `<div class="pslide" data-i="${i}" ${i ? 'hidden' : ''}>${pic(im, 'post-img')}</div>`).join('');
  const dots = multi ? `<div class="dots">${p.imgs.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : '';
  const nav = multi ? `<button class="nav l" data-pn="l" hidden>‹</button><button class="nav r" data-pn="r">›</button><span class="cnt">1/${p.imgs.length}</span>` : '';
  const cm = (p.comments || []).map(([u, t]) => `<div class="post-c"><b>${esc(u)}</b> ${esc(t)}</div>`).join('');
  return `<article class="post" data-post="${idx}">
    <div class="post-h" data-uprof="${p.by}">${pp(p.by)}<div><b>${esc(handle(p.by))}</b></div><span class="more">⋯</span></div>
    <div class="carousel">${slides}${nav}</div>
    <div class="post-a"><span>🤍</span><span>💬</span><span>➤</span><span class="bm">🔖</span></div>
    ${dots}
    <div class="post-t"><b>${p.likes} kedvelés</b></div>
    <div class="post-t"><b>${esc(handle(p.by))}</b> ${esc(p.cap)}</div>
    ${cm}
    <div class="post-date">${esc(p.date)}</div></article>`;
}
function bindPostActions() {
  $$('[data-uprof]').forEach(h => h.onclick = () => { IG.back = IG.view; IG.view = 'profile'; IG.arg = h.dataset.uprof; vIG(); });
  $$('.carousel').forEach(car => {
    const slides = $$('.pslide', car); if (slides.length < 2) return;
    let i = 0; const cnt = $('.cnt', car), l = $('[data-pn="l"]', car), r = $('[data-pn="r"]', car), dots = $$('.dots i', car.parentElement);
    const upd = () => { slides.forEach((s, k) => s.hidden = k !== i); if (cnt) cnt.textContent = `${i + 1}/${slides.length}`; if (l) l.hidden = i === 0; if (r) r.hidden = i === slides.length - 1; dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
    if (r) r.onclick = () => { if (i < slides.length - 1) { i++; upd(); } };
    if (l) l.onclick = () => { if (i > 0) { i--; upd(); } };
  });
}

/* ----- Instagram: keresés + profilok ----- */
function igSearch() {
  const list = Object.keys(IG_PROFILES);
  const rows = k => `<button class="urow" data-uprof="${k}">${pp(k)}<div class="i"><b>${esc(handle(k))}</b><small>${esc(dispName(k))}</small></div></button>`;
  app.innerHTML = igShell('Keresés', `<div class="ig-search">🔍<input id="igq" placeholder="Keresés" autocomplete="off"></div>
    <div id="igres">${list.map(rows).join('')}</div>`, true, {});
  igNavBind();
  const bind = () => $$('[data-uprof]').forEach(h => h.onclick = () => { IG.back = 'search'; IG.view = 'profile'; IG.arg = h.dataset.uprof; vIG(); });
  bind();
  $('#igq').oninput = e => {
    const q = norm(e.target.value);
    const found = Object.keys(IG_PROFILES).filter(k => norm(handle(k)).includes(q) || norm(dispName(k)).includes(q));
    $('#igres').innerHTML = found.length ? found.map(rows).join('') : '<p class="ig-empty">Nincs találat.</p>';
    bind();
  };
}
function igProfile(k) {
  const pr = IG_PROFILES[k];
  if (!pr) { IG.view = 'search'; return vIG(); }
  const hl = (pr.highlights || []).map(h => `<div class="ig-hl"><span class="hl">${pic(h)}</span><span>${esc(h.n)}</span></div>`).join('');
  const grid = (pr.grid || []).map((g, i) => `<button data-grid="${i}">${pic(g)}</button>`).join('');
  const warn = pr.fake ? `<div class="fake-warn">⚠ Gyanús fiók. Vizsgáljátok meg a <b>Fordított képkereső</b>vel és a <b>Fiókelemzés</b>sel!</div>` : '';
  app.innerHTML = igShell(handle(k), `${warn}<div class="ig-prof">
      <div class="ig-prof-top">${pp(k)}<div class="ig-stats"><div><b>${pr.posts != null ? pr.posts : (pr.grid || []).length}</b>bejegyzés</div><div><b>${pr.followers}</b>követő</div><div><b>${pr.following}</b>követett</div></div></div>
      <div class="ig-bio"><b>${esc(dispName(k))}</b>${esc(pr.bio)}</div>
      <div class="ig-btns"><button class="${k === 'balint' ? '' : 'blue'}">${k === 'balint' ? 'Profil szerkesztése' : 'Követés'}</button><button data-dm="${k}">Üzenet</button></div>
      ${hl ? `<div class="ig-hls">${hl}</div>` : ''}
    </div>
    <div class="ig-tabs"><span>▦</span><span>👤</span></div>
    <div class="grid3">${grid}</div>`, true, { back: true });
  igNavBind();
  const dmb = $('[data-dm]'); if (dmb) dmb.onclick = () => openThreadFor(k);
}
function openThreadFor(k) { if (!IG_DMS[k]) { toast('Nincs mentett üzenetváltás ezzel a fiókkal.'); return; } IG.view = 'thread'; IG.arg = k; vIG(); }

/* ----- Instagram: DM ----- */
function igDMList() {
  const rows = IG_DM_ORDER.map(k => {
    const d = IG_DMS[k], last = d.msgs[d.msgs.length - 1];
    const prev = last.vanish ? '📷 Fotó' : last.img ? '📷 Fénykép' : last.note ? '📎 rendszerüzenet' : (last.me ? 'Te: ' : '') + (last.x || '');
    return `<button class="urow" data-thread="${k}">${pp(k)}<div class="i"><b>${esc(handle(k))}</b><small class="${d.unread ? 'unread' : ''}">${esc(prev)}</small></div>${d.unread ? '<span class="bd"></span>' : ''}</button>`;
  }).join('');
  app.innerHTML = igShell(handle('balint'), `<div class="dm-h">${esc(handle('balint'))} <span>⌄</span></div>${rows}`, true, { back: false, right: '<span style="width:28px"></span>' });
  igNavBind();
  $$('[data-thread]').forEach(b => b.onclick = () => { IG.view = 'thread'; IG.arg = b.dataset.thread; vIG(); });
}
function igThread(k) {
  const d = IG_DMS[k]; if (!d) { IG.view = 'dm'; return vIG(); }
  if (d.unread) { d.unread = false; }
  let last = '', body = '';
  d.msgs.forEach(m => {
    const stamp = m.d + ' ' + m.t;
    if (stamp !== last) { body += `<div class="thr-time">${esc(m.d)} · ${esc(m.t)}</div>`; last = stamp; }
    const side = m.me ? 'me' : '';
    if (m.vanish) {
      body += `<div class="mrow ${side}">${m.them ? pp(k) : '<span class="sp"></span>'}<div class="bub vanish">📷 ${esc(m.vanish)} · Megnyitva</div></div>`;
      if (m.note) body += `<div class="dl">${esc(m.note)}</div>`;
    } else if (m.img) {
      body += `<div class="mrow ${side}">${m.them ? pp(k) : '<span class="sp"></span>'}<div class="bub img">${pic(m.img)}</div></div>`;
      if (m.note) body += `<div class="dl">${esc(m.note)}</div>`;
    } else if (m.note && !m.x) {
      body += `<div class="thr-sys">${esc(m.note)}</div>`;
    } else {
      body += `<div class="mrow ${side}">${m.them ? pp(k) : '<span class="sp"></span>'}<div class="bub">${esc(m.x)}</div></div>`;
    }
  });
  const hero = `<div class="thr-hero">${pp(k)}<b>${esc(handle(k))}</b><small>${esc(dispName(k))} · Instagram${who(k).fake ? ' · ismeretlen, új fiók' : ''}</small></div>`;
  app.innerHTML = igShell(handle(k), `<div class="thr">${hero}${body}</div>
    <div class="compose"><div>Üzenet…</div></div>`, false, { back: true });
  const bk = $('#igBack'); if (bk) bk.onclick = () => { IG.view = IG.back === 'profile' ? 'profile' : 'dm'; IG.arg = IG.back === 'profile' ? k : null; IG.back = null; vIG(); };
  if (who(k).fake) setTimeout(() => toast('Gyanús profil – futtassátok le a Fordított képkeresőt és a Fiókelemzést!'), 800);
}

/* ----- Instagram: sztori-néző ----- */
let STORY = null;
function openStory(i) { STORY = { g: i, s: 0 }; renderStory(); }
function closeStory() { if (STORY) clearTimeout(STORY.t); const el = $('#storyLayer'); if (el) el.remove(); STORY = null; }
function renderStory() {
  if (!STORY) return;
  const g = IG_STORIES[STORY.g]; if (!g) return closeStory();
  const sl = g.slides[STORY.s];
  const bars = g.slides.map((_, i) => `<i class="${i < STORY.s ? 'done' : i === STORY.s ? 'run' : ''}"><b></b></i>`).join('');
  const html = `<div id="storyLayer" class="story"><div class="story-in">
    ${pic(sl)}
    <div class="story-bars">${bars}</div>
    <div class="story-h">${pp(g.k)}<div><b style="color:#fff">${g.me ? 'te' : esc(handle(g.k))}</b></div><small>most</small><button id="stClose">×</button></div>
    ${sl.txt ? `<div class="story-txt"><span>${esc(sl.txt)}</span></div>` : ''}
    ${sl.meta ? `<div class="story-meta">📷 ${esc(sl.meta)}</div>` : ''}
    <button class="story-tap l" id="stPrev" aria-label="Előző"></button>
    <button class="story-tap r" id="stNext" aria-label="Következő"></button>
  </div></div>`;
  let layer = $('#storyLayer'); if (layer) layer.remove();
  document.body.insertAdjacentHTML('beforeend', html);
  $('#stClose').onclick = closeStory;
  $('#stNext').onclick = next; $('#stPrev').onclick = prev;
  clearTimeout(STORY.t); STORY.t = setTimeout(next, 5000);
  function next() { if (!STORY) return; clearTimeout(STORY.t); if (STORY.s < g.slides.length - 1) { STORY.s++; renderStory(); } else if (STORY.g < IG_STORIES.length - 1) { STORY.g++; STORY.s = 0; renderStory(); } else closeStory(); }
  function prev() { if (!STORY) return; clearTimeout(STORY.t); if (STORY.s > 0) { STORY.s--; renderStory(); } else if (STORY.g > 0) { STORY.g--; STORY.s = 0; renderStory(); } else renderStory(); }
}

/* =========================================================
   SNAPCHAT MOCK (a 6. aktából átvett szerkezet)
   ========================================================= */
let SC = { view: 'chats', arg: null };
function bitmoji(code, hue, ghost) {
  const h = hue == null ? 260 : hue;
  const skin = '#f0c9a8', hair = `hsl(${h} 45% 32%)`, shirt = `hsl(${h} 60% 52%)`;
  return `<svg class="face" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="74" r="26" fill="${shirt}"/>
    <path d="M18 34a22 22 0 0 1 44 0v8a22 22 0 0 1-44 0z" fill="${skin}"/>
    <path d="M16 34a24 20 0 0 1 48 0c0-14-10-24-24-24S16 20 16 34z" fill="${hair}"/>
    <circle cx="31" cy="38" r="3" fill="#3a2a20"/><circle cx="49" cy="38" r="3" fill="#3a2a20"/>
    <path d="M32 48q8 6 16 0" stroke="#b5744f" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${ghost ? '<circle cx="40" cy="40" r="40" fill="rgba(255,255,255,.35)"/>' : ''}
    <text x="40" y="70" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${esc(code || '')}</text></svg>`;
}
const scAvatar = k => { const p = who(k) || {}; return `<span class="av">${bitmoji((p.n || '?')[0], p.h)}</span>`; };
function scShell(body, nav) {
  const navBar = nav === false ? '' : `<nav class="sc-nav">
    <button class="chat ${SC.view === 'chats' || SC.view === 'chat' ? 'on' : ''}" data-scv="chats"><span>💬</span>Csevegés</button>
    <button data-scv="cam"><span>◎</span>Kamera</button>
    <button class="map ${SC.view === 'map' ? 'on' : ''}" data-scv="map"><span>📍</span>Térkép</button></nav>`;
  return `<div class="ig-note">🔒<span>Igazságügyi adatmentés – Bálint Snapchat-fiókja. Csak megtekintésre.</span></div>${body}${navBar}`;
}
function scNavBind() { $$('[data-scv]').forEach(b => b.onclick = () => { const v = b.dataset.scv; if (v === 'cam') { toast('A kamera nem része a mentésnek.'); return; } SC.view = v; SC.arg = null; vSC(); }); }
function vSC() {
  app.className = 'v-sc';
  if (SC.view === 'chat') return scChat(SC.arg);
  if (SC.view === 'map') return scMap();
  scChats();
}
function scChats() {
  const rows = SC_FRIENDS.map(f => {
    const last = f.chats[f.chats.length - 1];
    let icon = '<span class="st chat o"></span>', txt = 'Csevegés';
    if (last.snap) { icon = last.snap === 'me' ? '<span class="st sent o"></span>' : '<span class="st snap"></span>'; txt = last.snap === 'me' ? 'Elküldve' : 'Új Snap'; }
    else if (last.x) { icon = last.who === 'me' ? '<span class="st chat o"></span>' : '<span class="st chat"></span>'; txt = (last.who === 'me' ? 'Te: ' : '') + last.x; }
    else if (last.sys) { txt = 'Mentett beszélgetés'; }
    const streak = f.streak ? `<span class="streak">🔥 ${f.streak}</span>` : '';
    const nw = last.new || f.extort ? 'new' : '';
    return `<button class="sc-row" data-chat="${f.k}">${scAvatar(f.k)}<div class="i"><b>${esc(dispName(f.k))}</b><small class="${nw}">${icon}${esc(txt)}</small></div>${streak}</button>`;
  }).join('');
  app.innerHTML = scShell(`<div class="sc-top"><span class="sc-round">${bitmoji('B', (who('balint') || {}).h)}</span><h1>Csevegés</h1><span class="sc-round">✎</span></div><div class="sc-body">${rows}</div>`, true);
  scNavBind();
  $$('[data-chat]').forEach(b => b.onclick = () => { SC.view = 'chat'; SC.arg = b.dataset.chat; vSC(); });
}
function scChat(k) {
  const f = SC_FRIENDS.find(x => x.k === k); if (!f) { SC.view = 'chats'; return vSC(); }
  let last = '', body = '';
  f.chats.forEach(c => {
    if (c.d && c.d !== last) { body += `<div class="sc-day">${esc(c.d)}</div>`; last = c.d; }
    if (c.sys) { body += `<div class="sc-sys">${esc(c.sys)}</div>`; return; }
    if (c.snap) { body += `<div class="sc-blk"><div class="sc-who ${c.snap === 'me' ? 'me' : ''}">${c.snap === 'me' ? 'TE' : esc(dispName(k)).toUpperCase()}</div><div class="sc-m ${c.snap === 'me' ? 'me' : ''} snapitem"><span class="st ${c.snap === 'me' ? 'sent o' : 'snap'}"></span> ${c.snap === 'me' ? 'Snap elküldve' : 'Snap – lejárt'}</div></div>`; return; }
    if (c.shot) { body += `<div class="sc-shot"><i class="ssico"></i>${esc(dispName(c.shot))} készített egy képernyőképet!</div>`; return; }
    if (c.img) { const mi = c.who === 'me';
      body += `<div class="sc-blk"><div class="sc-who ${mi ? 'me' : ''}">${mi ? 'TE' : esc(dispName(k)).toUpperCase()}</div>
        <div class="sc-m ${mi ? 'me' : ''} saved sc-imgm"><span class="sv">Mentve a csevegésben</span><div class="sc-photo">${pic(c.img)}</div></div></div>`;
      if (c.note) body += `<div class="sc-sys" style="margin:2px auto 8px">${esc(c.note)}</div>`;
      return; }
    const me = c.who === 'me';
    body += `<div class="sc-blk"><div class="sc-who ${me ? 'me' : ''}">${me ? 'TE' : esc(dispName(k)).toUpperCase()}</div>
      <div class="sc-m ${me ? 'me' : ''} ${c.saved ? 'saved' : ''}">${c.saved ? '<span class="sv">Mentve a csevegésben</span>' : ''}${esc(c.x)}</div></div>`;
  });
  app.innerHTML = scShell(`<div class="sc-top"><button class="sc-round" id="scBack">←</button>${scAvatar(k)}<h1 style="text-align:left;font-size:16px;flex:1">${esc(dispName(k))} ${f.streak ? '🔥 ' + f.streak : ''}</h1><span class="sc-round">☰</span></div>
    <div class="sc-body sc-chat">${body}</div><div class="sc-compose"><div>Csevegés küldése…</div><span>📷</span></div>`, false);
  $('#scBack').onclick = () => { SC.view = 'chats'; vSC(); };
  if (f.extort) setTimeout(() => toast('A pénzkövetelés sablonos – elemezzétek az üzenetet és a pénznyomot!'), 800);
}

/* ----- Snap Térkép ----- */
function scMap() {
  const places = SNAP_MAP.places.map(pl => `<g transform="translate(${pl.x},${pl.y})"><circle r="30" fill="#dfe7d6" opacity=".8"/><text text-anchor="middle" y="4" font-size="12" fill="#5a6b52" font-weight="700">${esc(pl.name)}</text></g>`).join('');
  const roads = `<path d="M0 300 H640" stroke="#fff" stroke-width="14"/><path d="M300 0 V900" stroke="#fff" stroke-width="14"/><path d="M0 560 H640" stroke="#fff" stroke-width="10"/><path d="M470 0 V900" stroke="#fff" stroke-width="10"/>`;
  const pins = SNAP_MAP.people.map(pm => `<button class="bmj ${pm.me ? 'me' : ''} ${pm.ghost ? 'ghost' : ''}" data-map="${pm.k}" style="left:${pm.x}px;top:${pm.y}px">
      ${bitmoji(pm.me ? 'B' : (pm.code || (who(pm.k) || {}).n[0]), (who(pm.k) || {}).h, pm.ghost)}<span class="nm">${pm.me ? 'Te' : esc(dispName(pm.k))}</span></button>`).join('');
  app.innerHTML = scShell(`<div class="map-wrap"><div class="map-scroll"><div class="map-canvas">
      <svg viewBox="0 0 640 900" preserveAspectRatio="xMidYMid slice"><rect width="640" height="900" fill="#e7efe2"/>${roads}${places}</svg>
      ${pins}</div></div>
    <div class="map-top"><span class="sc-round">←</span><div class="srch">Barát vagy hely keresése</div></div>
    <div class="map-chip">🔥 Barátok</div>
    <div class="map-tray"><h4>Barátok a térképen</h4><div class="tray-row">${SNAP_MAP.people.filter(p => !p.me).map(pm => `<button data-map="${pm.k}">${bitmoji(pm.code || (who(pm.k) || {}).n[0], (who(pm.k) || {}).h, pm.ghost)}${esc(dispName(pm.k))}<small>${esc(pm.ago)}</small></button>`).join('')}</div></div>
    </div>`, true);
  scNavBind();
  $('.map-top .sc-round').onclick = () => { SC.view = 'chats'; vSC(); };
  $$('[data-map]').forEach(b => b.onclick = () => showMapCard(b.dataset.map));
}
function showMapCard(k) {
  const pm = SNAP_MAP.people.find(x => x.k === k); if (!pm) return;
  const ghost = pm.ghost;
  openModal(`<div class="fcard">${bitmoji(pm.code || (who(k) || {}).n[0], (who(k) || {}).h, ghost)}
    <h3>${esc(dispName(k))}</h3><div class="u">@${esc((who(k) || {}).u || k)}</div>
    <div class="loc"><b>Utolsó ismert hely</b>${ghost ? '<span class="ghost">📍 ' + esc(pm.loc) + '</span>' : esc(pm.loc)}<br><small style="color:#888">Frissítve: ${esc(pm.ago)}</small></div>
    ${k === 'lena' ? `<div class="loc" style="background:#fff4f4"><b>Nyomozói megjegyzés</b>„Léna” helymegosztása ki van kapcsolva, az utolsó bejelentkezés pedig <b>külföldi IP-ről, VPN mögül</b> érkezett – nem egy helyi, korabeli lány profilja.</div>` : ''}</div>`);
}

/* =========================================================
   NYOMOZATI ESZKÖZÖK
   ========================================================= */
async function runTerminal(lines) {
  const term = $('#term'); term.hidden = false; term.style.color = 'var(--rz-ok)'; term.textContent = '';
  for (const l of lines) { await sleep(500); term.textContent += l + '\n'; }
}

/* 1) Fordított képkeresés → lopott */
function vKepkereso() {
  app.className = 'v-rz';
  app.innerHTML = `<section class="rz-frame">${backBar('Fordított képkeresés')}
    <p class="muted">A rendszer megkeresi, hol tűnik még fel az interneten „Léna” profilképe. Futtassátok le a keresést!</p>
    <div class="tool-head">${pp('lena')}<div><b>${esc(REVERSE.target)}</b><br><small class="muted">Ezt a képet használja a gyanús fiók.</small></div></div>
    <button class="rz-btn solid" id="run">KERESÉS FUTTATÁSA</button>
    <div class="terminal" id="term" hidden></div><div id="res"></div></section>`;
  if (S.clues.lopott) showRev();
  $('#run').onclick = async () => {
    $('#run').disabled = true;
    await runTerminal(['> Kép beolvasása…', '> Egyezések keresése a weben…', `> ${REVERSE.hits.length} találat más profilokon.`]);
    await sleep(300); showRev(); setTimeout(() => addClue('lopott'), 400);
  };
}
function showRev() {
  const rows = REVERSE.hits.map(h => `<div class="rec-item"><b>${esc(h.name)}</b> <span class="muted">${esc(h.handle)}</span><br><small>${esc(h.where)} · ${esc(h.note)}</small></div>`).join('');
  $('#res').innerHTML = `<div class="tag" style="margin:6px 0">TALÁLATOK</div>${rows}
    <div class="verdict"><p><b>Következtetés:</b> ${esc(REVERSE.concl)}</p></div>`;
  const run = $('#run'); if (run) run.style.display = 'none';
}

/* 2) Fiókelemzés → hamis */
/* 2+4) Fiók- és pénznyomozás – EGYESÍTVE, KÉT INTERAKTÍV LÉPÉS
   1. lépés: gyanújel-kereső (koppints a valódi árulkodó jelekre) → hamis
   2. lépés: a pénz útjának lépésenkénti követése + következtetés → penz */
function vNyomozas() {
  app.className = 'v-rz';
  const bothDone = S.clues.hamis && S.clues.penz;
  app.innerHTML = `<section class="rz-frame">${backBar('Fiók- és pénznyomozás')}
    ${bothDone ? '<div class="redo-note">✓ Ezt az állomást már teljesítettétek – újra kipróbálhatjátok.</div>' : ''}
    <div class="tool-head"><span class="step-badge">1. lépés</span><h3>Ki áll a profil mögött?</h3></div>
    <p class="muted">„Léna” fiókjának adatai. Koppintsatok rá azokra, amelyek <b>árulkodó gyanújelek</b> – melyik utal hamis, frissen gyártott fiókra?</p>
    <div class="acct-card"><b>Fiók:</b> ${esc(FAKEACCT.handle)} &nbsp;·&nbsp; <b>Létrehozva:</b> ${esc(FAKEACCT.created)} &nbsp;·&nbsp; <b>Első üzenet:</b> ${esc(FAKEACCT.firstContact)}</div>
    <div class="flagpick" id="flagpick">${FAKEACCT.facts.map((f, i) => `<button class="flag-chip" data-i="${i}">${esc(f.t)}</button>`).join('')}</div>
    <div class="flag-prog" id="flagprog"></div>
    <div id="acctres"></div>
    <div id="part2" hidden>
      <hr class="tool-sep">
      <div class="tool-head"><span class="step-badge">2. lépés</span><h3>Hová vezet a pénz?</h3></div>
      <p class="muted">Kövessétek végig a pénz útját lépésről lépésre, majd vonjátok le a következtetést!</p>
      <ol class="trace" id="trace"></ol>
      <button class="rz-btn solid" id="next" style="width:100%">KÖVETKEZŐ NYOM ▶</button>
      <div id="verdictbox" hidden></div>
    </div></section>`;

  /* ---- 1. lépés: gyanújel-kereső ---- */
  const reds = FAKEACCT.facts.map((f, i) => f.red ? i : -1).filter(i => i >= 0);
  const found = new Set();
  const prog = () => { $('#flagprog').textContent = `Megtalált gyanújelek: ${found.size}/${reds.length}`; };
  prog();
  const openPart2 = () => { $('#part2').hidden = false; if (!$('#trace').children.length) revealStep(); };
  const finishA = () => {
    if (!$('#acctres').innerHTML) $('#acctres').innerHTML = `<div class="verdict"><p><b>Következtetés:</b> ${esc(FAKEACCT.concl)}</p></div>`;
    if (!S.clues.hamis) addClue('hamis');
    openPart2();
  };
  $$('.flag-chip').forEach(b => b.onclick = () => {
    const i = +b.dataset.i, f = FAKEACCT.facts[i];
    if (f.red) {
      if (found.has(i)) return;
      b.classList.add('flagged'); b.disabled = true; found.add(i); prog();
      if (found.size === reds.length) finishA();
    } else {
      b.classList.add('neutral'); toast(f.fb || 'Ez önmagában nem gyanújel.');
      setTimeout(() => b.classList.remove('neutral'), 900);
    }
  });

  /* ---- 2. lépés: pénznyom ---- */
  let shown = 0;
  const traceEl = () => $('#trace');
  function showVerdict() {
    const vb = $('#verdictbox'); vb.hidden = false;
    vb.innerHTML = `<div class="react-q"><h4>${esc(PAYTRACE.q)}</h4>
      ${PAYTRACE.opts.map((o, i) => `<button class="react-opt" data-o="${i}">${esc(o.t)}</button>`).join('')}
      <div class="react-fb" hidden></div></div>`;
    $$('#verdictbox .react-opt').forEach(b => b.onclick = () => {
      const o = PAYTRACE.opts[+b.dataset.o], box = b.closest('.react-q');
      $$('.react-opt', box).forEach(x => x.classList.remove('good', 'bad'));
      b.classList.add(o.ok ? 'good' : 'bad');
      const fb = $('.react-fb', box); fb.hidden = false; fb.className = 'react-fb ' + (o.ok ? 'good' : 'bad'); fb.innerHTML = `${o.ok ? '✓' : '✕'} ${esc(o.fb)}`;
      if (o.ok) { $$('.react-opt', box).forEach(x => x.disabled = true); vb.insertAdjacentHTML('beforeend', `<div class="verdict"><p><b>Következtetés:</b> ${esc(PAYTRACE.concl)}</p></div>`); if (!S.clues.penz) addClue('penz'); }
    });
  }
  function revealStep() {
    if (shown >= PAYTRACE.steps.length) return;
    const s = PAYTRACE.steps[shown];
    traceEl().insertAdjacentHTML('beforeend', `<li class="trace-step"><b>${esc(s.t)}</b><span>${esc(s.d)}</span></li>`);
    shown++;
    if (shown >= PAYTRACE.steps.length) { $('#next').style.display = 'none'; showVerdict(); }
  }
  $('#next').onclick = revealStep;
}

/* 3) Üzenetelemzés → sablon  (INTERAKTÍV: üzenet–trükk párosítás) */
function vUzenetelemzes() {
  app.className = 'v-rz';
  const done = S.clues.sablon;
  const tacts = CHATSCAN.tactics;
  app.innerHTML = `<section class="rz-frame">${backBar('Üzenetelemzés')}
    ${done ? '<div class="redo-note">✓ Ezt az állomást már teljesítettétek – újra kipróbálhatjátok.</div>' : ''}
    <p class="muted">Olvassátok el a beszélgetés kiemelt üzeneteit, és mindegyikhez válasszátok ki, milyen csaló-trükköt takar! Ha mind a négy stimmel, a rendszer rögzíti a bizonyítékot.</p>
    <div id="match">${CHATSCAN.items.map((it, i) => `<div class="match-q" data-i="${i}">
      <div class="match-msg">${esc(it.msg)}</div>
      <div class="match-opts">${tacts.map(tt => `<button class="tactic-btn" data-i="${i}" data-id="${tt.id}">${esc(tt.t)}</button>`).join('')}</div>
      <div class="match-fb" hidden></div></div>`).join('')}</div>
    <div id="uzres"></div></section>`;
  const solved = new Set();
  const finish = () => {
    if (solved.size < CHATSCAN.items.length) return;
    if (!$('#uzres').innerHTML) $('#uzres').innerHTML = `<div class="verdict"><p><b>Következtetés:</b> ${esc(CHATSCAN.concl)}</p></div>`;
    if (!S.clues.sablon) addClue('sablon');
  };
  $$('.tactic-btn').forEach(b => b.onclick = () => {
    const i = +b.dataset.i, it = CHATSCAN.items[i], box = b.closest('.match-q');
    const fb = $('.match-fb', box); fb.hidden = false;
    if (b.dataset.id === it.a) {
      b.classList.remove('bad'); b.classList.add('good');
      fb.className = 'match-fb good'; fb.textContent = '✓ Helyes.';
      $$('.tactic-btn', box).forEach(x => x.disabled = true);
      solved.add(i); finish();
    } else {
      b.classList.add('bad'); fb.className = 'match-fb bad'; fb.textContent = '✕ Nem ez – próbáld újra.';
    }
  });
}

/* Záró: csalás-adatbázis (4/4 után) */
function vCsalasDB() {
  app.className = 'v-rz';
  if (clueCount() < 4) {
    app.innerHTML = `<section class="rz-frame">${backBar('Csalás-adatbázis 🔒')}<p class="muted">Még ${4 - clueCount()} bizonyíték hiányzik. Gyűjtsétek össze őket az eszközökkel!</p>
      <div class="clue-row" style="margin-top:10px">${CLUE_KEYS.map(k => `<span class="clue-chip ${S.clues[k] ? 'on' : ''}">${S.clues[k] ? '✓' : '○'} ${CLUE_LABELS[k]}</span>`).join('')}</div></section>`;
    return;
  }
  app.innerHTML = `<section class="rz-frame">${backBar('Csalás-adatbázis')}
    <p class="muted">A négy bizonyíték együtt lekérdezhető a nemzetközi csalás-adatbázisban.</p>
    <div class="rflags"><h4>Összegyűjtött bizonyítékok</h4><ul>
      <li>Lopott profilkép (a fotó máshol, más néven is fent van)</li>
      <li>Hamis, frissen, külföldről létrehozott fiók</li>
      <li>Sablonos, begyakorolt fenyegetés</li>
      <li>Külföldre futó, több áldozatnál felbukkanó pénzcsatorna</li></ul></div>
    <button class="rz-btn solid" id="run" style="width:100%">LEKÉRDEZÉS FUTTATÁSA</button>
    <div class="terminal" id="term" hidden></div><div id="res"></div></section>`;
  if (S.solved) showFraud();
  $('#run').onclick = async () => {
    $('#run').disabled = true;
    await runTerminal(['> Bizonyítékok összevetése az adatbázissal…', '> Fiók, fotó és pénzcsatorna keresése…', '> EGYEZÉS: ismert mintázat.']);
    await sleep(300); showFraud();
  };
}
function showFraud() {
  const first = !S.solved; S.solved = true; save();
  const run = $('#run'); if (run) run.style.display = 'none';
  $('#res').innerHTML = `<div class="found">✓ AZONOSÍTOTTÁTOK A CSALÁS TÍPUSÁT</div>
    <div class="verdict"><h4>Kapcsolódó ügy: ${CASE_NO}</h4>
      <p><b>Egyezés:</b> ${esc(FRAUD.match)}.</p>
      <p><b>Kiterjedés:</b> ${esc(FRAUD.victims)}. ${esc(FRAUD.region)}.</p>
      <p><b>Következtetés:</b> ${esc(FRAUD.concl)}</p>
      <p><b>Bűncselekmény:</b> zsarolás; kiskorú sérelmére elkövetett, hozzájárulás nélküli, szeméremsértő felvétellel való visszaélés; személyes adattal / megtévesztéssel elkövetett csalás. Az, hogy a „lány” kitalált és külföldi, nem enyhíti a bűncselekményt.</p>
      <p><b>Fontos:</b> a történtekért soha nem a sértett a felelős – a manipuláció áldozatává válni nem szégyen. Ne fizess, ne törölj bizonyítékot, tiltsd és jelentsd a fiókot, és kérj segítséget. Segítség: Kék Vonal 116-111; a kép terjedése ellen StopNCII / Take It Down; és a rendőrség.</p>
      <p><a class="rz-btn solid" style="display:block" href="#/reakcio">TOVÁBB: A HELYES REAKCIÓ →</a></p></div>`;
  if (first) toast('Megfejtettétek: hamis profil, szervezett csalás!');
}

/* Döntési állomás – a helyes reakció */
function vReakcio() {
  app.className = 'v-rz';
  app.innerHTML = `<section class="rz-frame">${backBar('A helyes reakció')}
    <p class="muted">Mit tegyen az áldozat? Válasszatok minden kérdésnél – a rendszer jelzi, jó-e a döntés.</p>
    <div id="react">${REACT.map((q, qi) => `<div class="react-q" data-q="${qi}"><h4>${esc(q.q)}</h4>
      ${q.opts.map((o, oi) => `<button class="react-opt" data-q="${qi}" data-o="${oi}">${esc(o.t)}</button>`).join('')}
      <div class="react-fb" hidden></div></div>`).join('')}</section>`;
  $$('.react-opt').forEach(b => b.onclick = () => {
    const qi = +b.dataset.q, oi = +b.dataset.o, o = REACT[qi].opts[oi];
    const box = b.closest('.react-q');
    $$('.react-opt', box).forEach(x => { x.classList.remove('good', 'bad'); x.disabled = false; });
    b.classList.add(o.ok ? 'good' : 'bad');
    const fb = $('.react-fb', box); fb.hidden = false; fb.className = 'react-fb ' + (o.ok ? 'good' : 'bad');
    fb.innerHTML = `${o.ok ? '✓' : '✕'} ${esc(o.fb)}`;
    if (o.ok) $$('.react-opt', box).forEach(x => x.disabled = true);
  });
}

/* ---------- Indítás ---------- */
const setVh = () => document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
setVh(); window.addEventListener('resize', setVh); window.addEventListener('orientationchange', setVh);
preloadImages();
route();
