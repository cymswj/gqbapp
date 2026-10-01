# GQB Tools 多语言高频工具站研究

研究时间：2026-10-01

## 方向

工具站的优势是用户带着一个明确任务进入页面，完成后立即离开。公开第三方关键词数据持续显示，百分比、年龄、密码、时区、随机数、字数、图片处理、PDF、二维码、汇率等都是有明确搜索需求的工具类别。

公开数据样本（不同来源、不同国家口径，不能直接相加）：
- Percentage Calculator：约 450,000 / 月（美国口径）https://www.seodata.dev/
- Age Calculator：约 220,000 / 月 https://kdroi.io/analysis/age-calculator
- Password Generator：约 240,000 / 月 https://kdroi.io/analysis/password-generator
- Time Zone Converter：约 180,000 / 月 https://kdroi.io/analysis/time-zone-converter
- Random Number Generator：约 180,000 / 月 https://kdroi.io/analysis/random-number-generator
- Image Resizer：约 145,000 / 月 https://kdroi.io/analysis/image-resizer
- JPG to PDF：约 201,000 / 月（美国口径）https://www.seodata.dev/keyword/jpg-to-pdf
- Compress PDF：约 110,000 / 月（美国口径）https://www.seodata.dev/keyword/compress-pdf
- QR Code Generator：相关网站关键词约 1.8M / 月 https://analytics.explodingtopics.com/website/qr-code-generator.com
- Currency Converter：约 673,000 / 月（美国口径）https://www.seodata.dev/keyword/converter-of-currency
- Image Compressor：约 60,500 / 月（美国口径）https://www.seodata.dev/keyword/image-compressor

这些数字只用于判断方向，不代表 GQB Tools 上线后的实际流量。

## 多语言

W3Techs 2026-10-01 的网站内容语言统计显示，英语约 49.5%，西班牙语 6.0%，德语 5.9%，日语 4.9%，法语 4.5%；俄语、葡萄牙语、中文、印尼语等也有稳定份额。

世界银行 Digital Progress and Trends Report 2025 的网络语言分析也说明，网络内容语言与互联网用户语言不是同一个指标。因此我们采用双重思路：先覆盖主要搜索语言，再根据 Search Console 的真实数据增加语言。

首批目录：
en / zh / es / fr / de / pt / ru / ja / ar / id

后续可增加 hi、vi 等，而不是一次性铺满。

## SEO 架构

每个语言和工具都采用独立 URL，例如：
/en/tools/percentage-calculator/
/zh/tools/percentage-calculator/
/es/tools/percentage-calculator/

每页独立生成：
title、meta description、canonical、hreflang、Open Graph、H1、工具说明、FAQ、WebPage/WebApplication structured data、sitemap。

Google Search Central 明确建议多语言页面使用不同 URL 并配合 hreflang；同时建议每个页面有独立、描述性的标题和页面级描述，避免关键词堆砌。

## 产品原则

不要为了 SEO 复制大量几乎相同的网页。Google 当前垃圾内容政策明确提到，没有给用户增加价值的大规模生成页面可能属于 scaled content abuse。

所以 GQB Tools 的路线是：
1. 先做约 20-30 个真正可用的工具。
2. 每个工具提供多语言本地化页面。
3. 图片、PDF、开发者工具逐步增加。
4. 用 Search Console 的真实查询数据决定新工具和新语言。
5. 后台控制 title、description、robots、验证代码和站点地址。

## 后续工具池

计算：百分比、年龄、日期差、科学计算、贷款、小费、BMI。
转换：时区、货币、长度、重量、温度。
文件：JPG→PDF、PDF 合并、PDF 压缩、图片压缩、图片尺寸。
文字：字数、字符、大小写、文本清理。
开发者：JSON、URL、时间戳、Base64、Hash、Regex、Markdown。
生成：二维码、密码、随机数、UUID、Lorem Ipsum。
图片：取色、图片尺寸、EXIF。
SEO：Meta 生成、Sitemap 生成、Robots.txt 生成、OG 检查。

## SEO 后台

仓库已经预留：
admin.html：SEO 管理页面
worker.js：在线 API
src/site-config.json：站点级配置
scripts/build.py：多语言页面生成器
GitHub Actions：自动构建和部署

下一阶段可将配置保存到 Cloudflare KV/D1，并由 Worker 在边缘层读取，使标题、描述、robots、验证代码等可以在线管理。

参考：
Google Search Central
https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
https://developers.google.com/search/docs/fundamentals/creating-helpful-content
https://developers.google.com/search/docs/essentials/spam-policies
https://developers.google.com/search/docs/appearance/title-link
https://developers.google.com/search/docs/appearance/snippet
https://w3techs.com/
https://www.worldbank.org/en/publication/digital-progress-and-trends-report-2025

## 2026-10 Refresh: current demand signals

Current third-party keyword datasets continue to show strong demand around PDF, image, QR, text, calculators and conversion utilities. A current public DataForSEO-derived page reports about 246,000 US monthly searches for “pdf to word” and 110,000 for “convert pdf to word”; image resizer data is around 145,000 monthly US searches in another tool-site analysis; “image compressor” is about 60,500 US searches. These figures come from different sources and should not be treated as a single authoritative total. citeturn310247search2turn310247search5turn797006search1

QR-code intent remains very large: one current public keyword dataset reports about 673,000 US monthly searches for “qr code generator” and about 110,000 for “generate qr code free.” citeturn310247search8

Word counting is another strong use case. Current third-party traffic data for WordCounter sites show “word counter” around 792,000–1,000,000 US monthly searches depending on source and period; the correct conclusion is that this is a major search intent, not that one exact volume is guaranteed. citeturn310247search0turn310247search3turn310247search7

A September 2026 survey of free online tools also highlights PDF conversion, JPG/PNG and HEIC conversion, PDF/image compression, PDF merge, QR generation, image-to-text, word counting, unit conversion and currency conversion as common high-demand categories. citeturn235471search12

## Language strategy refresh

W3Techs current survey on October 1, 2026 lists English at 49.5% of websites by content language, followed by Spanish 6.0%, German 5.9%, Japanese 4.9% and French 4.5%. Indonesian and Persian are among the fastest-growing content languages in the current survey, with Arabic also growing. citeturn235471search5turn235471search11

The strategy is not to translate a thin page 10 times. Google recommends different URLs for different language versions and hreflang annotations, while also warning that translating or automatically generating many near-duplicate pages without additional value can be considered scaled content abuse. citeturn634524search2turn634524search0turn634524search1

## Product roadmap

Priority A — high intent / broad audience:
PDF to Word, Word to PDF, PDF compress, PDF split, PDF merge, JPG/PNG/WebP conversion, HEIC to JPG, image compression, image resizing, QR generator, word counter, character counter, currency converter, time-zone converter.

Priority B — developer / creator:
UUID, Base64, Hash, Regex, JSON, CSV/JSON, URL encoder, timestamp, Markdown, HTML entities, slug generator, color tools, Open Graph preview, meta tag generator, robots.txt generator, sitemap generator.

Priority C — business / everyday calculation:
Discount, VAT/tax, profit margin, compound interest, savings, loan, tip, percentage, date difference, date add/subtract, business days, aspect ratio, data units, speed, area, volume.

Priority D — future server-side or heavy-processing tools:
PDF OCR, PDF to Word with layout preservation, background removal, image-to-text, video/audio conversion, DNS/HTTP inspection, webpage screenshot and URL metadata inspection. These should only be published after actual functionality is implemented and tested; do not create fake placeholder pages for SEO.

## SEO backend architecture

GQB Tools now has an editable SEO data layer in src/seo-overrides.json. Each tool/language can have:
- title
- description
- H1
- intro
- targetKeywords
- index/noindex

admin.html provides a browser-based editor. worker.js provides /api/seo with password protection. When GITHUB_TOKEN is configured in the Cloudflare Worker, changes are written to src/seo-overrides.json in the GitHub repository, so the GitHub Actions build is automatically triggered by the commit.

This is deliberately build-time SEO rather than client-side-only SEO: search engines receive title, description, canonical, hreflang and structured data in the generated HTML. Google recommends descriptive page titles and page-specific meta descriptions, and recommends consistent canonical/hreflang handling for localized pages. citeturn634524search5turn634524search6turn634524search2

One current Google Search detail matters for the roadmap: FAQ rich results were deprecated in May 2026. FAQ content can still be useful for readers, but GQB Tools should not depend on FAQ structured data as a traffic strategy. citeturn634524search7


## 2026-10-01 深度复核

这次复核的核心结论没有改变：不要做“什么关键词都做”的页面农场，而要做少量真正能完成任务的工具，再用多语言、性能、内部链接和真实数据不断扩充。

### 需求信号

公开第三方数据只能作为方向判断，不能当作 GQB Tools 的流量预测。当前样本包括：

- “pdf to word” 约 246,000 次/月（美国）；相关 “convert pdf to word” 约 110,000 次/月。
- “image resizer” 约 145,000–165,000 次/月，不同数据源口径不同。
- “word counter” 约 792,000 次/月。
- “qr code generator” 在不同公开数据源中约 673,000–1,800,000 次/月。
- “heic to jpg” 也显示出较强的图片格式转换需求，公开样本约 246,000 次/月。

参考：
https://www.seodata.dev/keyword/convert-pdf-to-editable-word
https://kdroi.io/analysis/image-resizer
https://ahrefs.com/websites/wordcounter.net
https://analytics.explodingtopics.com/website/qr-code-generator.com
https://analytics.explodingtopics.com/website/iloveimg.com

### 多语言策略

W3Techs 2026-10-01 的网站内容语言统计显示，英语约占已知网站内容语言的 49.5%，西班牙语 6.0%，德语 5.9%，日语 4.9%，法语 4.5%。在采用 HTTPS 默认协议的网站中，葡萄牙语约 4.1%、俄语约 3.2%、中文约 1.2%、印尼语约 1.1%、阿拉伯语约 0.6%。

因此现在的 10 语言目录合理，但不要为了“多语言”无限扩张。增加新语言应由 Search Console 的真实展示和点击数据驱动。

参考：
https://w3techs.com/technologies/overview/content_language
https://w3techs.com/technologies/segmentation/ce-httpsdefault/content_language

### SEO 技术策略

Google 当前建议多语言内容使用不同 URL，并使用 hreflang 帮助搜索引擎理解语言版本。网站应该让页面语言对用户和搜索引擎都清晰可见。

GQB Tools 当前采用：
/en/tools/xxx/
/zh/tools/xxx/
/es/tools/xxx/

每个页面输出 canonical、hreflang、Open Graph、语言标记、WebPage/WebApplication/面包屑结构化数据。

sitemap 现在只放可索引页面，并提供语言 alternates。移除了“每次构建都用今天日期”的 lastmod，因为 Google 明确建议 lastmod 应准确反映页面重大更新，而不是机械刷新。

参考：
https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites
https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

### 内容策略

Google 当前的核心方向仍是 people-first content。生成大量几乎相同的自动页面来覆盖关键词属于风险做法。工具站尤其应该避免：

“一个工具 + 十个语言 + 大量同义关键词页面”的无限复制。

正确方式是：
1. 一个真实工具对应一个真实任务。
2. 每种语言有独立、自然的标题和说明。
3. 工具本身必须真的可用。
4. SEO 页面提供额外解释、使用方法、隐私说明和内部链接。
5. 通过真实搜索数据决定下一批工具，而不是凭想象批量建页。

参考：
https://developers.google.com/search/docs/fundamentals/creating-helpful-content
https://developers.google.com/search/docs/essentials/spam-policies
https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

### 2026 产品结构

当前站点：44 个真实工具，10 个语言目录。

已覆盖的高频基础方向：
计算、单位/数据转换、时区、汇率、文本统计、二维码、密码/随机/UUID、图片压缩/调整尺寸/格式转换、JPG→PDF、PDF 合并/分割、JSON、URL、时间戳、Regex、Base64、Hash、利润率、温度、重量等。

暂不把 PDF→Word、PDF 压缩、OCR 等重型功能伪装成已完成工具。它们需要真正的文件解析、排版保真、浏览器性能与错误处理，应该在功能完成后再公开收录页。

### 后台架构

SEO 后台已经形成：

admin.html
→ Cloudflare Worker
→ GitHub src/seo-overrides.json
→ GitHub Actions
→ dist
→ GitHub Pages

后台现在支持：
- 工具页面 SEO
- 语言首页 SEO
- title / description / H1 / intro
- index / noindex
- 目标关键词规划
- 本机草稿
- 在线保存

Worker 对 GET 和 PUT 都需要管理员密码，并可限制 CORS 来源。敏感的 ADMIN_PASSWORD 与 GITHUB_TOKEN 必须使用 Cloudflare Secrets，不要写入 wrangler.toml 的 vars 或前端代码。

参考：
https://developers.cloudflare.com/workers/configuration/secrets/
https://developers.cloudflare.com/workers/configuration/environment-variables/
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

### 下一步

下一阶段最值得做的不是继续堆几十个小工具，而是把已有高需求工具做到“用户真的愿意收藏”：
首页加载速度、移动端操作、批量文件处理、下载体验、错误提示、工具之间互相推荐、最近使用、收藏，以及 Search Console 数据回流。

然后再进入：
PDF→Word / OCR / HEIC / PDF 压缩 / 图片转文字 / 批量处理 / API / 会员功能。


## 2026-10-01 新一轮需求验证

本轮继续检查文件转换类搜索需求。一个 2026 年 8 月公开发布、引用 Ahrefs 数据的样本估计 “heic to jpg” 约 218,000 次/月（美国）；另一个基于 Google Keyword Planner / DataForSEO 的 2026 年 9 月公开研究也把 HEIC/JPG 等格式转换作为持续可见的搜索需求。搜索量不是实际工具使用量，因此这里仅作为产品方向信号。

参考：
https://semiconductors.einnews.com/pr_news/935658333/an-estimated-half-a-million-plus-u-s-searches-a-month-look-for-a-way-to-convert-image-files-back-to-jpeg
https://gizmobench.com/research/file-formats


## 2026-10-01 竞品结构复核

成熟工具站的共同点是“任务工作流”，而不是单纯工具数量。iLovePDF 当前公开页面把 PDF 工作分为组织、优化、转换、编辑、安全和智能处理，并覆盖 PDF→Word/OCR、PDF→JPG、页码、水印、旋转、删页、重排等；Smallpdf 当前公开工具覆盖 PDF 转 Office、PDF OCR、PDF→JPG/PNG、Office→PDF、合并/拆分/旋转/删页、编辑、签名和保护；TinyWow 当前目录进一步覆盖 Image to Text、HEIC、PDF Page Deleter、Rotate PDF、Add Numbers to PDF、Add Watermark、背景处理及视频/音频转换；Convertio 则突出大规模格式转换和 Conversion API。citeturn386806search3turn386806search4turn386806search1turn386806search0

对 GQB Tools 的启示不是去复制数百个工具，而是建立四层产品：

1. 高频轻工具：计算、换算、文本、开发者工具。
2. 文件工作流：PDF 合并、拆分、删页、旋转、页码、水印、PDF→JPG、PDF→Text、图片→PDF。
3. 智能文件：图片 OCR、扫描 PDF OCR、PDF→Word/Excel/PPT、表格提取。
4. 开发者与自动化：API、批量处理、URL/HTTP/DNS 检查、文件批处理。

### 浏览器优先的技术路线

PDF.js 是 Mozilla 的 PDF 解析/渲染库，当前 npm 版本 6.3.289；它适合在浏览器中做 PDF 页面渲染和文本提取。citeturn763200search0

pdf-lib 适合浏览器端直接创建和修改 PDF，因此适合合并、删除页面、旋转、加页码、水印等无需服务器上传的功能。

Tesseract.js 当前 npm 最新版为 7.0.0，可在浏览器通过 Web Worker 运行 OCR；官方文档说明它支持从图片识别文字，并可用多个语言模型。它本身不直接支持 PDF，因此扫描 PDF OCR 应采用“PDF.js 渲染页面 → Tesseract OCR”的两阶段方案。citeturn137735search1turn137735search2

### 隐私与商业模式

当前工具站可以把“本地处理”作为产品差异点，但不能对所有工具笼统声称完全本地。汇率工具会访问外部汇率服务，PDF/OCR 工具会在浏览器加载第三方库和语言模型。页面应该明确说明处理方式。

当进入重型文件能力后，可以考虑两条路线：
- 小文件继续浏览器本地处理，降低服务器成本和隐私风险。
- 大文件、Office 转换、PDF→Word、OCR 批量处理等再接 Cloudflare Worker/独立处理服务。

这种“本地优先 + 重型任务服务端”的混合架构比一开始就把全部文件上传服务器更适合 GQB Tools。

### SEO 的长期方向

Google 目前强调 people-first content、独立语言 URL 和 hreflang，并警告大规模生成低价值页面可能属于 scaled content abuse。页面应该因为用户真正需要这项工具而存在，而不是因为关键词列表要求它存在。citeturn149334search0turn149334search1turn748773search9

此外，Google 当前说明 snippet 主要来自页面可见内容，meta description 只是可能被采用的摘要来源。因此后期 SEO 后台不能只改 title/description，还要允许编辑工具介绍、使用步骤和常见问题，并保证这些正文内容与工具实际功能同步。citeturn149334search2
