import siteConfig from '@/data/siteConfig.json';
import freeSampleData from '@/data/freeSample.json';

export interface FreeSampleContent {
  unitTitle: string;
  shortLead: string;
  heroLead: string;
  perks: string[];
  listPerks: string[];
  fullEditionNote: string;
  sampleIncludes: { icon: string; title: string; body: string }[];
  visitorStepBody: string;
  ctaDescription: string;
}

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
export const freeSample = freeSampleData as FreeSampleContent;

export function pageTitle(title?: string): string {
  if (!title) return `${site.brandName} | ${site.tagline}`;
  return `${title} | ${site.brandName}`;
}
