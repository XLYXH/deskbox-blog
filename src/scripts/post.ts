import { $, $$, reduced, pageSignal } from './util';

/* ---------- 目录：滚动高亮 + 滑动指示条 ---------- */
function initToc() {
  const tocs = $$('[data-toc]');
  if (!tocs.length) return;
  const heads = $$('[data-article] :is(h2, h3)[id]');
  if (!heads.length) return;
  const set = (id: string) => {
    tocs.forEach((toc) => {
      const links = $$<HTMLAnchorElement>('a[data-id]', toc);
      let active: HTMLElement | null = null;
      links.forEach((a) => {
        const on = a.dataset.id === id;
        a.classList.toggle('on', on);
        if (on) { a.setAttribute('aria-current', 'location'); active = a; } else a.removeAttribute('aria-current');
      });
      const ind = $('[data-toc-ind]', toc);
      if (ind && active) {
        const a = active as HTMLElement;
        ind.style.transform = `translateY(${a.offsetTop}px)`;
        ind.style.height = `${a.offsetHeight}px`;
        ind.style.opacity = '1';
      }
    });
  };
  const onScroll = () => {
    const line = innerHeight * 0.3;
    let cur = heads[0].id;
    for (const h of heads) { if (h.getBoundingClientRect().top < line) cur = h.id; else break; }
    set(cur);
  };
  addEventListener('scroll', onScroll, { passive: true, signal: pageSignal() });
  onScroll();
}

/* ---------- 代码复制 ---------- */
function initCopy() {
  $$<HTMLButtonElement>('[data-copy]').forEach((b) => {
    b.addEventListener('click', async () => {
      const code = b.closest('figure')?.querySelector('pre')?.innerText ?? '';
      try {
        await navigator.clipboard.writeText(code.replace(/\n$/, ''));
        b.classList.add('ok');
        b.querySelector('span')!.textContent = '已复制';
        setTimeout(() => { b.classList.remove('ok'); b.querySelector('span')!.textContent = '复制'; }, 1600);
      } catch {
        b.querySelector('span')!.textContent = '复制失败';
      }
    });
  });
}

/* ---------- 图片放大（FLIP） ---------- */
function initZoom() {
  $$<HTMLImageElement>('[data-article] img').forEach((img) => {
    if (img.closest('a')) return;
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `放大图片：${img.alt}`);
    const open = () => {
      const r = img.getBoundingClientRect();
      const ov = document.createElement('div');
      ov.className = 'zoom';
      const big = img.cloneNode() as HTMLImageElement;
      big.removeAttribute('loading');
      big.className = 'zoom__img';
      big.removeAttribute('role');
      big.removeAttribute('tabindex');
      ov.appendChild(big);
      document.body.appendChild(ov);
      const nw = img.naturalWidth || r.width, nh = img.naturalHeight || r.height;
      const s = Math.min((innerWidth * 0.92) / nw, (innerHeight * 0.86) / nh, 2.2);
      const w = nw * s, h = nh * s;
      Object.assign(big.style, { width: `${w}px`, height: `${h}px`, left: `${(innerWidth - w) / 2}px`, top: `${(innerHeight - h) / 2}px` });
      const sx = r.width / w, tx = r.left - (innerWidth - w) / 2, ty = r.top - (innerHeight - h) / 2;
      big.animate([{ transform: `translate(${tx}px, ${ty}px) scale(${sx})` }, { transform: 'none' }], { duration: reduced() ? 1 : 520, easing: 'cubic-bezier(.22,1,.36,1)' });
      requestAnimationFrame(() => ov.classList.add('on'));
      img.style.visibility = 'hidden';
      const close = () => {
        const r2 = img.getBoundingClientRect();
        const sx2 = r2.width / w, tx2 = r2.left - (innerWidth - w) / 2, ty2 = r2.top - (innerHeight - h) / 2;
        ov.classList.remove('on');
        big.animate([{ transform: 'none' }, { transform: `translate(${tx2}px, ${ty2}px) scale(${sx2})` }], { duration: reduced() ? 1 : 420, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })
          .finished.then(() => { img.style.visibility = ''; ov.remove(); img.focus({ preventScroll: true }); });
        removeEventListener('keydown', key);
        removeEventListener('scroll', close);
      };
      const key = (e: KeyboardEvent) => e.key === 'Escape' && close();
      ov.addEventListener('click', close);
      addEventListener('keydown', key);
      addEventListener('scroll', close, { once: true, passive: true });
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open()));
  });
}

/* ---------- 脚注悬浮预览 ---------- */
function initFootnotes() {
  $$<HTMLAnchorElement>('[data-article] a[data-footnote-ref]').forEach((a) => {
    const id = a.getAttribute('href')!.slice(1);
    const li = document.getElementById(id);
    if (!li) return;
    const tip = document.createElement('span');
    tip.className = 'fn-tip';
    tip.setAttribute('role', 'tooltip');
    const clone = li.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.data-footnote-backref, [data-footnote-backref]').forEach((x) => x.remove());
    tip.innerHTML = clone.innerHTML;
    a.parentElement!.classList.add('fn-host');
    a.parentElement!.appendChild(tip);
  });
}

/* ---------- 阅读设置：字号 / 字体 ---------- */
function initReader() {
  const box = $('[data-reader]');
  if (!box) return;
  const d = document.documentElement;
  const save = () => { try { localStorage.setItem('db-read', JSON.stringify({ size: d.dataset.readSize || '', font: d.dataset.readFont || '' })); } catch {} };
  const sync = () => {
    $$<HTMLButtonElement>('[data-size]', box).forEach((b) => b.setAttribute('aria-pressed', String((d.dataset.readSize || 'm') === b.dataset.size)));
    $$<HTMLButtonElement>('[data-font]', box).forEach((b) => b.setAttribute('aria-pressed', String((d.dataset.readFont || 'sans') === b.dataset.font)));
  };
  $$<HTMLButtonElement>('[data-size]', box).forEach((b) => b.addEventListener('click', () => { d.dataset.readSize = b.dataset.size!; save(); sync(); }));
  $$<HTMLButtonElement>('[data-font]', box).forEach((b) => b.addEventListener('click', () => { d.dataset.readFont = b.dataset.font!; save(); sync(); }));
  sync();
}

/* ---------- 浮动工具：进度环 / 目录抽屉 / 回顶部 / 阅读设置 ---------- */
function initDock() {
  const dock = $('[data-dock]');
  if (!dock) return;
  const ring = $('[data-ring]', dock);
  const pct = $('[data-pct]', dock);
  const onScroll = () => {
    const p = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--read')) || 0;
    if (ring) ring.style.strokeDashoffset = String(100 - p * 100);
    if (pct) pct.textContent = `${Math.round(p * 100)}`;
    dock.classList.toggle('show', scrollY > 400);
  };
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true, signal: pageSignal() });
  onScroll();
  $('[data-top]', dock)?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }));
  const sheet = $('[data-sheet]');
  const toggles = $$('[data-sheet-toggle]');
  const setSheet = (open: boolean, which?: string) => {
    if (!sheet) return;
    sheet.classList.toggle('open', open);
    if (which) sheet.dataset.view = which;
    toggles.forEach((t) => t.setAttribute('aria-expanded', String(open && t.dataset.sheetToggle === sheet.dataset.view)));
  };
  toggles.forEach((t) => t.addEventListener('click', () => {
    const which = t.dataset.sheetToggle!;
    setSheet(!(sheet?.classList.contains('open') && sheet.dataset.view === which), which);
  }));
  sheet?.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setSheet(false); });
  addEventListener('keydown', (e) => e.key === 'Escape' && setSheet(false), { signal: pageSignal() });
  document.addEventListener('click', (e) => {
    if (sheet?.classList.contains('open') && !(e.target as Element).closest('[data-sheet], [data-sheet-toggle]')) setSheet(false);
  }, { signal: pageSignal() });
}

/* ---------- 评论：点击后才加载 Giscus ---------- */
function initComments() {
  const btn = $<HTMLButtonElement>('[data-comments-load]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const box = $('[data-comments]')!;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    const c = JSON.parse(box.dataset.config || '{}');
    const attrs: Record<string, string> = {
      'data-repo': c.repo, 'data-repo-id': c.repoId, 'data-category': c.category, 'data-category-id': c.categoryId,
      'data-mapping': c.mapping, 'data-reactions-enabled': '1', 'data-input-position': 'top', 'data-lang': c.lang,
      'data-theme': document.documentElement.dataset.theme === 'dark' ? 'dark_dimmed' : 'light', 'data-loading': 'lazy',
    };
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    box.appendChild(s);
    btn.remove();
  });
}

export function initPost() {
  if (!$('[data-article]')) { document.body.removeAttribute('data-reading'); return; }
  document.body.setAttribute('data-reading', '');
  initToc();
  initCopy();
  initZoom();
  initFootnotes();
  initReader();
  initDock();
  initComments();
}
