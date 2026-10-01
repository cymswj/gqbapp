# gqbapp / GQB Tools

面向全球用户的免费在线工具站。

核心思路：用户带着一个明确任务进入网页，马上完成任务。工具本身真实可用，SEO 只是帮助用户找到工具，而不是用大量空页面制造流量。

## 当前架构

- 10 种语言：en / zh / es / fr / de / pt / ru / ja / ar / id
- 40 个左右的工具，覆盖计算、转换、PDF、图片、文字、开发者、生成器等方向
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
