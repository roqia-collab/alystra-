const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;

/* ---------- Chargement ---------- */
const finishLoad = () => { $('#loader')?.classList.add('done'); document.body.classList.add('loaded'); };
if ($('#loader')) {
  window.addEventListener('load', () => setTimeout(finishLoad, reduce ? 0 : 700));
  setTimeout(finishLoad, 3000);
} else {
  setTimeout(finishLoad, 60);
}

/* ---------- Header + barre de progression ---------- */
const header = $('#header');
const progress = $('#progress');
let lastY = 0;
const onScroll = () => {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle('scrolled', y > 30);
    header.classList.toggle('hide', y > lastY && y > 500 && !document.body.classList.contains('menu-open'));
  }
  lastY = y;
  if (progress) progress.style.width = (y / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100 + '%';
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Menu mobile ---------- */
const burger = $('#burger'), mmenu = $('#mmenu');
if (burger && mmenu) {
  const set = (open) => {
    mmenu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
    $$('a', mmenu).forEach((a, i) => { a.style.transitionDelay = open ? 0.05 + i * 0.035 + 's' : '0s'; });
  };
  burger.addEventListener('click', () => set(!mmenu.classList.contains('open')));
  $$('a', mmenu).forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 960) set(false); });
}

/* ---------- Apparition au défilement ---------- */
let pending = $$('.reveal, .reveal-img');
const revealCheck = () => {
  if (!pending.length) return;
  const vh = innerHeight;
  const batch = pending.filter(el => { const r = el.getBoundingClientRect(); return r.top < vh * 0.92 && r.bottom > 0; });
  batch.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 5) * 0.08 + 's'; el.classList.add('in'); });
  pending = pending.filter(el => !el.classList.contains('in'));
};
addEventListener('scroll', revealCheck, { passive: true });
addEventListener('resize', revealCheck);
revealCheck();
setInterval(revealCheck, 400);

/* ---------- Halo autour du curseur ---------- */
const glow = $('#glow');
if (glow && fine && !reduce) {
  let gx = -700, gy = -700, tx = gx, ty = gy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; requestAnimationFrame(loop); })();
}

/* ---------- Boutons magnétiques ---------- */
if (fine && !reduce) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Cartes inclinables ---------- */
if (fine && !reduce) {
  $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = `perspective(1000px) rotateY(${(x - .5) * 6}deg) rotateX(${(.5 - y) * 6}deg) translateY(-6px)`;
    });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });
}

/* ---------- Parallaxe souris (hero) ---------- */
const hv = $('#heroVisual');
if (hv && fine && !reduce) {
  const layers = $$('[data-depth]', hv);
  addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    layers.forEach(l => { const d = +l.dataset.depth; l.style.translate = `${x * d}px ${y * d}px`; });
  });
}

/* ---------- Parallaxe des images + frise ---------- */
const para = $$('[data-parallax]');
const timeline = $('#timeline'), fill = $('#fill');
const steps = timeline ? $$('.step', timeline) : [];
const onFrame = () => {
  const vh = innerHeight;
  if (!reduce) para.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    img.style.transform = `translate3d(0, ${(r.top + r.height / 2 - vh / 2) * -+img.dataset.parallax}px, 0)`;
  });
  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * .8 - r.top) / (r.height + vh * .2)));
    if (fill) fill.style.width = p * 100 + '%';
    steps.forEach((s, i) => s.classList.toggle('on', p >= i / steps.length + .02 || p >= .98));
  }
};
addEventListener('scroll', onFrame, { passive: true });
addEventListener('resize', onFrame);
onFrame();

/* ---------- Texte qui s'allume mot par mot ---------- */
const split = $('#splitText');
if (split && !reduce) {
  split.innerHTML = split.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', split);
  const lit = () => {
    const r = split.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .9 - r.top) / (r.height + innerHeight * .3)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  };
  addEventListener('scroll', lit, { passive: true }); lit();
}

/* ---------- Mots qui changent ---------- */
const rot = $('#rotator');
if (rot && !reduce) {
  const items = $$(':scope > span', rot); let k = 0;
  setInterval(() => { items[k].classList.remove('on'); k = (k + 1) % items.length; items[k].classList.add('on'); }, 2600);
}

/* ---------- Compteurs (la vraie valeur est déjà dans le HTML pour Google) ---------- */
let counters = reduce ? [] : $$('.count');
const countCheck = () => {
  counters = counters.filter(el => {
    const r = el.getBoundingClientRect();
    if (r.top > innerHeight * .9 || r.bottom < 0) return true;
    const to = +el.dataset.to, t0 = performance.now(), dur = 1500;
    const tick = () => { const p = Math.min(1, (performance.now() - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) setTimeout(tick, 16); };
    tick(); return false;
  });
};
addEventListener('scroll', countCheck, { passive: true });
setTimeout(countCheck, 600);
setInterval(countCheck, 500);

/* ---------- Réseau de neurones animé ---------- */
const cv = $('#net');
if (cv && !reduce) {
  const ctx = cv.getContext('2d');
  let w, h, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.offsetWidth; h = cv.offsetHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(80, Math.floor(w * h / 17000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, c: Math.random() }));
  };
  resize(); addEventListener('resize', resize);
  cv.parentElement.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  (function draw() {
    requestAnimationFrame(draw);
    if (scrollY > h + 200) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140 && d > 0) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 140) { ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 140) * .25})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const p of pts) {
      ctx.fillStyle = p.c < .5 ? 'rgba(79,70,229,.55)' : p.c < .8 ? 'rgba(124,58,237,.55)' : 'rgba(37,99,235,.55)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.c > .85 ? 2.6 : 1.7, 0, 7); ctx.fill();
    }
  })();
}

/* ---------- Démo de discussion ---------- */
const chat = $('#chat');
if (chat) {
  const script = [
    ['user', 'Bonjour, je voudrais automatiser la prise de rendez-vous de mon cabinet.'],
    ['bot', 'Avec plaisir ! Combien de demandes recevez-vous environ <b>par semaine</b> ?'],
    ['user', 'Une cinquantaine, surtout par téléphone et WhatsApp.'],
    ['bot', 'Un agent IA peut les gérer pour vous, 24h/24. Je vous propose un appel découverte <b>demain à 10h</b> ou <b>14h30</b> ?'],
    ['user', '14h30, parfait.'],
    ['bot', 'C\'est noté ✅ Rendez-vous confirmé demain à 14h30. Un récapitulatif vient de vous être envoyé par e-mail.'],
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const add = (cls, html) => {
    const d = document.createElement('div'); d.className = cls; d.innerHTML = html; chat.appendChild(d);
    while (chat.scrollHeight > chat.clientHeight + 4 && chat.children.length > 1) chat.firstElementChild.remove();
    return d;
  };
  let running = false;
  const run = async () => {
    if (running) return; running = true;
    while (true) {
      chat.innerHTML = '';
      for (const [who, text] of script) {
        if (who === 'bot') { const t = add('typing', '<i></i><i></i><i></i>'); await wait(1300); t.remove(); }
        else await wait(700);
        add('msg ' + who, text);
        await wait(1100);
      }
      await wait(4000);
    }
  };
  if (reduce) script.forEach(([w, t]) => add('msg ' + w, t));
  else {
    const startChat = () => { const r = chat.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { run(); removeEventListener('scroll', startChat); } };
    addEventListener('scroll', startChat, { passive: true }); startChat();
  }
}

/* ---------- Vitrine des 10 services IA ---------- */
const ais = $('#ais');
if (ais) {
  const items = $$('.ais-item', ais);
  const panel = $('.ais-panel', ais);
  const num = $('.ais-num', ais), tile = $('.ais-icon .tile', ais);
  const count = $('.ais-count b', ais), title = $('.ais-content h3', ais);
  const text = $('.ais-content p', ais), chips = $('.ais-content .chips', ais);
  const bar = $('.ais-progress i', ais);
  const desktop = () => innerWidth > 1080;
  let cur = 0, timer = null, swapT = null;

  const restartBar = () => {
    if (!bar) return;
    bar.classList.remove('run'); void bar.offsetWidth;
    if (desktop() && !reduce) bar.classList.add('run');
  };
  const show = (i, user) => {
    const prev = cur;
    cur = (i + items.length) % items.length;
    items.forEach((it, k) => {
      it.classList.toggle('active', k === cur);
      $('.ais-tab', it).setAttribute('aria-expanded', String(k === cur));
    });
    if (panel && prev !== cur) {
      const it = items[cur];
      panel.classList.add('swap');
      clearTimeout(swapT);
      swapT = setTimeout(() => {
        const n = String(cur + 1).padStart(2, '0');
        num.textContent = n; count.textContent = n;
        title.textContent = $('.t', it).textContent;
        text.textContent = $('.ais-detail p', it).textContent;
        chips.innerHTML = $('.ais-detail .chips', it).innerHTML;
        tile.innerHTML = $('.ais-tab .ic', it).innerHTML;
        panel.classList.remove('swap');
      }, reduce ? 0 : 280);
    }
    if (user) stop();
    restartBar();
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (!desktop() || reduce) return;
    restartBar();
    timer = setInterval(() => { if (!ais.matches(':hover')) show(cur + 1); }, 6000);
  };

  items.forEach((it, k) => $('.ais-tab', it).addEventListener('click', () => {
    if (!desktop() && k === cur && it.classList.contains('active')) { it.classList.remove('active'); $('.ais-tab', it).setAttribute('aria-expanded', 'false'); cur = -1; return; }
    show(k, true);
  }));
  $('.ais-prev', ais)?.addEventListener('click', () => show(cur - 1, true));
  $('.ais-next', ais)?.addEventListener('click', () => show(cur + 1, true));

  // démarre la rotation quand la vitrine est visible
  const visCheck = () => {
    const r = ais.getBoundingClientRect();
    const vis = r.top < innerHeight * .8 && r.bottom > innerHeight * .2;
    if (vis && !timer && desktop()) start();
    if (!vis && timer) { stop(); bar?.classList.remove('run'); }
  };
  addEventListener('scroll', visCheck, { passive: true });
  addEventListener('resize', visCheck);
  visCheck();
}

/* ---------- Page éditoriale : aperçu photo au survol des services ---------- */
const preview = $('.idx-preview');
if (preview && fine && !reduce) {
  const pimg = $('img', preview);
  let px = 0, py = 0, tx = 0, ty = 0, raf = null;
  const loop = () => { px += (tx - px) * .18; py += (ty - py) * .18; preview.style.left = px + 'px'; preview.style.top = py + 'px'; raf = requestAnimationFrame(loop); };
  $$('.idx-row').forEach(row => {
    row.addEventListener('mouseenter', e => {
      if (pimg.getAttribute('src') !== row.dataset.img) pimg.src = row.dataset.img;
      tx = px = e.clientX + 170; ty = py = e.clientY;
      preview.classList.add('on'); if (!raf) loop();
    });
    row.addEventListener('mousemove', e => { tx = e.clientX + 170; ty = e.clientY; });
    row.addEventListener('mouseleave', () => { preview.classList.remove('on'); cancelAnimationFrame(raf); raf = null; });
  });
}

/* ---------- Page éditoriale : onglets des cas d'usage ---------- */
$$('.uc').forEach(uc => {
  const tabs = $$('.uc-tab', uc), panes = $$('.uc-pane', uc);
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('on', x === t));
    panes.forEach(p => p.classList.toggle('on', p.dataset.k === t.dataset.k));
  }));
});

/* ---------- Formulaire de devis ---------- */
const form = $('#contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const note = $('#formNote');
    if (!d.nom || !d.email || !d.message) {
      note.textContent = 'Merci de renseigner votre nom, votre e-mail et la description de votre projet.';
      note.style.color = '#dc2626'; return;
    }
    const subject = `Demande de devis — ${d.besoin} — ${d.nom}`;
    const body = `Nom : ${d.nom}\nEntreprise : ${d.entreprise || '-'}\nE-mail : ${d.email}\nTéléphone : ${d.tel || '-'}\nBesoin : ${d.besoin}\nBudget : ${d.budget}\n\n${d.message}`;
    location.href = `mailto:contact@alystra.tech?cc=info.alystra@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Merci ! Votre messagerie s\'ouvre pour finaliser l\'envoi.';
    note.style.color = '#16a34a';
  });
}

const y = $('#year');
if (y) y.textContent = new Date().getFullYear();
