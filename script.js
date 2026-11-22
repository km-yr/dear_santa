/* ==========================================================
   USTAWIENIA – tu możesz łatwo zmienić linki, podpis i treść
   ========================================================== */
const CONFIG = {
  gifts: [
    { label: 'Pierwszy', url: 'https://www.lego.com/pl-pl/product/vincent-van-gogh-the-starry-night-21333' },
    { label: 'Drugi',    url: 'https://www.westwing.pl/wazon-z-kamionki-dedali-s-25-cm-165355.html' }
  ],
  signature: 'Dzieci',
  letter: `
Drogi Mikołaju, minął rok cały,
pełen czułości i troski niemałej,
radości, śmiechu i wielkiej miłości,
a czy grzeczni byliśmy? No po możliwości!

Gałązka po gałązce gniazdko wijemy,
i w cieple, spokoju sobie w nim żyjemy,
a gdyż zimą w nim sny słodkie ścielimy,
to o nowy komplet pościeli prosimy.

Twe renifery są silne i zwinne,
więc mamy dwa pomysły, a każdy jest inny,
Pierwszy - to coś, co razem złożymy,
w Drugim - do domu wiosnę wpuścimy.
`
};

/* ========================================================== */

const NS = 'http://www.w3.org/2000/svg';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = reduced ? 0.03 : 1; // mnożnik czasu animacji

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms * T));

function play(el, keyframes, opts = {}) {
  const a = el.animate(keyframes, {
    fill: 'forwards',
    easing: 'ease-in-out',
    ...opts,
    duration: Math.max(1, (opts.duration || 400) * T),
    delay: (opts.delay || 0) * T
  });
  return a.finished.then(() => a);
}

const drawIn = (el, duration, opts = {}) =>
  play(el, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, ...opts });

/* ---------------- ŚNIEG ---------------- */
const Snow = (() => {
  const canvas = $('#snow');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, flakes = [], running = false, last = 0;

  // gotowy "płatek" z delikatnym cieniem – widoczny na jasnym tle
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const s = sprite.getContext('2d');
  s.shadowColor = 'rgba(70, 105, 150, .55)';
  s.shadowBlur = 5;
  s.fillStyle = '#fff';
  s.beginPath();
  s.arc(16, 16, 7, 0, Math.PI * 2);
  s.fill();

  function makeFlake(initial) {
    const r = 1.2 + Math.random() * 3.3;
    return {
      x: Math.random() * w,
      y: initial ? -Math.random() * h : -10,
      r,
      vy: 0.35 + r * 0.22 + Math.random() * 0.3,
      sway: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.65 + Math.random() * 0.35
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(170, Math.round((w * h) / 9000));
    while (flakes.length < target) flakes.push(makeFlake(true));
    flakes.length = target;
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min(3, (t - last) / 16.7 || 1);
    last = t;
    ctx.clearRect(0, 0, w, h);
    const time = t / 1000;
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.x += Math.sin(time * f.sway + f.phase) * 0.35 * dt + 0.08 * dt;
      if (f.y > h + 10 || f.x > w + 10) Object.assign(f, makeFlake(false), { x: Math.random() * w });
      ctx.globalAlpha = f.alpha;
      const size = f.r * 4;
      ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (reduced || running) return;
      resize();
      window.addEventListener('resize', resize);
      running = true;
      canvas.classList.add('on');
      requestAnimationFrame((t) => { last = t; frame(t); });
    }
  };
})();

/* ---------------- CHOINKA ---------------- */
const ORNAMENTS = [
  // x, y, promień, kolor
  [178, 166, 6, 0], [222, 166, 6, 1],
  [200, 204, 6, 2],
  [150, 246, 8, 1], [200, 251, 8, 0], [250, 246, 8, 2],
  [172, 292, 7, 2], [228, 292, 7, 0],
  [120, 333, 9, 0], [165, 343, 9, 2], [235, 343, 9, 1], [280, 333, 9, 0]
];
const COLORS = [
  ['#b23a3a', '#f8e3e3'],
  ['#c9a227', '#fbf3d9'],
  ['#3b6ea5', '#e3edf8']
];

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function buildOrnaments() {
  const group = $('#ornaments');
  return ORNAMENTS.map(([x, y, r, c]) => {
    const [stroke, fill] = COLORS[c];
    const g = svgEl('g', { class: 'ornament' });
    g.append(
      svgEl('path', { class: 'hook', d: `M${x} ${y - r - 7} L${x} ${y - r - 2}` }),
      svgEl('rect', { class: 'cap', x: x - 2.5, y: y - r - 3, width: 5, height: 3.2, rx: 1 }),
      svgEl('circle', { cx: x, cy: y, r, fill, stroke }),
      svgEl('path', {
        class: 'shine',
        d: `M${x - r * 0.55} ${y - r * 0.1} A${r * 0.6} ${r * 0.6} 0 0 1 ${x - r * 0.05} ${y - r * 0.6}`
      })
    );
    group.append(g);
    return g;
  });
}

function glint() {
  const g = $('#glint');
  g.animate(
    [
      { opacity: 0, transform: 'scale(0) rotate(0deg)' },
      { opacity: 1, transform: 'scale(1.35) rotate(40deg)', offset: 0.4 },
      { opacity: 0, transform: 'scale(0) rotate(90deg)' }
    ],
    { duration: 1200 * T, easing: 'ease-out' }
  );
}

let glintTimer = null;

async function treeSequence() {
  const [ground, left, right] = document.querySelectorAll('.ground, .tree-line');

  await sleep(400);
  drawIn(ground, 1400, { easing: 'ease-out' });
  setTimeout(() => Snow.start(), 900 * T);
  await Promise.all([drawIn(left, 2600), drawIn(right, 2600)]);

  // girlandy
  const garlands = document.querySelectorAll('.garland');
  for (const gl of garlands) {
    drawIn(gl, 800, { easing: 'ease-out' });
    await sleep(320);
  }
  await sleep(400);

  // bombki
  const orns = buildOrnaments();
  for (const o of orns) {
    play(o, [
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 1, transform: 'scale(1.25)', offset: 0.6 },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 520, easing: 'ease-out' }).then((a) => {
      o.style.opacity = 1;
      a.cancel();
      o.style.animationDelay = `${-Math.random() * 3}s`;
      o.classList.add('swing');
    });
    await sleep(140);
  }
  await sleep(700);

  // gwiazda
  const star = $('#star');
  await drawIn(star, 1000);
  star.classList.add('lit');
  await play(star, [{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 600 });
  await sleep(250);

  // blik światła na najwyższym ramieniu gwiazdy
  glint();
  glintTimer = setInterval(glint, 5500);
  await sleep(1100);

  const btn = $('#open-letter');
  btn.disabled = false;
  btn.classList.add('show');
}

/* ---------------- LIST ---------------- */
function buildLetter() {
  const box = $('#letter-text');
  const seq = [];
  const stanzas = CONFIG.letter.trim().split(/\n\s*\n/);

  stanzas.forEach((stanza, si) => {
    const sEl = document.createElement('div');
    sEl.className = 'stanza';
    const lines = stanza.trim().split('\n');

    lines.forEach((line, li) => {
      const lEl = document.createElement('div');
      lEl.className = 'line';
      const words = line.trim().split(/\s+/);

      words.forEach((word, wi) => {
        const wEl = document.createElement('span');
        wEl.className = 'word';
        [...word].forEach((ch, ci) => {
          const c = document.createElement('span');
          c.className = 'ch';
          c.textContent = ch;
          wEl.append(c);
          let pause = 0;
          if (',;:'.includes(ch)) pause = 260;
          if ('.!?'.includes(ch)) pause = 420;
          if (ch === '-') pause = 200;
          const lastInWord = ci === word.length - 1;
          if (lastInWord) pause += 45; // odstęp między słowami
          const lastInLine = lastInWord && wi === words.length - 1;
          if (lastInLine) pause += 380;
          if (lastInLine && li === lines.length - 1) pause += 750;
          seq.push({ el: c, pause, lineStart: wi === 0 && ci === 0 });
        });
        lEl.append(wEl);
        if (wi < words.length - 1) lEl.append(document.createTextNode(' '));
      });
      sEl.append(lEl);
    });
    box.append(sEl);
  });

  // podpis
  const sig = $('#signature-text');
  const sigSeq = [...CONFIG.signature].map((ch) => {
    const c = document.createElement('span');
    c.className = 'ch';
    c.textContent = ch;
    sig.append(c);
    return { el: c, pause: 90, lineStart: false };
  });
  if (sigSeq[0]) sigSeq[0].lineStart = true;

  $('#letter-sr').textContent = CONFIG.letter.trim().replace(/\n+/g, ' ') + ' — ' + CONFIG.signature;
  return { seq, sigSeq };
}

const pen = $('#pen');
const letterEl = $('#letter');

function placePen(ch) {
  const a = letterEl.getBoundingClientRect();
  const r = ch.getBoundingClientRect();
  pen.style.left = `${r.right - a.left - 3}px`;
  pen.style.top = `${r.bottom - a.top - r.height * 0.28 - 35}px`;
}

function keepInView(ch) {
  const r = ch.getBoundingClientRect();
  if (r.bottom > window.innerHeight - 90) {
    window.scrollBy({ top: r.bottom - window.innerHeight * 0.55, behavior: reduced ? 'auto' : 'smooth' });
  }
}

async function write(seq) {
  for (const item of seq) {
    if (item.lineStart) keepInView(item.el);
    item.el.classList.add('on');
    placePen(item.el);
    await sleep(38 + Math.random() * 30 + item.pause);
  }
}

function buildGifts() {
  const wrap = $('#gifts');
  return CONFIG.gifts.map((g, i) => {
    const a = document.createElement('a');
    a.className = `gift gift--${i + 1}`;
    a.href = g.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `Prezent ${g.label} – otwiera się w nowej karcie`);
    a.innerHTML = `
      <svg viewBox="0 0 160 170" aria-hidden="true">
        <g class="gift-body">
          <rect class="box" x="25" y="78" width="110" height="84" rx="4"/>
          <rect class="ribbon" x="72" y="78" width="16" height="84"/>
        </g>
        <g class="gift-lid">
          <rect class="lid-box" x="15" y="56" width="130" height="24" rx="4"/>
          <rect class="ribbon" x="72" y="56" width="16" height="24"/>
          <path class="bow" d="M80 56 C62 26 34 36 46 50 C52 57 66 58 80 56 Z"/>
          <path class="bow" d="M80 56 C98 26 126 36 114 50 C108 57 94 58 80 56 Z"/>
          <circle class="knot" cx="80" cy="55" r="5.5"/>
        </g>
      </svg>
      <span class="gift-label">${g.label}</span>`;
    a.addEventListener('click', () => {
      a.classList.add('open');
      setTimeout(() => a.classList.remove('open'), 2200);
    });
    wrap.append(a);
    return a;
  });
}

async function letterSequence() {
  const treeScene = $('#scene-tree');
  const letterScene = $('#scene-letter');

  treeScene.classList.add('fading');
  document.body.classList.add('letter-mode');
  await sleep(750);
  clearInterval(glintTimer);
  treeScene.classList.remove('is-active');
  treeScene.setAttribute('aria-hidden', 'true');

  letterScene.classList.add('is-active', 'fading');
  letterScene.removeAttribute('aria-hidden');
  window.scrollTo(0, 0);

  // poczekaj na czcionkę, żeby litery nie "skakały"
  try {
    await Promise.race([document.fonts.load('400 1em Caveat'), new Promise((r) => setTimeout(r, 2500))]);
  } catch (e) { /* bez czcionki też zadziała */ }

  const { seq, sigSeq } = buildLetter();
  requestAnimationFrame(() => letterScene.classList.remove('fading'));
  await sleep(800);

  placePen(seq[0].el);
  pen.classList.add('on');
  await write(seq);
  await sleep(300);
  await write(sigSeq);
  pen.classList.remove('on');
  await drawIn($('#swash'), 700, { easing: 'ease-out' });
  await sleep(600);

  // prezenty
  const gifts = buildGifts();
  $('#gifts').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  for (const g of gifts) {
    play(g, [
      { opacity: 0, transform: 'translateY(24px) scale(.85)' },
      { opacity: 1, transform: 'translateY(-6px) scale(1.04)', offset: 0.7 },
      { opacity: 1, transform: 'none' }
    ], { duration: 800, easing: 'ease-out' });
    await sleep(350);
  }
  await sleep(700);
  $('#hint').classList.add('show');
}

/* ---------------- START ---------------- */
$('#open-letter').addEventListener('click', (e) => {
  e.currentTarget.disabled = true;
  letterSequence();
}, { once: true });

treeSequence();
