import { buildLlmsTxt } from '@/lib/seo';

export const prerender = true;

export function GET() {
  return new Response(buildLlmsTxt(false), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
