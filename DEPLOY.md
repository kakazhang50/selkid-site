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
4. 绑定自定义域（三个都要加）：
   - `selkid.com`
   - `www.selkid.com`
   - `story.selkid.com`（KDP / Pinterest 旧链接）

## Custom domains & DNS

| 主机 | DNS 记录 | Pages 自定义域 |
|------|----------|----------------|
| `@` / `selkid.com` | CNAME → `selkid-site.pages.dev`（已代理） | ✅ 必须 Active |
| `www` | CNAME → `selkid-site.pages.dev`（已代理） | ✅ 必须 Active |
| `story` | CNAME → `selkid-site.pages.dev`（已代理） | ✅ 必须 Active |

> **DNS 写对不够**：每个域名都要在 Pages → **Custom domains** 里单独添加，否则会出现 522 / 404。

### story.selkid.com（KDP 读者入口 · KDP / Pinterest 旧链接）

1. Pages → **selkid-site** → Custom domains → 添加 `story.selkid.com`
2. DNS：`story` CNAME → `selkid-site.pages.dev`（已代理）
3. `story.selkid.com` → **301 到主站** `https://selkid.com/`（与 www 相同，保留路径）
4. KDP 书目页仍在 **`https://selkid.com/story/`**（需从站内链接进入，不自动跳转）

书目数据维护：`src/data/kdp-books.json`（从 Amazon 作者页同步）

> **注意**：`/sel-stories/` 是 TPT 课堂资源目录，与 KDP 读者故事页不同。

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
