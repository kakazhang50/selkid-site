const PRIMARY = 'https://selkid.com';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === 'www.selkid.com' || host === 'story.selkid.com') {
    return Response.redirect(`${PRIMARY}${url.pathname}${url.search}`, 301);
  }

  return context.next();
}
