# SELKID — Cloudflare Pages 部署

## Build settings（**已从纯静态改为 Astro**）

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Framework preset | **Astro**（或 None + 手动填下面两行） |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20+（Cloudflare 默认通常够用） |

> 若仍填「无构建 + `/`」，网站会部署旧结构或空白。**必须改为 `dist`。**

## First deploy after Astro migration

1. Push 本仓库到 GitHub  
2. Cloudflare Pages → 项目 **Settings → Builds** → 更新上表  
3. **Retry deployment**  
4. 绑定 `selkid.com`

## Every update

```powershell
cd "E:\AI NOVEL\TPTWEB\selkid-site"
npm run publish
```

或手动：`npm run build` → `git add` → `commit` → `push`

## MailerLite

在 `src/data/siteConfig.json` 填写：

```json
"mailerLiteAccountId": "你的账号ID",
"mailerLiteFormId": "嵌入表单 data-form 值"
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Cloudflare | 确认 build command = `npm run build`，output = `dist` |
| 旧 .html 链接 404 | `public/_redirects` 已做 301 |
| SEL 筛选不工作 | 确认 `public/data/catalog.json` 存在 |
| 图片 404 | 确认 `public/assets/` 已提交 |
