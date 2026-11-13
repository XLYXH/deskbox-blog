import { $, reduced } from './util';

type Origin = { x: number; y: number };

export function setTheme(next: 'light' | 'dark', from?: Origin) {
  const d = document.documentElement;
  if (d.dataset.theme === next) return;
  const apply = () => {
    d.dataset.theme = next;
    try { localStorage.setItem('db-theme', next); } catch {}
    syncThemeUI();
  };
  const vt = (document as any).startViewTransition;
  if (!vt || reduced() || !from) return apply();
  const r = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y));
  d.style.setProperty('--tx', `${from.x}px`);
  d.style.setProperty('--ty', `${from.y}px`);
  d.style.setProperty('--tr', `${r}px`);
  d.classList.add('theme-swap');
  const t = vt.call(document, apply);
  t.finished.finally(() => d.classList.remove('theme-swap'));
}

export const toggleTheme = (from?: Origin) =>
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', from);

export function syncThemeUI() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const btn = $('[data-theme-toggle]');
  btn?.setAttribute('aria-pressed', String(dark));
  btn?.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  const meta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  meta.forEach((m) => (m.content = dark ? '#0f0e0c' : '#f1eee8'));
}

/** 台灯拉绳：拖下去松手 = 开/关灯；单击也可以 */
let cordReady = false;
export function initThemeControls() {
  syncThemeUI();
  if (cordReady) return; // 导航栏是 transition:persist，只绑一次
  cordReady = true;
  const btn = $('[data-theme-toggle]')!;
  btn.addEventListener('click', () => {
    const b = btn.getBoundingClientRect();
    toggleTheme({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
  });
  const bead = $('[data-cord]');
  const cord = bead?.parentElement;
  if (!bead || !cord) return;
  let startY = 0, pull = 0, dragging = false;
  bead.addEventListener('pointerdown', (e) => {
    dragging = true;
    startY = e.clientY;
    pull = 0;
    bead.setPointerCapture(e.pointerId);
    cord.classList.add('is-dragging');
    cord.classList.remove('swing');
  });
  bead.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    pull = Math.max(0, Math.min(56, (e.clientY - startY) * 0.8));
    cord.style.setProperty('--pull', `${pull}px`);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    cord.classList.remove('is-dragging');
    const b = bead.getBoundingClientRect();
    cord.style.setProperty('--pull', '0px');
    void cord.offsetWidth;
    cord.classList.add('swing');
    toggleTheme({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
  };
  bead.addEventListener('pointerup', release);
  bead.addEventListener('pointercancel', () => {
    dragging = false;
    cord.classList.remove('is-dragging');
    cord.style.setProperty('--pull', '0px');
  });
}
