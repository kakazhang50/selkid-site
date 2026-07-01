const PRIMARY = 'https://selkid.com';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  // www → apex; story serves the same site on its own hostname (no redirect rule needed)
  if (host === 'www.selkid.com') {
    return Response.redirect(`${PRIMARY}${url.pathname}${url.search}`, 301);
  }

  return context.next();
}
