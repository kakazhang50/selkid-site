const PRIMARY = 'https://selkid.com';
const KDP_HUB = `${PRIMARY}/story/`;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === 'www.selkid.com') {
    return Response.redirect(`${PRIMARY}${url.pathname}${url.search}`, 301);
  }

  if (host === 'story.selkid.com') {
    return Response.redirect(`${KDP_HUB}${url.search}`, 301);
  }

  return context.next();
}
