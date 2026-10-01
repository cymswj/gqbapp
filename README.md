# gqbapp / GQB Tools

面向全球用户的免费在线工具站。

核心思路：用户带着一个明确任务进入网页，马上完成任务。工具本身真实可用，SEO 只是帮助用户找到工具，而不是用大量空页面制造流量。

## 当前架构

- 10 种语言：en / zh / es / fr / de / pt / ru / ja / ar / id
- 54 个工具，覆盖计算、转换、PDF、图片、文字、开发者、生成器等方向
- 每种语言使用独立 URL，并生成 hreflang、canonical、sitemap、Open Graph 和结构化数据
- src/seo-overrides.json：可编辑的 SEO 覆盖层
- admin.html：SEO 管理后台
- worker.js：在线 SEO API，可接 GitHub 或 Cloudflare KV
- wrangler.toml：Cloudflare Worker 部署配置
- scripts/build.py：批量生成多语言静态页面
- .github/workflows/pages.yml：自动构建和发布

## 工具策略

第一批优先做真实高频的“计算/转换/文件/开发者”工具。

后续重点：
PDF to Word、HEIC to JPG、PDF 压缩、图片格式转换、图片压缩、OCR、背景移除、图片转文字、视频/音频转换、开发者调试工具、SEO 工具等。

重型工具只有在功能真正完成后才创建可收录页面，不发布“假的功能页”。

## SEO 后台

后台可以管理：
- SEO Title
- Meta Description
- H1
- 页面首段
- Target Keywords
- index / noindex

在线模式：
admin.html → Cloudflare Worker /api/seo → GitHub src/seo-overrides.json → GitHub Actions → 自动重新构建多语言页面。

这样以后改一个工具的 SEO，不需要手工修改几十个 HTML 页面。

当前在线模式需要在 Cloudflare Worker 中设置：
GITHUB_TOKEN
GITHUB_REPO=cymswj/gqbapp
GITHUB_BRANCH=main
ADMIN_PASSWORD

GitHub Token 必须作为 Worker Secret 保存，不能放在前端或 GitHub 文件中。

## GitHub Pages

当前 GitHub Actions 的构建步骤已经可以成功生成网站；部署步骤会要求仓库先启用 GitHub Pages。

一次性设置：
仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。

启用后，push main 会自动构建并发布。

## SEO 原则

Google 推荐多语言页面使用不同 URL，并配合 hreflang；标题应当描述清楚页面内容；页面级 meta description 应该有实际作用。

同时不要用 AI 或自动翻译批量制造大量没有实际价值的页面。Google 的 scaled content abuse 政策明确把这种行为作为垃圾内容风险。

详细研究见 RESEARCH.md。


## 2026-10 深度优化结果

当前站点已经从“工具集合”整理成“工具产品”结构：
- 首页按分类组织工具，并提供热门工具、分类筛选和搜索。
- 44 个工具页面统一使用真实功能页，不为 SEO 发布空壳功能。
- 10 种语言使用独立 URL，并继续保留 canonical + hreflang。
- sitemap 只收录可索引页面，并加入多语言 alternates；不再用每次构建都更新的虚假 lastmod。
- 增加 About / Privacy 页面，提高站点信任信息和用户理解。
- SEO 后台支持“工具页面 / 语言首页”两种作用域。
- SEO Worker 的 GET 读取也需要管理员密码；CORS 默认限制到 GitHub Pages 域名。
- admin.html 标记 noindex；robots.txt 明确禁止后台。
- GitHub Pages 继续通过 Actions 构建 dist 后部署。

### 研究结论

2026 年当前公开数据仍显示，工具站的主要机会集中在“明确任务 + 立即完成”：
- “pdf to word” 在某个当前 Google Ads 数据样本中约 246,000 次/月（美国），相关 “convert pdf to word” 约 110,000 次/月。
- “image resizer” 的公开样本约 145,000–165,000 次/月，来源不同所以只能视为需求信号。
- “word counter” 的公开第三方数据约 792,000 次/月。
- “qr code generator” 的当前公开数据约 673,000–1,800,000 次/月，具体取决于数据供应商和关键词口径。

这些数字不是 GQB Tools 的流量预测，只用于选择产品方向。后续应以 Google Search Console 的真实查询数据、页面点击率和工具使用率调整目录。

Google 当前仍强调 people-first content，并明确反对为了搜索排名而大规模制造没有新增价值的页面。多语言站点应使用不同 URL 并配合 hreflang。FAQ 富结果在 2026 年已弃用，因此 FAQ 适合作为用户内容，不应作为 SEO 核心依赖。

### 下一阶段产品优先级

第一阶段继续加强已有高频工具的完整性、速度、移动端和下载能力。

第二阶段集中补齐高需求但需要更重处理的能力：PDF to Word、PDF 压缩、OCR、HEIC/JPG、图片转文字。

第三阶段加入商业化能力：去广告、高级批量处理、历史记录、团队空间、API，以及自有域名与后台数据分析。

重型能力必须先实现真实功能和错误处理，再开放可索引页面。


## 2026-10-01 全方位产品复核

本轮按照 iLovePDF、Smallpdf、TinyWow、Convertio 等成熟工具站的公开功能结构重新检查产品缺口。当前竞品普遍把“文件处理 + PDF + 图片 + OCR + 批量操作 + 开发者工具”作为完整工作流，而不是几十个孤立的计算器。iLovePDF 当前公开工具包含合并、拆分、压缩、Office 转换、PDF→Word/OCR、PDF→JPG、旋转、删页、重排、加页码、水印、OCR、PDF→Markdown 等；Smallpdf 当前公开分类也覆盖 PDF→Word/Excel/PPT、OCR、PDF→JPG/PNG、Office→PDF、组织页面、编辑、签名和保护；TinyWow 的公开工具目录进一步覆盖图片 OCR、HEIC、PDF 页码/旋转、背景处理以及视频/音频工具；Convertio 则以大量格式转换和 API 为核心。citeturn386806search3turn386806search4turn386806search1turn386806search0

因此 GQB Tools 不应复制它们数百个工具的数量，而应优先覆盖用户最容易反复遇到的任务，并保持浏览器本地处理优先。当前新增 PDF→JPG、删除 PDF 页面、旋转 PDF、页码、水印和图片 OCR，正好补齐了一部分高频文件工作流。

性能策略也明确：主站 HTML 采用构建时预渲染，工具运行 JavaScript；重型第三方库只在用户打开对应工具并实际点击后加载，避免首页把 PDF/OCR 库全部加载进来。Google 对 JavaScript SEO 明确指出预渲染/服务器端渲染通常更利于速度与抓取，因此当前“静态 HTML + 客户端工具”架构比全站只输出 JS 应用壳更适合 SEO。citeturn149334search4

核心 Web 指标继续作为性能目标：LCP 尽量控制在 2.5 秒以内、INP 200 毫秒以内、CLS 低于 0.1。citeturn149334search11

SEO 页面继续采用独立语言 URL + hreflang，并避免基于 IP 自动跳转。Google 当前建议不同语言使用不同 URL，并明确建议让用户自己切换语言；同时语言判断应结合页面可见内容，而不是只依赖 HTML lang 或 URL。citeturn149334search0turn149334search1

Meta description 继续按页面意图逐步完善。Google 说明页面正文经常会直接参与 snippet 生成，因此不能只改 meta description，还要保证 H1、首段和工具实际内容相互一致。citeturn149334search2

最后，工具功能本身必须是真实功能。Google 当前垃圾内容政策把“声称提供某种功能、实际却用广告或误导方式替代功能”列为 misleading functionality，并明确指出大规模生成低价值页面可能属于 scaled content abuse。citeturn748773search9
