# SELKID 网站 A+ 升级总清单

> **目标**：把 selkid.com 从「品牌导流站」升级为「发现 → 信任 → 购买」闭环的 **K–6 教育产品主场**。  
> **原则**：每一阶段有验收标准；未过验收不进入下一阶段。  
> **最后更新**：2026-07-02

---

## 进度总览

| 阶段 | 名称 | 状态 | 验收门 |
|------|------|------|--------|
| 0 | 基线评估 | ✅ 完成 | 评估报告签字 |
| 1 | 架构与数据 | ✅ 完成 | 构建通过 + 无重复数据源 |
| 2 | 商品层（核心） | ✅ 完成 | 229 SKU 各有详情页 + sitemap |
| 3 | 目录与 UX | ✅ 完成 | SSR 目录 + 分页 + 搜索同义词 |
| 4 | 视觉与品牌 | 🟡 进行中 | 设计评审通过 |
| 5 | QA 与上线 | ⬜ 待开始 | 生产环境全绿 |
| 6 | 复盘与迭代 | ⬜ 待开始 | 30 日数据复盘 |

**图例**：⬜ 待开始 · 🟡 进行中 · ✅ 完成 · 🔴 阻塞

---

## 阶段 0 · 基线评估（Planning）

> **产出**：现状快照 + 差距清单 + 优先级排序  
> **工期**：1–2 天

### 0.1 技术基线

- [ ] **T0-01** 记录生产环境 Lighthouse（Mobile + Desktop）四项分数
- [ ] **T0-02** 记录首屏 LCP / CLS / INP（Cloudflare Web Analytics 或 PageSpeed）
- [ ] **T0-03** 盘点静态资源体积：`catalog.json`、CSS、JS、223 封面总量
- [ ] **T0-04** 验证软 404：随机 10 个不存在 URL 是否返回真 404
- [ ] **T0-05** 验证 GSC：索引页数、sitemap 提交状态、Coverage 错误
- [ ] **T0-06** 验证 robots.txt / llms.txt 线上内容与 repo 一致

**验收标准**：`docs/baseline-audit.md` 填写完成，含截图或数值。

### 0.2 产品与内容基线

- [ ] **C0-01** 确认 catalog 229 条：价格、描述、localImage、TPT URL 完整率 100%
- [ ] **C0-02** 统计各 pillar 数量：SEL / Thinking / AI 与 TPT 店铺一致
- [ ] **C0-03** 列出 6 个 AI 单元是否需独立 TPT 链接（当前链到 store 首页）
- [ ] **C0-04** 抽样 20 张封面：本地文件可读、比例正常、无损坏

### 0.3 体验基线（反对者视角）

- [ ] **U0-01** 新用户 5 分钟测试：能否找到「插嘴/blurting」相关故事并到达 TPT
- [ ] **U0-02** 移动端测试：sel-stories 210 卡滚动是否卡顿
- [ ] **U0-03** 记录全站 CTA 数量与类型（订阅 / 浏览 / TPT）——目标 Phase 3 减半主 CTA
- [ ] **U0-04** 记录跨页重复模块（SelFrameworkExplainer、BeliefBand、StepsGrid 出现次数）

**阶段 0 出口**：基线报告完成 → 批准进入阶段 1。

---

## 阶段 1 · 架构与数据（Foundation）

> **产出**：可扩展的数据管道 + 单一数据源 + 404  
> **工期**：3–5 天

### 1.1 数据单一源

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| A1-01 | `catalog.json` 只保留 `src/data/`，构建时 copy 到 `public/data/` | P0 | 无手工双写 |
| A1-02 | 新增 `displayTitle` 字段（脚本从 TPT 长标题生成短标题） | P0 | 229 条均有 ≤60 字符 displayTitle |
| A1-03 | 新增 `slug` 字段：`/resources/{slug}-{tptId}` | P0 | 唯一、URL 安全 |
| A1-04 | `sync_catalog_from_tpt.py` 合并 displayTitle + slug 生成 | P0 | 一条命令全量更新 |
| A1-05 | 封面 pipeline：`download_catalog_covers.py` 写入 CI/文档 | P1 | README 有操作说明 |

### 1.2 路由与错误页

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| A1-06 | 新增 `404.astro`（品牌一致 + 回首页/SEL Stories 链接） | P0 | 不存在路径返回 404 状态码 |
| A1-07 | Cloudflare `_redirects` 审查：shop→sel-stories 等 | P1 | 无 redirect loop |
| A1-08 | 修复软 404（若 CF Pages 配置导致） | P0 | curl 错链 → HTTP 404 |

### 1.3 样式架构

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| A1-09 | 拆分 `global.css` → `tokens.css` + `components/` + `pages/` | P2 | 主文件 <1500 行 |
| A1-10 | 建立 design tokens 文档（颜色、间距、圆角、字体） | P2 | `docs/design-tokens.md` |

**阶段 1 出口**：`npm run build` 通过；404 正常；catalog 含 displayTitle + slug。

---

## 阶段 2 · 商品层（Product Layer）— 核心

> **产出**：229 个 SKU 各有站内详情页，SEO 可索引  
> **工期**：5–7 天

### 2.1 详情页模板

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| P2-01 | 新建 `src/pages/resources/[slug].astro` 动态路由 | P0 | 任意 tptId 可访问 |
| P2-02 | 详情页区块：封面 · displayTitle · 完整描述 · 价格 · CASEL/矩阵标签 | P0 | 信息完整 |
| P2-03 | 主 CTA：`Buy on TPT →`（新窗口 + rel） | P0 | 链接有效 |
| P2-04 | 次 CTA：Get free sample / 相关故事 | P1 | 至少 3 条相关推荐 |
| P2-05 | JSON-LD：`Product` + `BreadcrumbList` | P0 | Rich Results 测试通过 |
| P2-06 | OG image 使用本地封面 | P0 | 社交分享预览正确 |

### 2.2 列表页链接改造

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| P2-07 | `ProductGrid.astro` 卡片标题改用 `displayTitle` | P0 | 卡片 ≤2 行标题 |
| P2-08 | 卡片增加「View details」→ 详情页；Buy 保留 | P0 | 双路径 |
| P2-09 | `interactive.js` productCard 同步改造 | P0 | JS 渲染一致 |
| P2-10 | 首页 featured 4 卡链到详情页 | P1 | 无死链 |

### 2.3 Sitemap 与 SEO

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| P2-11 | sitemap 纳入全部 `/resources/*` | P0 | sitemap URL 数 ≥229 |
| P2-12 | GSC 提交新 sitemap | P0 | 提交截图/记录 |
| P2-13 | `llms-full.txt` 加入资源 URL 列表 | P1 | 与 catalog 同步 |
| P2-14 | 内链：educator-notes / learning-system 链到代表 SKU | P2 | ≥5 内链 |

**阶段 2 出口**：随机抽 10 个 SKU，详情页完整、schema 有效、sitemap 含 URL。

---

## 阶段 3 · 目录与 UX（Discovery）

> **产出**：老师 30 秒内找到合适故事；列表页 SSR  
> **工期**：5–7 天

### 3.1 目录 SSR（告别空网格）

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| U3-01 | sel-stories 构建时预渲染默认 48 张卡 HTML | P0 | 禁用 JS 仍可见商品 |
| U3-02 | thinking-skills 同上（12 张全渲染） | P0 | 同上 |
| U3-03 | JS 仅负责筛选/搜索增强（progressive enhancement） | P0 | 筛选后仍可用 |
| U3-04 | 恢复分页：默认 48 + Load more（或虚拟滚动） | P0 | 210 卡 DOM ≤48 初始 |
| U3-05 | catalog.json 拆分为 `catalog-sel.json` / `catalog-thinking.json` | P1 | 单文件 <200KB |

### 3.2 筛选与搜索

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| U3-06 | 搜索同义词表：blurting ↔ calling out ↔ interrupting | P0 | 搜 "interrupt" 有结果 |
| U3-07 | 筛选结果 `aria-live="polite"` 播报 | P1 | VoiceOver 可读 |
| U3-08 | URL query 可分享筛选状态 | P1 | 复制链接可复现 |
| U3-09 | Clear filters 重置 URL | P1 | 无残留 query |
| U3-10 | Topic 快捷入口置顶（Waiting/Blurting/…）视觉强化 | P1 | 比 matrix 更显眼 |

### 3.3 首页与导航减负

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| U3-11 | 首页 Hero **单一主 CTA**（订阅为主 OR 浏览为主，二选一） | P0 | 设计确认 |
| U3-12 | 首页区块合并：BeliefBand + Steps 二选一或折叠 | P1 | 首屏滚动 ≤2.5 屏 |
| U3-13 | 导航：Rex & Dino 进主 nav 或合并为 Explore 下拉 | P2 | ≤5 个一级项 |
| U3-14 | 跨页重复：SelFrameworkExplainer 只留 learning-system | P1 | 其他页链过去 |
| U3-15 | sel-stories Hero 缩短，筛选区上移 | P1 | 首屏见 ≥4 张卡 |

### 3.4 购买路径

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| U3-16 | 详情页「What’s included」占位（页数/格式，若数据有） | P2 | 可选 |
| U3-17 | AI 6 单元独立 TPT URL（若有） | P1 | 非 store 首页 |
| U3-18 | Footer TPT 链改为「Browse all 229 resources」→ sel-stories | P1 | 减少直接流失 |

**阶段 3 出口**：5 名目标用户（或自测剧本）30 秒内完成「找故事 → 详情 → TPT」。

---

## 阶段 4 · 视觉与品牌（Polish）

> **产出**：专业教育品牌感，非 TPT 镜像  
> **工期**：4–6 天

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| V4-01 | 商品卡设计 v2：系列色条、价格角标、Teacher pick 标签位 | P1 | Figma/实装一致 |
| V4-02 | 详情页版式：左封面右信息（desktop）/ 堆叠（mobile） | P1 | 响应式 |
| V4-03 | 封面 WebP 转换 + `<picture>` srcset | P1 | 体积 −30% |
| V4-04 | 统一 page-hero 变体（≤2 种，非每页复制） | P2 | 代码复用 |
| V4-05 | 筛选区视觉终稿：间距、字号、active 态一致 | P1 | 设计评审 |
| V4-06 | 404 / 空状态插画（Rex & Dino） | P2 |cut | 品牌一致 |
| V4-07 | favicon + OG 默认图统一为 Maple Forest 非 logo | P2 | 社交预览 |

**阶段 4 出口**：内部设计评审「像独立品牌站，不像 TPT 壳」。

---

## 阶段 5 · QA 与上线（Ship）

> **工期**：2–3 天

### 5.1 自动化

| ID | 任务 | 优先级 | 验收 |
|----|------|--------|------|
| Q5-01 | `npm run build` CI（GitHub Actions 或本地 pre-push） | P1 | 每次 push 绿 |
| Q5-02 | 链接检查脚本：catalog 内 tptUrl HTTP 200 抽样 | P2 | 报告 |
| Q5-03 | 封面存在性检查：`localImage` 文件都在 | P1 | 0 missing |

### 5.2 手工测试矩阵

| 场景 | 设备 | 通过 |
|------|------|------|
| 首页 → 订阅表单 | Desktop / Mobile | ⬜ |
| sel-stories 筛选 + 搜索 | Desktop / Mobile | ⬜ |
| 详情页 → TPT | Desktop / Mobile | ⬜ |
| 404 页 | Desktop | ⬜ |
| 导航 + 移动端菜单 | Mobile | ⬜ |
| Educator Notes 阅读 | Desktop | ⬜ |
| AI Cognition 单元卡 | Desktop / Mobile | ⬜ |

### 5.3 上线清单

- [ ] **Q5-04** GitHub Desktop push（含 223 封面 ~44MB，首次较慢）
- [ ] **Q5-05** Cloudflare Pages 部署成功
- [ ] **Q5-06** 生产 spot-check：10 个详情页 + 10 张封面
- [ ] **Q5-07** GSC URL 检查：新详情页 5 条 Request indexing
- [ ] **Q5-08** 更新 `docs/CHANGELOG.md` 记录版本

**阶段 5 出口**：生产全绿；无 P0/P1 开放 bug。

---

## 阶段 6 · 复盘与迭代（Review & Fix）

> **上线后 7 天 / 30 天各一次**

### 6.1 7 日复盘

| 指标 | 目标 | 实际 |
|------|------|------|
| GSC 已索引详情页数 | ≥50 | |
| 平均 LCP（Mobile） | <2.5s | |
| Bounce rate（CF Analytics） | 基线 −10% | |
| TPT 外链点击率 | 建立基线 | |
| 404 错误数 | 0 新增 | |

- [ ] **R6-01** 修复复盘发现的 P0 bug（24h 内）
- [ ] **R6-02** P1 bug 排入下一 sprint
- [ ] **R6-03** 更新 ROADMAP 状态与 CHANGELOG

### 6.2 30 日复盘

- [ ] **R6-04** 长尾 SEO：哪些 `/resources/*` 有展示/点击
- [ ] **R6-05** 筛选热词：搜索框 top queries（需 Analytics 事件）
- [ ] **R6-06** 决定是否做：Bundle 页、系列页、中文站、教师账号
- [ ] **R6-07** 封面/ catalog 增量 sync 流程文档化

### 6.3 修复 SLA

| 级别 | 定义 | 响应 |
|------|------|------|
| P0 | 站不可用、全站封面挂、购买链全断 | 4h |
| P1 | 详情页 404、筛选失效、移动端严重卡顿 | 24h |
| P2 | 样式错位、文案、非关键 SEO | 下一迭代 |

---

## 执行顺序（推荐 Sprint）

### Sprint 1（Week 1）— 能卖

1. A1-02 ~ A1-04 displayTitle + slug  
2. A1-06 ~ A1-08 404  
3. P2-01 ~ P2-06 详情页模板  
4. P2-07 ~ P2-10 列表链详情  
5. P2-11 ~ P2-12 sitemap + GSC  

**交付**：229 详情页可访问、可分享、可索引。

### Sprint 2（Week 2）— 好用

1. U3-01 ~ U3-05 SSR + 分页  
2. U3-06 ~ U3-10 搜索与 a11y  
3. U3-11 ~ U3-15 首页/导航减负  
4. Q5-01 ~ Q5-08 上线  

**交付**：老师 30 秒找到书；生产稳定。

### Sprint 3（Week 3–4）— 好看

1. V4-01 ~ V4-07 视觉 polish  
2. A1-09 ~ A1-10 CSS 拆分  
3. R6-01 ~ R6-07 复盘  

**交付**：A+ 视觉与可维护性。

---

## 脚本与命令速查

```bash
# 同步 TPT → catalog
cd selkid-tools && python scripts/sync_catalog_from_tpt.py

# 下载/更新本地封面
python scripts/download_catalog_covers.py

# 构建站点
cd selkid-site && npm run build

# 封面完整性（待建）
python scripts/verify_covers.py
```

---

## 已完成项（截至 2026-07-02）

- [x] TPT 全量 SKU 同步（229）
- [x] 本地封面 223 张（`public/assets/covers/tpt/`）
- [x] 商品卡：封面 + 描述 + Buy on TPT
- [x] 筛选 UI 重构（catalog-topbar / advanced matrix）
- [x] SEO：robots、llms.txt、sitemap、JSON-LD、FAQ
- [x] `/shop` 移除，重定向至 sel-stories

---

## 负责人与决策点

| 决策 | 选项 | 建议 |
|------|------|------|
| 首页主 CTA | 订阅 vs 浏览 SEL | **订阅**（列表页已可浏览） |
| 详情页 URL | `/resources/[slug]` vs `/p/[tptId]` | **slug-tptId**（可读 + 唯一） |
| 列表初始数量 | 24 vs 48 | **48**（平衡 SEO 与性能） |
| 封面格式 | JPG vs WebP | **WebP + JPG fallback**（Sprint 3） |

---

*本清单随 sprint 更新。完成项打 `[x]` 并注明日期。*
