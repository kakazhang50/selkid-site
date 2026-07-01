import siteConfig from '@/data/siteConfig.json';

export interface SiteConfig {
  brandName: string;
  domain: string;
  tagline: string;
  brandBeliefLead: string;
  brandBeliefSub: string;
  brandBeliefBody: string;
  description: string;
  tptStore: string;
  mailerLiteAccountId: string;
  mailerLiteFormId: string;
  mailerLiteSubscribeUrl: string;
  subscribeEndpoint: string;
  subscribeTags: string;
  freeSampleUrl: string;
  cloudflareWebAnalyticsToken: string;
  kdpAmazonStoreUrl?: string;
  storyDomain?: string;
  brandLogo: string;
}

export const site = siteConfig as SiteConfig;

export function pageTitle(title?: string): string {
  if (!title) return `${site.brandName} | ${site.tagline}`;
  return `${title} | ${site.brandName}`;
}
