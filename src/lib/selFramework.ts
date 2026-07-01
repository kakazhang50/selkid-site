import frameworkData from '@/data/sel-framework.json';

export type SelFramework = typeof frameworkData;
export const selFramework = frameworkData as SelFramework;

export type FacetId = 'scenario' | 'trigger' | 'emotion' | 'skill' | 'casel';

export interface SelTags {
  scenarios: string[];
  triggers: string[];
  emotions: string[];
  skills: string[];
  casel: string[];
  thinkingSkills?: string[];
}

export function facetList(facet: FacetId) {
  if (facet === 'casel') return selFramework.casel;
  if (facet === 'scenario') return selFramework.scenarios;
  if (facet === 'trigger') return selFramework.triggers;
  if (facet === 'emotion') return selFramework.emotions;
  return selFramework.skills;
}

export function facetLabel(facet: FacetId): string {
  const dim = selFramework.dimensions.find((d) => d.id === facet);
  return dim?.label || facet;
}

export function facetName(facet: FacetId, id: string): string {
  const item = facetList(facet).find((x) => x.id === id);
  return item?.name || id;
}

const facetTagKey: Record<FacetId, keyof SelTags> = {
  scenario: 'scenarios',
  trigger: 'triggers',
  emotion: 'emotions',
  skill: 'skills',
  casel: 'casel',
};

export function productMatchesFacet(product: { selTags?: SelTags }, facet: FacetId, id: string): boolean {
  if (!id) return true;
  const tags = product.selTags?.[facetTagKey[facet]] || [];
  return tags.includes(id);
}
