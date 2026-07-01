const PRIMARY = 'https://selkid.com';
const STORY = 'https://story.selkid.com';

const STATIC_PREFIXES = ['/assets/', '/data/', '/scripts/', '/_astro/'];

function isStaticAsset(pathname) {
  return (
    STATIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.txt')
  );
}

function storyRewritePath(pathname) {
  if (pathname === '/' || pathname === '') return '/story/';
  if (pathname.startsWith('/story')) return pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `/story${pathname}`;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();
  const { pathname } = url;

  if (host === 'www.selkid.com') {
    return Response.redirect(`${PRIMARY}${pathname}${url.search}`, 301);
  }

  if (host === 'story.selkid.com') {
    if (isStaticAsset(pathname)) {
      return context.next();
    }

    if (pathname.startsWith('/p/') || pathname.startsWith('/s/') || pathname === '/archive') {
      return Response.redirect(`${STORY}/`, 301);
    }

    const rewriteUrl = new URL(context.request.url);
    rewriteUrl.pathname = storyRewritePath(pathname);
    return context.rewrite(rewriteUrl);
  }

  return context.next();
}
