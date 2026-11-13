import { getImage } from 'astro:assets';
import type { Post } from './posts';
import { fmtDate, readingMinutes, wordCount } from './posts';
import { tagSlug } from '../config';

const HUE: Record<string, number> = { 前端: 28, 后端: 205, 工程实践: 152, 阅读: 285, 生活: 345 };
export const hueOf = (tags: string[]) => HUE[tags[0]] ?? 48;

export async function cardData(p: Post) {
  const cover = p.data.cover ? (await getImage({ src: p.data.cover, width: 640, format: 'webp' })).src : '';
  const minutes = readingMinutes(p.body ?? '');
  return {
    slug: p.data.slug,
    title: p.data.title,
    description: p.data.description,
    date: fmtDate(p.data.pubDate),
    iso: p.data.pubDate.toISOString(),
    tags: p.data.tags as string[],
    tagSlugs: (p.data.tags as string[]).map(tagSlug),
    minutes,
    words: wordCount(p.body ?? ''),
    hue: hueOf(p.data.tags),
    glyph: [...p.data.title.replace(/[^\p{L}\p{N}]/gu, '')][0] ?? '·',
    cover,
    coverAlt: p.data.coverAlt ?? '',
    series: p.data.series,
  };
}
export type CardData = Awaited<ReturnType<typeof cardData>>;
