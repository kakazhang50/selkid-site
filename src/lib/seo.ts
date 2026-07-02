import { site } from '@/lib/site';
import { catalog } from '@/lib/catalog';
import siteFaq from '@/data/siteFaq.json';

export const siteUrl = `https://${site.domain}`;

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const siteFaqs = siteFaq as FaqItem[];

export function absoluteUrl(path: string, base = siteUrl): string {
  if (path.startsWith('http')) return path;
  return new URL(path.startsWith('/') ? path : `/${path}`, base).href;
}

export function organizationSchema() {
  const total = catalog.totalProducts || catalog.products.length;
  const sameAs = [site.tptStore, site.kdpAmazonStoreUrl].filter(Boolean) as string[];

  return {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: site.brandName,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(site.brandLogo || '/assets/brand/selkid-logo.png'),
    },
    slogan: site.tagline,
    description: site.description,
    sameAs,
    knowsAbout: [
      'Social-emotional learning',
      'CASEL framework',
      'Elementary classroom read-alouds',
      'Thinking skills for children',
      'AI literacy for Grades 3–6',
      'Rex and Dino characters',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: ['teacher', 'parent'],
      audienceType: 'K–6 educators and parents',
    },
    brand: {
      '@type': 'Brand',
      name: site.brandName,
      slogan: site.tagline,
      description: `${total}+ CASEL-aligned classroom stories and Rex & Dino learning resources for K–6.`,
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: site.brandName,
    url: siteUrl,
    description: site.description,
    publisher: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en-US',
  };
}

export function webPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  type?: 'WebPage' | 'AboutPage' | 'CollectionPage';
}) {
  return {
    '@type': opts.type || 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en-US',
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqSchema(faqs: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
}) {
  return {
    '@type': 'Article',
    '@id': `${opts.url}#article`,
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: { '@id': `${siteUrl}/#organization` },
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: { '@id': `${opts.url}#webpage` },
    articleSection: opts.category,
    inLanguage: 'en-US',
  };
}

export function buildJsonLdGraph(extras: Record<string, unknown>[] = []) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema(), ...extras],
  };
}

export function pageJsonLdExtra(opts: {
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FaqItem[];
  article?: {
    title: string;
    description: string;
    datePublished: string;
    dateModified?: string;
    category?: string;
    url: string;
  };
}) {
  const extras: Record<string, unknown>[] = [];

  if (opts.breadcrumbs?.length) {
    extras.push(breadcrumbSchema(opts.breadcrumbs));
  }

  if (opts.faqs?.length) {
    extras.push(faqSchema(opts.faqs));
  }

  if (opts.article) {
    extras.push(
      articleSchema({
        title: opts.article.title,
        description: opts.article.description,
        url: opts.article.url,
        datePublished: opts.article.datePublished,
        dateModified: opts.article.dateModified,
        category: opts.article.category,
      })
    );
  }

  return extras;
}

export function pageSeoExtras(opts: {
  pageName: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
  pageType?: 'WebPage' | 'AboutPage' | 'CollectionPage';
  faqs?: FaqItem[];
  article?: {
    title: string;
    description: string;
    datePublished: string;
    dateModified?: string;
    category?: string;
  };
}) {
  const extras: Record<string, unknown>[] = [
    webPageSchema({
      name: opts.pageName,
      description: opts.description,
      url: opts.url,
      type: opts.pageType,
    }),
  ];

  if (opts.breadcrumbs?.length) {
    extras.push(breadcrumbSchema(opts.breadcrumbs));
  }

  if (opts.faqs?.length) {
    extras.push(faqSchema(opts.faqs));
  }

  if (opts.article) {
    extras.push(
      articleSchema({
        title: opts.article.title,
        description: opts.article.description,
        url: opts.url,
        datePublished: opts.article.datePublished,
        dateModified: opts.article.dateModified,
        category: opts.article.category,
      })
    );
  }

  return buildJsonLdGraph(extras);
}

export function buildLlmsTxt(full = false): string {
  const total = catalog.totalProducts || catalog.products.length;
  const { sel, thinking, ai } = catalog.pillars;
  const lines: string[] = [
    `# ${site.brandName}`,
    '',
    `> ${site.tagline} Story-based SEL, thinking skills, and AI cognition for K–6 educators.`,
    '',
    '## Summary',
    `${site.brandName} (${site.domain}) publishes CASEL-aligned social-emotional learning read-alouds, Rex & Dino thinking skills stories, and an AI cognition comic series for elementary classrooms. The brand belief: ${site.brandBeliefLead} ${site.brandBeliefSub}`,
    '',
    '## Key facts',
    `- Resources: ${total}+ on Teachers Pay Teachers (${sel} SEL stories, ${thinking} thinking skills, ${ai} AI units)`,
    '- Grades: SEL & thinking K–2; AI Cognition Grades 3–6',
    '- Characters: Rex, Dino, Atlas, Mayor Owl, Mimi Rabbit in Maple Forest',
    '- Teaching model: Story → Discussion → Activity → Reflection',
    '- Framework: CASEL-aligned SEL organized by scenario, trigger, emotion, and skill',
    `- Free sample: Unit 1 Training Data — full 16-panel comic + partial lesson guides (${siteUrl}/free-resources)`,
    '',
    '## Primary pages',
    `- Homepage: ${siteUrl}/`,
    `- Learning System: ${siteUrl}/learning-system`,
    `- SEL Stories: ${siteUrl}/sel-stories`,
    `- Thinking Skills: ${siteUrl}/thinking-skills`,
    `- AI Cognition: ${siteUrl}/ai-cognition`,
    `- Free Resources: ${siteUrl}/free-resources`,
    `- Rex & Dino: ${siteUrl}/rex-dino`,
    `- Educator Notes: ${siteUrl}/educator-notes`,
    `- About: ${siteUrl}/about`,
    '',
    '## External stores',
    `- Teachers Pay Teachers: ${site.tptStore}`,
  ];

  if (site.kdpAmazonStoreUrl) {
    lines.push(`- Amazon (young reader books): ${site.kdpAmazonStoreUrl}`);
    lines.push(`- Story hub: https://${site.storyDomain || 'story.selkid.com'}/`);
  }

  lines.push('', '## FAQ');

  for (const faq of siteFaqs) {
    lines.push(`### ${faq.question}`, faq.answer, '');
  }

  if (full) {
    lines.push(
      '## AI Cognition — Season 1 units',
      '1. Training Data — AI learns from examples, not magic',
      '2. Data Quality — garbage in, garbage out',
      '3. AI Bias — missing voices in training data',
      '4. Hallucination — when AI sounds confident but wrong',
      '5. Model Collapse — when AI copies AI too much',
      '6. Human Judgment — why people still matter',
      '',
      '## Contact & updates',
      `Subscribe for free samples and new launches: ${siteUrl}/free-resources#subscribe`,
      '',
      '## Canonical domain',
      siteUrl
    );
  } else {
    lines.push('', '## Optional', `Full reference: ${siteUrl}/llms-full.txt`);
  }

  return `${lines.join('\n').trim()}\n`;
}
