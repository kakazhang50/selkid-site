#!/usr/bin/env node
/**
 * Add displayTitle + slug to catalog products (Cloudflare-safe; no external selkid-tools).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paths = [
  join(root, 'src/data/catalog.json'),
  join(root, 'public/data/catalog.json'),
];

const STRIP_PATTERNS = [
  /\s*\|\s*SEL\s*$/i,
  /\s*Social Story for K[–-]2\s*$/i,
  /\s*Read Aloud for K[–-]2\s*$/i,
  /\s*Read-Aloud for K[–-]2\s*$/i,
  /\s*No-Prep SEL Read-Aloud.*$/i,
  /\s*A No-Prep SEL Read-Aloud.*$/i,
  /\s*– No-Prep SEL Read-Aloud.*$/i,
  /\s*for K[–-]2\s*$/i,
  /\s*\|\s*.+$/i,
  /\s*SEL\s*$/i,
];

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[–—]/g, '-')
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 72) || 'resource'
  );
}

function makeDisplayTitle(title) {
  let t = (title || '').trim();
  for (const pat of STRIP_PATTERNS) {
    t = t.replace(pat, '').trim();
  }
  t = t.replace(/\s+/g, ' ');
  if (t.length > 58) {
    t = `${t.slice(0, 58).replace(/\s+\S*$/, '')}…`;
  }
  return t || `${(title || '').slice(0, 58)}${(title || '').length > 58 ? '…' : ''}`;
}

function makeSlug(title, tptId) {
  const base = slugify(makeDisplayTitle(title) || title);
  const tid = String(tptId || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  return tid ? `${base}-${tid}` : base;
}

function enrich(path) {
  const cat = JSON.parse(readFileSync(path, 'utf8'));
  const seen = new Set();
  let n = 0;
  for (const p of cat.products || []) {
    const title = p.title || '';
    const tid = String(p.tptId || '').trim();
    p.displayTitle = makeDisplayTitle(title);
    let slug = makeSlug(title, tid);
    if (seen.has(slug)) slug = `${slug}-${seen.size}`;
    seen.add(slug);
    p.slug = slug;
    n += 1;
  }
  writeFileSync(path, `${JSON.stringify(cat, null, 2)}\n`, 'utf8');
  return n;
}

const n = enrich(paths[0]);
enrich(paths[1]);
console.log(`Enriched ${n} products with displayTitle + slug`);
