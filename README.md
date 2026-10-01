# gqbapp / GQB Tools

一个面向全球用户的免费在线工具站。

目标不是做一个“堆很多网页的 SEO 站”，而是做一个真正有用的工具入口：用户搜索一个问题，打开页面，马上完成任务。

## 第一阶段

目前已经建立：

- 10 种语言目录：en / zh / es / fr / de / pt / ru / ja / ar / id
- 20+ 个工具目录
- 百分比、年龄、日期差、时区、汇率、单位换算
- 密码、随机数、字数、字符数、二维码
- 图片压缩、图片调整尺寸、JPG 转 PDF、PDF 合并
- JSON、URL、Unix 时间戳、BMI、贷款、小费、图片取色、科学计算
- 每个语言与工具都有独立 URL
- title、description、canonical、hreflang、OG、结构化数据、sitemap
- GitHub Actions 自动生成多语言页面
- admin.html SEO 管理后台
- worker.js 在线 SEO API 预留

## 架构

src/site-config.json
站点级 SEO 与语言配置。

src/i18n.json
界面词库。

src/tools.json
工具目录、实现类型和多语言名称。

public/app.js
浏览器端工具运行引擎。尽可能让文件、文字和密码类功能在本地处理。

scripts/build.py
静态页面生成器。一次构建全部语言主页、工具页、robots.txt 和 sitemap.xml。

## SEO 后台

当前 GitHub Pages 是静态托管，所以 admin.html 先作为配置管理入口和草稿工具。

真正的在线后台已经预留 worker.js：

GET /api/seo
读取 SEO 配置。

PUT /api/seo
使用 X-Admin-Password 保存 SEO 配置。

Cloudflare 部署后可接 KV。下一步可以继续把页面标题、描述、robots、站点验证、工具页 SEO、语言版本、发布状态等全部做成后台 CMS。

## 部署

仓库已包含 GitHub Actions。

第一次使用 GitHub Pages 时，在仓库 Settings → Pages 中将发布方式设为 GitHub Actions。

以后 push 到 main，会自动运行 scripts/build.py 并发布 dist。

## SEO 原则

GQB Tools 会优先做“有实际使用价值的工具”，再根据真实搜索数据扩展。

不盲目生成大量同质化语言页。Google Search Central 明确提醒，大量没有给用户增加价值的自动生成页面可能触及 scaled content abuse。

多语言页面使用独立 URL，并用 hreflang 相互标注。

详细研究见 RESEARCH.md。
