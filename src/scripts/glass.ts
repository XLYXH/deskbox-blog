/**
 * 液态玻璃：为每个 .glass 生成一张位移贴图（边缘向内折射，中心不变），
 * 通过 SVG feDisplacementMap 作为 backdrop-filter。仅 Chromium 支持，其余浏览器保留磨砂玻璃。
 */
import { $, $$ } from './util';

const supported = () => {
  const ua = navigator.userAgent;
  return /Chrome\//.test(ua) && CSS.supports('backdrop-filter', 'blur(1px)');
};

function displacementMap(w: number, h: number, radius: number, bezel: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // 到圆角矩形边缘的有符号距离
      const qx = Math.abs(x + 0.5 - w / 2) - (w / 2 - radius);
      const qy = Math.abs(y + 0.5 - h / 2) - (h / 2 - radius);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
      const dist = Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius; // <0 在内部
      const t = Math.max(0, Math.min(1, 1 + dist / bezel)); // 边缘 1，内部 0
      const k = t * t * (3 - 2 * t);
      // 法线方向
      let nx = 0, ny = 0;
      if (qx > 0 || qy > 0) {
        const l = Math.hypot(ox, oy) || 1;
        nx = (ox / l) * Math.sign(x + 0.5 - w / 2);
        ny = (oy / l) * Math.sign(y + 0.5 - h / 2);
      } else if (qx > qy) nx = Math.sign(x + 0.5 - w / 2);
      else ny = Math.sign(y + 0.5 - h / 2);
      const i = (y * w + x) * 4;
      d[i] = 128 - nx * k * 127;
      d[i + 1] = 128 - ny * k * 127;
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

let n = 0;
const done = new WeakMap<Element, string>();
export function initGlass() {
  if (!supported()) return;
  document.documentElement.classList.add('lg-svg');
  const defs = $('[data-glass-defs]');
  if (!defs) return;
  for (const el of $$('.glass')) {
    const r = el.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) continue;
    const key = `${w}x${h}`;
    if (done.get(el) === key) continue;
    done.set(el, key);
    const id = `lg-${n++}`;
    const map = displacementMap(w, h, Math.min(h / 2, w / 2), Math.min(16, h / 2.6));
    defs.insertAdjacentHTML(
      'beforeend',
      `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feImage href="${map}" x="0" y="0" width="${w}" height="${h}" result="m"/>
        <feDisplacementMap in="SourceGraphic" in2="m" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation=".4"/>
      </filter>`,
    );
    (el as HTMLElement).style.setProperty('--lg-filter', `url(#${id})`);
  }
}
