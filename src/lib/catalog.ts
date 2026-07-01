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
