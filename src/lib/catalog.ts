import catalogData from '@/data/catalog.json';
import matrixData from '@/data/education-matrix.json';
import aiSeriesData from '@/data/ai-series.json';

export type Product = (typeof catalogData.products)[number];
export type Catalog = typeof catalogData;
export type EducationMatrix = typeof matrixData;
export type AiSeries = typeof aiSeriesData;

export const catalog = catalogData as Catalog;
export const educationMatrix = matrixData as EducationMatrix;
export const aiSeries = aiSeriesData as AiSeries;

export function coverSrc(product: Product): string {
  if (product.coverUrl) return product.coverUrl;
  if (product.localImage) return `/${product.localImage.replace(/^\//, '')}`;
  return '/assets/covers/sel-waiting-cover.png';
}

/** Stable key so duplicate TPT artwork does not repeat on the homepage. */
export function coverKey(product: Product): string {
  const src = coverSrc(product);
  const idMatch = src.match(/original-(\d+)-/);
  if (idMatch) return `tpt-${idMatch[1]}`;
  const thumbMatch = product.coverUrl?.match(/thumbitem\/([^/]+)/);
  if (thumbMatch) return `thumb-${thumbMatch[1]}`;
  return src;
}

function productScore(product: Product): number {
  let score = 0;
  if (product.featured) score += 2;
  if (product.price) score += 1;
  if (product.pillar === 'thinking') score += 4;
  if (product.pillar === 'ai') score += 4;
  if (product.coverUrl) score += 1;
  return score;
}

/** Homepage showcase: unique covers + spread across SEL domains and pillars. */
export function pickHomepageFeatured(products: Product[], limit = 8): Product[] {
  const pool = [...products]
    .filter((p) => p.coverUrl || p.localImage)
    .sort((a, b) => productScore(b) - productScore(a));

  const picked: Product[] = [];
  const seenCovers = new Set<string>();
  const seenCategories = new Set<string>();

  function tryAdd(product: Product, requireNewCategory = false): boolean {
    if (picked.length >= limit || picked.includes(product)) return false;
    const key = coverKey(product);
    if (seenCovers.has(key)) return false;
    const cat = product.categoryId || 'general';
    if (requireNewCategory && seenCategories.has(cat)) return false;
    seenCovers.add(key);
    seenCategories.add(cat);
    picked.push(product);
    return true;
  }

  for (const pillar of ['thinking', 'ai', 'sel'] as const) {
    const match = pool.find((p) => p.pillar === pillar);
    if (match) tryAdd(match, false);
  }

  for (const p of pool) {
    if (picked.length >= limit) break;
    tryAdd(p, true);
  }

  for (const p of pool) {
    if (picked.length >= limit) break;
    tryAdd(p, false);
  }

  return picked.slice(0, limit);
}

export function productInternalUrl(product: Product): string {
  if (product.pillar === 'thinking') return '/thinking-skills';
  if (product.pillar === 'ai') return '/ai-cognition';
  return '/sel-stories';
}

export function filterProducts(
  products: Product[],
  options: {
    pillar?: string | null;
    featured?: boolean;
    category?: string;
    grade?: string;
    search?: string;
  }
): Product[] {
  let list = products.slice();
  if (options.pillar) list = list.filter((p) => p.pillar === options.pillar);
  if (options.featured) list = list.filter((p) => p.featured);
  if (options.category && options.category !== 'all') {
    list = list.filter((p) => p.categoryId === options.category);
  }
  if (options.grade && options.grade !== 'all') {
    list = list.filter((p) => (p.grades || '').includes(options.grade!));
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    list = list.filter((p) => (p.title || '').toLowerCase().includes(q));
  }
  return list;
}

export function pillarLink(link: string): string {
  return link.replace(/\.html$/, '').replace(/^([^/])/, '/$1');
}
