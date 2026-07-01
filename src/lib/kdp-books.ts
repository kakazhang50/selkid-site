import kdpData from '@/data/kdp-books.json';

export interface KdpBook {
  id: string;
  title: string;
  subtitle?: string;
  ages?: string;
  volume?: number;
  formats?: string[];
  amazonUrl?: string;
  amazonSearch?: string;
  cover?: string;
}

export interface KdpSeries {
  id: string;
  title: string;
  tagline: string;
  brandLink?: string;
  books: KdpBook[];
}

export interface KdpCatalog {
  author: {
    name: string;
    penNameNote: string;
    amazonStoreUrl: string;
    bio: string;
  };
  series: KdpSeries[];
}

export const kdp = kdpData as KdpCatalog;

export function amazonLink(book: KdpBook, storeUrl: string): string {
  if (book.amazonUrl) return book.amazonUrl;
  if (book.amazonSearch) {
    return `https://www.amazon.com/s?k=${book.amazonSearch}`;
  }
  return storeUrl;
}

export function bookCover(book: KdpBook): string {
  return book.cover || '/assets/hero-maple-forest.png';
}
