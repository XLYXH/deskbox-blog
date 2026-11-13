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

/** 1200×630 分享图：深色桌面 + 台灯光，标题用思源宋体（构建机需装有 Noto Serif CJK） */
export async function ogPng(o: { title: string; kicker: string; foot: string }) {
  const size = o.title.length > 22 ? 64 : 76;
  const lines = wrap(o.title, 960, size, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="0.82" cy="0" r="0.9"><stop offset="0" stop-color="#ffa84c" stop-opacity=".42"/><stop offset=".45" stop-color="#ffa84c" stop-opacity=".08"/><stop offset="1" stop-color="#ffa84c" stop-opacity="0"/></radialGradient>
    <pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#ede9e1" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="#0f0e0c"/>
  <rect width="1200" height="630" fill="url(#p)"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(96 92)">
    <path d="M13 4h6l6 13H7z" fill="#ffb054" opacity=".9" transform="scale(1.6)"/>
    <rect x="8" y="25.6" width="35.2" height="19.2" rx="5" fill="#ede9e1"/>
    <text x="64" y="38" font-family="Noto Serif CJK SC, serif" font-weight="700" font-size="30" fill="#ede9e1">DeskBox</text>
    <text x="1008" y="38" text-anchor="end" font-family="DejaVu Sans Mono, monospace" font-size="18" fill="#aaa499" letter-spacing="3">${esc(o.kicker)}</text>
  </g>
  ${lines.map((l, i) => `<text x="96" y="${300 - (lines.length - 1) * size * 0.62 + i * size * 1.25}" font-family="Noto Serif CJK SC, serif" font-weight="700" font-size="${size}" fill="#ede9e1">${esc(l)}</text>`).join('')}
  <rect x="96" y="500" width="64" height="3" rx="1.5" fill="#ffb054"/>
  <text x="96" y="548" font-family="Noto Sans CJK SC, sans-serif" font-size="24" fill="#aaa499">${esc(o.foot)}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
