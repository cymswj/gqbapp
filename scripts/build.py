import json, html, shutil
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
PUB = ROOT / "public"
DIST = ROOT / "dist"

site = json.loads((SRC / "site-config.json").read_text(encoding="utf-8"))
i18n = json.loads((SRC / "i18n.json").read_text(encoding="utf-8"))
tools = json.loads((SRC / "tools.json").read_text(encoding="utf-8"))
locales = site["supportedLocales"]

base = site["baseUrl"].rstrip("/")

generic = {
 "en": "Free online tool. Fast, simple and no signup required.",
 "zh": "在线免费工具，打开即用，无需注册。",
 "es": "Herramienta online gratuita, rápida y sin registro.",
 "fr": "Outil en ligne gratuit, rapide et sans inscription.",
 "de": "Kostenloses Online-Tool, schnell und ohne Registrierung.",
 "pt": "Ferramenta online grátis, rápida e sem cadastro.",
 "ru": "Бесплатный онлайн-инструмент без регистрации.",
 "ja": "無料のオンラインツール。登録不要です。",
 "ar": "أداة مجانية عبر الإنترنت، سريعة وبدون تسجيل.",
 "id": "Alat online gratis, cepat, tanpa pendaftaran."
}

def t(name, loc):
    return name.get(loc) or name.get("en") or ""

def url(loc, slug=None):
    if slug:
        return f"{base}/{loc}/tools/{slug}/"
    return f"{base}/{loc}/"

def esc(s):
    return html.escape(str(s), quote=True)

def asset(depth, name):
    return ("../" if depth == 1 else "../../../") + "public/" + name

def topnav(loc, depth):
    names = {"en":"EN","zh":"中文","es":"ES","fr":"FR","de":"DE","pt":"PT","ru":"RU","ja":"日本語","ar":"العربية","id":"ID"}
    home = "../../" if depth == 2 else "./"
    links = " ".join(f'<a href="{("../"*depth) + loc if False else "../"*depth}{l}/">{n}</a>' for l,n in names.items())
    return f'<header><div class="wrap top"><a class="brand" href="{home}">GQB Tools</a><nav class="langs">{links}</nav></div></header>'

def shell(loc, title, desc, canonical, body, depth, extra=""):
    direction = "rtl" if loc == "ar" else "ltr"
    alts = []
    for l in locales:
        alts.append(f'<link rel="alternate" hreflang="{l}" href="{esc(canonical.replace("/"+loc+"/", "/"+l+"/"))}">')
    xdefault = canonical.replace("/"+loc+"/", "/"+site["defaultLocale"]+"/")
    alts.append(f'<link rel="alternate" hreflang="x-default" href="{esc(xdefault)}">')
    schema = {
      "@context":"https://schema.org",
      "@type":"WebPage",
      "name":title,
      "description":desc,
      "url":canonical,
      "inLanguage":loc
    }
    return f'''<!doctype html>
<html lang="{loc}" dir="{direction}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="{esc(site["seo"]["robots"])}">
<link rel="canonical" href="{esc(canonical)}">
{''.join(alts)}
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:image" content="{esc(base + site["ogImage"])}">
<meta name="twitter:card" content="{esc(site["seo"]["twitterCard"])}">
<link rel="stylesheet" href="{asset(depth,'style.css')}">
<script>window.GQB_I18N={json.dumps(i18n,ensure_ascii=False)};</script>
<script defer src="{asset(depth,'app.js')}"></script>
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>
{extra}
</head>
<body data-locale="{loc}">
{body}
</body>
</html>'''

DIST.mkdir(exist_ok=True)
if DIST.exists():
    for p in list(DIST.iterdir()):
        if p.is_dir():
            shutil.rmtree(p)
        else:
            p.unlink()

for loc in locales:
    cards = []
    for tool in tools:
        name = t(tool["names"], loc)
        desc = generic[loc]
        cards.append(
            f'<a class="toolcard" href="{url(loc, tool["slug"])}"><div class="icon">{esc(tool["icon"])}</div>'
            f'<h2>{esc(name)}</h2><p>{esc(desc)}</p><span class="use">{esc(i18n[loc]["useTool"])} →</span></a>'
        )
    home_body = topnav(loc, 1)
    home_body += f'''<main class="wrap">
<section class="hero">
<h1>GQB Tools</h1>
<p>{esc(site["siteTagline"])}. {esc(i18n[loc]["noSignup"])}</p>
<form class="search" onsubmit="return false"><input aria-label="{esc(i18n[loc]["search"])}" placeholder="{esc(i18n[loc]["searchPlaceholder"])}" oninput="filterTools(this.value)"></form>
</section>
<h2 class="section-title">{esc(i18n[loc]["popular"])}</h2>
<section class="grid">{"".join(cards)}</section>
</main>
<footer class="footer"><div class="wrap">{esc(i18n[loc]["privacy"])}</div></footer>
<script>function filterTools(q){q=q.toLowerCase();document.querySelectorAll(".toolcard").forEach(function(x){x.style.display=!q||x.innerText.toLowerCase().indexOf(q)>-1?"flex":"none"})}</script>'''
    html_text = shell(loc, f'GQB Tools – {site["siteTagline"]}', site["siteTagline"], url(loc), home_body, 1)
    out = DIST / loc / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html_text, encoding="utf-8")

    for tool in tools:
        name = t(tool["names"], loc)
        desc = generic[loc]
        title = name + " – GQB Tools"
        tool_body = topnav(loc, 2)
        tool_body += f'''<main class="wrap tool-page">
<a class="back" href="{url(loc)}">← {esc(i18n[loc]["back"])}</a>
<h1>{esc(name)}</h1>
<p class="lead">{esc(desc)}</p>
<div id="toolApp"></div>
<section><h2>{esc(i18n[loc]["about"])}</h2><p>{esc(desc)} {esc(i18n[loc]["privacy"])}</p></section>
<section class="faq"><h2>{esc(i18n[loc]["faq"])}</h2>
<details><summary>{esc(i18n[loc]["howToUse"])}</summary><p>{esc(desc)}</p></details>
<details><summary>{esc(i18n[loc]["noSignup"])}</summary><p>{esc(i18n[loc]["privacy"])}</p></details>
</section></main>
<footer class="footer"><div class="wrap">{esc(i18n[loc]["privacy"])}</div></footer>'''
        canonical = url(loc, tool["slug"])
        schema = {
          "@context":"https://schema.org",
          "@type":"WebApplication",
          "name":name,
          "description":desc,
          "applicationCategory":"UtilitiesApplication",
          "operatingSystem":"Any",
          "url":canonical
        }
        extra = '<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script>'
        page = shell(loc, title, desc, canonical, tool_body.replace('<body data-locale="'+loc+'">','<body data-locale="'+loc+'" data-tool="'+tool["impl"]+'">'), 2, extra)
        out = DIST / loc / "tools" / tool["slug"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page, encoding="utf-8")

(DIST / "public").mkdir(exist_ok=True)
for name in ["style.css","app.js","og-default.svg"]:
    shutil.copy2(PUB / name, DIST / "public" / name)

(DIST / "robots.txt").write_text(
    "User-agent: *\nAllow: /\nSitemap: " + base + "/sitemap.xml\n",
    encoding="utf-8"
)

urls = [url(l) for l in locales]
for l in locales:
    urls.extend(url(l, tool["slug"]) for tool in tools)

sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    sitemap.append("<url><loc>" + esc(u) + "</loc><lastmod>" + date.today().isoformat() + "</lastmod></url>")
sitemap.append("</urlset>")
(DIST / "sitemap.xml").write_text("\n".join(sitemap), encoding="utf-8")

print("Built", len(urls), "localized URLs")
