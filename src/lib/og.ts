import sharp from 'sharp';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
const isCJK = (c: string) => /[\u3000-\u9fff\uff00-\uffef]/.test(c);
function wrap(text: string, max: number, size: number, lines: number) {
  const out: string[] = [];
  let cur = '', w = 0;
  for (const ch of [...text]) {
    const cw = isCJK(ch) ? size : size * 0.56;
    if (w + cw > max && cur) { out.push(cur); cur = ''; w = 0; }
    cur += ch; w += cw;
  }
  if (cur) out.push(cur);
  if (out.length > lines) { out.length = lines; out[lines - 1] = out[lines - 1].slice(0, -1) + '…'; }
  return out;
}

/** 1200×630 分享图：纸面 + 墨框 + 红笔下划线，标题用思源宋体（构建机需装有 Noto Serif CJK） */
export async function ogPng(o: { title: string; kicker: string; foot: string }) {
  const size = o.title.length > 22 ? 64 : 76;
  const lines = wrap(o.title, 960, size, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4f1e9"/>
  <rect x="60" y="60" width="1080" height="510" fill="#fbf9f4" stroke="#161513" stroke-width="3"/>
  <rect x="60" y="60" width="1080" height="72" fill="#161513"/>
  <text x="96" y="108" font-family="Noto Serif CJK SC, serif" font-weight="700" font-size="32" fill="#f4f1e9">DeskBox<tspan fill="#ff6b4f">.</tspan></text>
  <text x="1104" y="106" text-anchor="end" font-family="DejaVu Sans Mono, monospace" font-size="20" fill="#d9d3c5">${esc(o.kicker)}</text>
  ${lines.map((l, i) => `<text x="96" y="${330 - (lines.length - 1) * size * 0.62 + i * size * 1.25}" font-family="Noto Serif CJK SC, serif" font-weight="700" font-size="${size}" fill="#161513">${esc(l)}</text>`).join('')}
  <path d="M96 488c60-8 120-10 190-5s110 6 150-2" fill="none" stroke="#c8321a" stroke-width="5" stroke-linecap="round"/>
  <text x="96" y="536" font-family="Noto Sans CJK SC, sans-serif" font-size="24" fill="#4f4b44">${esc(o.foot)}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
