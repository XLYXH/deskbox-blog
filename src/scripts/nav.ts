import { $, $$ } from './util';

let host: HTMLElement | null;
let blob: HTMLElement | null;

function moveBlob(to: HTMLElement | null, squish = true) {
  if (!host || !blob) return;
  if (!to) return blob.style.setProperty('--bo', '0');
  const h = host.getBoundingClientRect();
  const r = to.getBoundingClientRect();
  const prev = parseFloat(blob.style.getPropertyValue('--bx') || '0');
  const x = r.left - h.left;
  blob.style.setProperty('--bw', `${r.width}px`);
  blob.style.setProperty('--bx', `${x}px`);
  blob.style.setProperty('--bo', '1');
  if (squish && Math.abs(prev - x) > 4) {
    // 移动时先拉伸再回弹，像一滴水
    blob.style.setProperty('--bs', '1.18');
    setTimeout(() => blob?.style.setProperty('--bs', '1'), 180);
  }
}

function activeKey() {
  const base = document.documentElement.dataset.base || '';
  const p = location.pathname.slice(base.length) || '/';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/blog')) return 'blog';
  if (p.startsWith('/tags')) return 'tags';
  if (p.startsWith('/archive')) return 'archive';
  if (p.startsWith('/about')) return 'about';
  return '';
}

let bound = false;
export function initNav() {
  host = $('[data-blob-host]');
  blob = $('.nav__blob');
  const links = $$<HTMLAnchorElement>('[data-nav-link]');
  const key = activeKey();
  let current: HTMLElement | null = null;
  links.forEach((a) => {
    const on = a.dataset.key === key;
    if (on) { a.setAttribute('aria-current', 'page'); current = a; }
    else a.removeAttribute('aria-current');
  });
  requestAnimationFrame(() => moveBlob(current));

  if (bound) return;
  bound = true;
  links.forEach((a) => {
    a.addEventListener('pointerenter', () => moveBlob(a));
    a.addEventListener('focus', () => moveBlob(a));
  });
  host?.addEventListener('pointerleave', () => moveBlob($('[data-nav-link][aria-current]')));
  addEventListener('resize', () => moveBlob($('[data-nav-link][aria-current]'), false));

  // 下滚隐藏、上滚出现；同时更新阅读进度
  const nav = $('[data-nav]')!;
  let lastY = scrollY;
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) > 6) {
        nav.classList.toggle('is-hidden', dy > 0 && y > 240 && !document.querySelector('dialog[open]'));
        lastY = y;
      }
      const max = document.documentElement.scrollHeight - innerHeight;
      const target = $('[data-article]');
      let p = max > 0 ? y / max : 0;
      if (target) {
        const r = target.getBoundingClientRect();
        p = Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / (r.height - innerHeight * 0.35)));
      }
      document.documentElement.style.setProperty('--read', p.toFixed(4));
      ticking = false;
    });
  }, { passive: true });
}
