const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;

/* ---------- Loader ---------- */
const finishLoad = () => {
  const l = $('#loader');
  if (l) l.classList.add('done');
  document.body.classList.add('loaded');
};
window.addEventListener('load', () => setTimeout(finishLoad, reduce ? 0 : 900));
setTimeout(finishLoad, 3500); // sécurité si une image tarde

/* ---------- Header + progress ---------- */
const header = $('#header');
const progress = $('#progress');
let lastY = 0;
const onScroll = () => {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle('scrolled', y > 30);
    header.classList.toggle('hide', y > lastY && y > 400 && !$('#nav')?.classList.contains('open'));
  }
  lastY = y;
  if (progress) progress.style.width = (y / (document.documentElement.scrollHeight - innerHeight)) * 100 + '%';
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const burger = $('#burger'), nav = $('#nav');
if (burger && nav) {
  const set = (open) => {
    nav.classList.toggle('open', open); burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => set(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
}

/* ---------- Reveal on scroll ---------- */
let pending = $$('.reveal, .reveal-img');
const revealCheck = () => {
  if (!pending.length) return;
  const vh = innerHeight;
  const batch = pending.filter(el => { const r = el.getBoundingClientRect(); return r.top < vh * 0.9 && r.bottom > 0; });
  batch.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 5) * 0.09 + 's'; el.classList.add('in'); });
  pending = pending.filter(el => !el.classList.contains('in'));
};
addEventListener('scroll', revealCheck, { passive: true });
addEventListener('resize', revealCheck);
revealCheck();
setInterval(revealCheck, 400); // filet de sécurité (ancres, navigation clavier…)

/* ---------- Cursor glow ---------- */
const glow = $('#glow');
if (glow && fine && !reduce) {
  let gx = -600, gy = -600, tx = gx, ty = gy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; requestAnimationFrame(loop); })();
}

/* ---------- Magnetic buttons ---------- */
if (fine && !reduce) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Tilt cards + spotlight ---------- */
if (fine && !reduce) {
  $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.transform = `perspective(1000px) rotateY(${(x - .5) * 7}deg) rotateX(${(.5 - y) * 7}deg)`;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
    });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });
}

/* ---------- Hero mouse parallax ---------- */
const hv = $('#heroVisual');
if (hv && fine && !reduce) {
  const layers = $$('[data-depth]', hv);
  addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    layers.forEach(l => { const d = +l.dataset.depth; l.style.translate = `${x * d}px ${y * d}px`; });
  });
}

/* ---------- Scroll parallax images ---------- */
const para = $$('[data-parallax]');
const timeline = $('#timeline'), fill = $('#fill');
const steps = timeline ? $$('.step', timeline) : [];
const onFrame = () => {
  const vh = innerHeight;
  if (!reduce) para.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = (r.top + r.height / 2 - vh / 2);
    img.style.transform = `translate3d(0, ${p * -+img.dataset.parallax}px, 0)`;
  });
  if (timeline && fill) {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * .75 - r.top) / (r.height + vh * .2)));
    fill.style.width = p * 100 + '%';
    steps.forEach((s, i) => s.classList.toggle('on', p >= i / steps.length + .02 || p >= .98));
  }
};
addEventListener('scroll', () => requestAnimationFrame(onFrame), { passive: true });
onFrame();

/* ---------- Word highlight on scroll ---------- */
const split = $('#splitText');
if (split) {
  split.innerHTML = split.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', split);
  const lit = () => {
    const r = split.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
    const n = reduce ? words.length : Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  };
  addEventListener('scroll', lit, { passive: true }); lit();
}

/* ---------- Rotating words ---------- */
const rot = $('#rotator');
if (rot && !reduce) {
  const items = $$(':scope > span', rot); let k = 0;
  setInterval(() => { items[k].classList.remove('on'); k = (k + 1) % items.length; items[k].classList.add('on'); }, 2600);
}

/* ---------- Counters ---------- */
let counters = $$('.count');
const countCheck = () => {
  counters = counters.filter(el => {
    const r = el.getBoundingClientRect();
    if (r.top > innerHeight * .9 || r.bottom < 0) return true;
    const to = +el.dataset.to, t0 = performance.now(), dur = 1600;
    if (reduce) { el.textContent = to; return false; }
    const tick = () => { const p = Math.min(1, (performance.now() - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) setTimeout(tick, 16); };
    tick(); return false;
  });
};
addEventListener('scroll', countCheck, { passive: true }); countCheck();
setInterval(countCheck, 500);

/* ---------- Neural network canvas ---------- */
const cv = $('#net');
if (cv && !reduce) {
  const ctx = cv.getContext('2d');
  let w, h, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.offsetWidth; h = cv.offsetHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor(w * h / 16000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, g: Math.random() < .18 }));
  };
  resize(); addEventListener('resize', resize);
  cv.parentElement.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  (function draw() {
    requestAnimationFrame(draw);
    if (scrollY > h) return; // hors écran : on économise le CPU
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) { ctx.strokeStyle = `rgba(212,175,106,${(1 - d / 130) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const p of pts) { ctx.fillStyle = p.g ? 'rgba(240,217,164,.9)' : 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.g ? 2.2 : 1.4, 0, 7); ctx.fill(); }
  })();
}

/* ---------- Live chat demo ---------- */
const chat = $('#chat');
if (chat) {
  const script = [
    ['user', 'Bonjour, je voudrais un devis pour un agent IA.'],
    ['bot', 'Avec plaisir ! Pour quel usage : <b>support client</b>, <b>prise de rendez-vous</b> ou <b>automatisation</b> ?'],
    ['user', 'Prise de rendez-vous pour mon cabinet.'],
    ['bot', 'Parfait. Je vous propose un appel découverte <b>demain à 10h</b> ou <b>14h30</b>. Quel créneau vous convient ?'],
    ['user', '14h30, parfait.'],
    ['bot', 'C\'est noté ✅ Rendez-vous confirmé demain à 14h30. Un récapitulatif vient de vous être envoyé par e-mail.'],
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const add = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; chat.appendChild(d); while (chat.scrollHeight > chat.clientHeight + 4 && chat.children.length > 1) chat.firstElementChild.remove(); return d; };
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

/* ---------- Contact form ---------- */
const form = $('#contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const note = $('#formNote');
    if (!d.nom || !d.email || !d.message) {
      note.textContent = 'Merci de renseigner votre nom, votre e-mail et votre message.';
      note.style.color = '#f08a7a'; return;
    }
    const subject = `Demande de contact — ${d.besoin} — ${d.nom}`;
    const body = `Nom : ${d.nom}\nEntreprise : ${d.entreprise || '-'}\nE-mail : ${d.email}\nTéléphone : ${d.tel || '-'}\nBesoin : ${d.besoin}\n\n${d.message}`;
    location.href = `mailto:info.alystra@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Merci ! Votre messagerie s\'ouvre pour finaliser l\'envoi.';
    note.style.color = '#4ade80';
  });
}

const y = $('#year');
if (y) y.textContent = new Date().getFullYear();
