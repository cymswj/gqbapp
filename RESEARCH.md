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
