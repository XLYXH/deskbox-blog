import { $, $$, reduced, finePointer, pageSignal } from './util';

/* ---------- 全局指针：台灯光 + 卡片聚光 + 页脚字标 ---------- */
let pointerBound = false;
export function initPointer() {
  if (pointerBound || !finePointer()) return;
  pointerBound = true;
  let x = innerWidth * 0.7, y = -100, tx = x, ty = y, raf = 0;
  const root = document.documentElement;
  const loop = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    root.style.setProperty('--lx', `${x.toFixed(1)}px`);
    root.style.setProperty('--ly', `${y.toFixed(1)}px`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!raf && !reduced()) raf = requestAnimationFrame(loop);
    // 聚光卡片：只计算附近的
    for (const el of document.querySelectorAll<HTMLElement>('.spot')) {
      const r = el.getBoundingClientRect();
      const near = e.clientX > r.left - 160 && e.clientX < r.right + 160 && e.clientY > r.top - 160 && e.clientY < r.bottom + 160;
      if (near) {
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
        el.style.setProperty('--spot-o', '1');
      } else if (el.style.getPropertyValue('--spot-o') === '1') el.style.setProperty('--spot-o', '0');
    }
    // 页脚字标：靠近的字母被"点亮"
    const word = document.querySelector<HTMLElement>('[data-wordmark]');
    if (word) {
      const wr = word.getBoundingClientRect();
      if (e.clientY > wr.top - 120 && e.clientY < wr.bottom + 80) {
        for (const s of word.children as HTMLCollectionOf<HTMLElement>) {
          const r = s.getBoundingClientRect();
          s.classList.toggle('lit', Math.abs(e.clientX - (r.left + r.width / 2)) < r.width * 0.9);
        }
      } else for (const s of word.children) s.classList.remove('lit');
    }
  }, { passive: true });
}

/* ---------- 磁吸 ---------- */
export function initMagnetic() {
  if (!finePointer() || reduced()) return;
  const signal = pageSignal();
  for (const el of $$('[data-magnetic]')) {
    if ((el as any)._mag) continue;
    (el as any)._mag = true;
    const s = parseFloat(el.dataset.magnetic || '') || 0.28;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 600);
    });
  }
  void signal;
}

/* ---------- 3D 倾斜 ---------- */
export function initTilt() {
  if (!finePointer() || reduced()) return;
  for (const el of $$('[data-tilt]')) {
    const max = parseFloat(el.dataset.tilt || '') || 6;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
      el.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 800);
    });
  }
}

/* ---------- 滚动入场 ---------- */
export function initReveal() {
  const els = $$('.rise:not(.in)');
  if (!('IntersectionObserver' in window) || reduced()) return els.forEach((e) => e.classList.add('in'));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  els.forEach((e) => io.observe(e));
  pageSignal().addEventListener('abort', () => io.disconnect());
}

/* ---------- 文字解码 ---------- */
const GLYPHS = '░▒▓<>/\\{}[]=+*#%&01アイウエオカキクケコ写码生活桌盒';
export function decode(el: HTMLElement, delay = 0) {
  const final = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = final;
  if (reduced()) { el.textContent = final; return; }
  el.setAttribute('aria-label', final);
  const chars = [...final];
  const start = performance.now() + delay;
  const dur = Math.min(1100, 260 + chars.length * 55);
  const tick = (now: number) => {
    const t = (now - start) / dur;
    if (t < 0) return requestAnimationFrame(tick);
    let out = '';
    chars.forEach((c, i) => {
      const reveal = i / chars.length;
      if (c === ' ' || c === '\n' || t > reveal + 0.25) out += c;
      else if (t > reveal - 0.15) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += '\u2002';
    });
    el.textContent = out;
    if (t < 1.25) requestAnimationFrame(tick);
    else el.textContent = final;
  };
  requestAnimationFrame(tick);
}
export function initDecode() {
  $$('[data-decode]').forEach((el, i) => decode(el, parseFloat(el.dataset.decode || '') || i * 90));
  if (!finePointer()) return;
  $$('[data-decode-hover]').forEach((el) => el.addEventListener('pointerenter', () => decode(el)));
}

/* ---------- 数字滚动 ---------- */
export function initCount() {
  const els = $$('[data-count]');
  const run = (el: HTMLElement) => {
    const to = parseFloat(el.dataset.count || '0');
    if (reduced()) return void (el.textContent = to.toLocaleString('zh-CN'));
    const t0 = performance.now(), dur = 1400;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(to * e).toLocaleString('zh-CN');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { run(x.target as HTMLElement); io.unobserve(x.target); } }));
  els.forEach((e) => io.observe(e));
}

/* ---------- 实时时钟 + 问候 ---------- */
export function initClock() {
  const box = $('[data-clock]');
  if (!box) return;
  const hm = $('[data-clock-hm]', box)!, sec = $('[data-clock-s]', box)!, greet = $('[data-greet]');
  const day = $('[data-clock-day]', box);
  const f = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const fd = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const g = (h: number) => (h < 5 ? '夜深了' : h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : h < 23 ? '晚上好' : '夜深了');
  const tick = () => {
    const [h, m, s] = f.format(new Date()).split(':');
    hm.textContent = `${h}:${m}`;
    sec.textContent = s;
    if (day) day.textContent = fd.format(new Date());
    if (greet && !greet.dataset.done) { greet.textContent = g(+h); greet.dataset.done = '1'; decode(greet, 200); }
  };
  tick();
  const id = setInterval(tick, 1000);
  pageSignal().addEventListener('abort', () => clearInterval(id));
}
