# SELKID Website (Astro)

Brand site for **SELKID** — story-based SEL, thinking skills, AI cognition, and **Educator Notes**.

- **Tagline:** Big ideas, kid-sized stories.
- **Live:** https://selkid.com · preview: https://selkid-site.pages.dev
- **Repo:** https://github.com/kakazhang50/selkid-site

## Commands

```powershell
cd "E:\AI NOVEL\TPTWEB\selkid-site"
npm install          # first time
npm run dev          # http://localhost:4321
npm run build        # output → dist/
npm run publish      # build + git commit + push
```

## Layout

```
selkid-site/
├── src/
│   ├── pages/              # Routes
│   ├── components/         # Header, Footer, ProductGrid, SubscribeCTA…
│   ├── layouts/            # BaseLayout
│   ├── content/educatorNotes/  # Markdown essays
│   ├── data/               # siteConfig, catalog, matrix, ai-series
│   └── styles/global.css
├── public/assets/          # Images, scripts, catalog JSON for client filter
└── scripts/publish.mjs
```

Internal tooling: `../selkid-tools/` (not in this repo).

## New Educator Note

Create `src/content/educatorNotes/your-slug.md`:

```yaml
---
title: "Your title"
description: "One-line summary"
pubDate: 2026-06-30
featured: true
category: "classroom"   # classroom | sel | ai | product
---
```

Then `npm run publish`.

## Config

Edit `src/data/siteConfig.json` — domain, TPT, MailerLite, Formspree.

Handoff: `../SELKID项目接力文档.md`
