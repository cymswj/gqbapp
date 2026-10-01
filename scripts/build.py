import json, html, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
PUB = ROOT / "public"
DIST = ROOT / "dist"

site = json.loads((SRC / "site-config.json").read_text(encoding="utf-8"))
i18n = json.loads((SRC / "i18n.json").read_text(encoding="utf-8"))
tools = json.loads((SRC / "tools.json").read_text(encoding="utf-8")) + json.loads((SRC / "tools-extra.json").read_text(encoding="utf-8"))
categories = json.loads((SRC / "categories.json").read_text(encoding="utf-8"))
seo = json.loads((SRC / "seo-overrides.json").read_text(encoding="utf-8")) if (SRC / "seo-overrides.json").exists() else {"site": {}, "pages": {}}

locales = site["supportedLocales"]
base = site["baseUrl"].rstrip("/")
default_locale = site["defaultLocale"]

GENERIC = {
 "en": "Free online tool, fast and simple. No signup required.",
 "zh": "在线免费工具，打开即用，无需注册。",
 "es": "Herramienta online gratuita, rápida y sencilla. Sin registro.",
 "fr": "Outil en ligne gratuit, rapide et simple. Sans inscription.",
 "de": "Kostenloses Online-Tool, schnell und einfach. Keine Registrierung.",
 "pt": "Ferramenta online grátis, rápida e simples. Sem cadastro.",
 "ru": "Бесплатный онлайн-инструмент, быстро и просто. Без регистрации.",
 "ja": "無料のオンラインツール。すばやく簡単に使えて、登録不要です。",
 "ar": "أداة مجانية عبر الإنترنت، سريعة وبسيطة وبدون تسجيل.",
 "id": "Alat online gratis, cepat dan sederhana. Tanpa pendaftaran."
}

STATIC_COPY = {
 "en": {
   "about_title":"About GQB Tools",
   "about_h1":"Simple tools for everyday tasks",
   "about_p":"GQB Tools is a multilingual collection of calculators, converters, file utilities, text tools and developer helpers. The goal is simple: open a page, finish one task, and move on.",
   "about_p2":"Many calculations and browser file operations run locally in your browser. Some features, such as live currency rates and third-party library loading, require an internet connection.",
   "privacy_title":"Privacy",
   "privacy_h1":"Privacy-first by design",
   "privacy_p":"GQB Tools does not require an account for normal use. When a tool is implemented entirely in the browser, your input can stay on your device. Tools that call an external service will make a network request, such as the currency converter fetching exchange-rate data.",
   "privacy_p2":"Do not upload confidential or sensitive files unless you understand that the selected tool and browser environment may process them. We aim to keep tool pages lightweight and transparent."
 },
 "zh": {
   "about_title":"关于 GQB Tools",
   "about_h1":"为日常小任务准备的实用工具",
   "about_p":"GQB Tools 是一个多语言在线工具集合，提供计算器、单位换算、PDF、图片、文字和开发者工具。我们的目标很简单：打开网页，完成一件事，然后离开。",
   "about_p2":"很多计算和浏览器文件处理都直接在浏览器本地完成。部分功能，例如实时汇率，以及加载第三方库的工具，需要联网。",
   "privacy_title":"隐私",
   "privacy_h1":"尽量减少不必要的数据传输",
   "privacy_p":"正常使用 GQB Tools 不需要注册账号。对于完全在浏览器中运行的工具，输入内容可以留在你的设备上。需要外部服务的工具会产生网络请求，例如汇率换算器需要获取汇率数据。",
   "privacy_p2":"除非你已经了解相关处理方式，否则不要上传机密或敏感文件。我们会尽量让工具页面保持轻量、透明。"
 },
 "es": {
   "about_title":"Sobre GQB Tools",
   "about_h1":"Herramientas sencillas para tareas diarias",
   "about_p":"GQB Tools reúne calculadoras, conversores, utilidades de archivos, herramientas de texto y ayuda para desarrolladores en varios idiomas. La idea es abrir, hacer una tarea y seguir.",
   "about_p2":"Muchas operaciones se ejecutan localmente en el navegador. Algunas funciones, como los tipos de cambio en vivo, necesitan conexión a Internet.",
   "privacy_title":"Privacidad",
   "privacy_h1":"Diseñado pensando en la privacidad",
   "privacy_p":"No se necesita una cuenta para el uso normal. Cuando una herramienta funciona completamente en el navegador, tus datos pueden permanecer en tu dispositivo. Las herramientas que usan servicios externos realizan solicitudes de red.",
   "privacy_p2":"No subas archivos confidenciales sin entender cómo funciona la herramienta que has elegido."
 },
 "fr": {
   "about_title":"À propos de GQB Tools",
   "about_h1":"Des outils simples pour les tâches du quotidien",
   "about_p":"GQB Tools rassemble des calculateurs, convertisseurs, outils de fichiers, outils de texte et utilitaires pour développeurs en plusieurs langues.",
   "about_p2":"De nombreux calculs et traitements sont effectués directement dans le navigateur. Certaines fonctions, comme les taux de change, nécessitent une connexion Internet.",
   "privacy_title":"Confidentialité",
   "privacy_h1":"Pensé pour limiter les transferts inutiles",
   "privacy_p":"Aucun compte n’est nécessaire pour l’utilisation normale. Lorsqu’un outil fonctionne entièrement dans le navigateur, les données peuvent rester sur votre appareil. Les outils utilisant un service externe effectuent une requête réseau.",
   "privacy_p2":"N’envoyez pas de fichiers confidentiels sans comprendre le traitement utilisé."
 },
 "de": {
   "about_title":"Über GQB Tools",
   "about_h1":"Einfache Werkzeuge für alltägliche Aufgaben",
   "about_p":"GQB Tools bündelt Rechner, Umrechner, Dateiwerkzeuge, Textwerkzeuge und Entwicklerhilfen in mehreren Sprachen.",
   "about_p2":"Viele Berechnungen und Browser-Dateiverarbeitungen laufen direkt im Browser. Einige Funktionen, etwa aktuelle Wechselkurse, benötigen eine Internetverbindung.",
   "privacy_title":"Datenschutz",
   "privacy_h1":"Datenschutzorientiert entwickelt",
   "privacy_p":"Für die normale Nutzung ist kein Konto erforderlich. Bei vollständig im Browser ausgeführten Tools können Eingaben auf Ihrem Gerät bleiben. Externe Dienste erzeugen Netzwerkzugriffe.",
   "privacy_p2":"Laden Sie keine vertraulichen Dateien hoch, ohne die Verarbeitung des jeweiligen Tools zu prüfen."
 },
 "pt": {
   "about_title":"Sobre o GQB Tools",
   "about_h1":"Ferramentas simples para tarefas do dia a dia",
   "about_p":"O GQB Tools reúne calculadoras, conversores, ferramentas de arquivos, texto e utilitários para desenvolvedores em vários idiomas.",
   "about_p2":"Muitos cálculos e processamentos de arquivos são feitos no navegador. Alguns recursos, como cotações de moedas, exigem conexão à Internet.",
   "privacy_title":"Privacidade",
   "privacy_h1":"Pensado para reduzir transferências desnecessárias",
   "privacy_p":"Não é necessário criar uma conta para uso normal. Quando a ferramenta funciona totalmente no navegador, os dados podem permanecer no dispositivo. Ferramentas externas fazem solicitações de rede.",
   "privacy_p2":"Não envie arquivos confidenciais sem entender o processamento do recurso escolhido."
 },
 "ru": {
   "about_title":"О GQB Tools",
   "about_h1":"Простые инструменты для повседневных задач",
   "about_p":"GQB Tools объединяет калькуляторы, конвертеры, инструменты для файлов, текста и разработчиков на нескольких языках.",
   "about_p2":"Многие расчёты и операции с файлами выполняются прямо в браузере. Некоторые функции, например курсы валют, требуют подключения к интернету.",
   "privacy_title":"Конфиденциальность",
   "privacy_h1":"С упором на минимизацию передачи данных",
   "privacy_p":"Для обычного использования регистрация не требуется. Если инструмент работает полностью в браузере, введённые данные могут оставаться на устройстве. Внешние сервисы требуют сетевых запросов.",
   "privacy_p2":"Не загружайте конфиденциальные файлы, не проверив способ обработки выбранного инструмента."
 },
 "ja": {
   "about_title":"GQB Tools について",
   "about_h1":"毎日の小さな作業をすぐ終わらせるツール",
   "about_p":"GQB Tools は、計算、変換、ファイル、テキスト、開発者向けのオンラインツールを多言語で提供します。",
   "about_p2":"多くの計算やブラウザ上のファイル処理は端末内で行われます。一部の機能、たとえば為替レート取得にはインターネット接続が必要です。",
   "privacy_title":"プライバシー",
   "privacy_h1":"不要なデータ送信を減らす設計",
   "privacy_p":"通常利用にアカウントは必要ありません。完全にブラウザ内で動作するツールでは、入力内容が端末内に留まる場合があります。外部サービスを使う機能ではネットワーク通信が発生します。",
   "privacy_p2":"選択したツールの処理方法を確認するまで、機密ファイルをアップロードしないでください。"
 },
 "ar": {
   "about_title":"حول GQB Tools",
   "about_h1":"أدوات بسيطة للمهام اليومية",
   "about_p":"يجمع GQB Tools الحاسبات وأدوات التحويل والملفات والنصوص وأدوات المطورين في موقع متعدد اللغات.",
   "about_p2":"تعمل كثير من العمليات داخل المتصفح مباشرة. بعض الميزات، مثل أسعار العملات المباشرة، تحتاج إلى اتصال بالإنترنت.",
   "privacy_title":"الخصوصية",
   "privacy_h1":"تصميم يحد من نقل البيانات غير الضروري",
   "privacy_p":"لا تحتاج إلى حساب للاستخدام العادي. عندما تعمل الأداة بالكامل داخل المتصفح، يمكن أن تبقى مدخلاتك على جهازك. الأدوات التي تستخدم خدمة خارجية تنشئ طلبات شبكة.",
   "privacy_p2":"لا ترفع ملفات سرية قبل فهم طريقة معالجة الأداة المختارة."
 },
 "id": {
   "about_title":"Tentang GQB Tools",
   "about_h1":"Alat sederhana untuk tugas sehari-hari",
   "about_p":"GQB Tools menyediakan kalkulator, konverter, alat file, teks, dan utilitas pengembang dalam berbagai bahasa.",
   "about_p2":"Banyak perhitungan dan pemrosesan file dilakukan langsung di browser. Beberapa fitur, seperti nilai tukar langsung, membutuhkan koneksi internet.",
   "privacy_title":"Privasi",
   "privacy_h1":"Dirancang untuk mengurangi transfer data yang tidak perlu",
   "privacy_p":"Penggunaan normal tidak memerlukan akun. Saat alat sepenuhnya berjalan di browser, masukan dapat tetap di perangkat. Fitur yang memakai layanan eksternal melakukan permintaan jaringan.",
   "privacy_p2":"Jangan mengunggah file rahasia sebelum memahami cara kerja alat yang dipilih."
 }
}

def t(name, loc):
    return name.get(loc) or name.get(default_locale) or ""

def site_meta(loc):
    override = seo.get("site", {}).get(loc, {}) if isinstance(seo.get("site", {}), dict) and isinstance(seo.get("site", {}).get(loc, {}), dict) else {}
    tagline = site.get("siteTaglines", {}).get(loc, site["siteTagline"])
    title = override.get("title") or f'{tagline} – {site["siteName"]}'
    desc = override.get("description") or tagline
    h1 = override.get("h1") or site["siteName"]
    intro = override.get("intro") or f'{tagline}. {i18n[loc]["noSignup"]}.'
    index = override.get("index", True)
    return title, desc, h1, intro, index

def tool_meta(tool, loc):
    key = f"{loc}:{tool['slug']}"
    override = seo.get("pages", {}).get(key, {})
    name = t(tool["names"], loc)
    return (
        override.get("title") or f"{name} – {site['siteName']}",
        override.get("description") or f"{name}. {GENERIC[loc]}",
        override.get("h1") or name,
        override.get("intro") or override.get("description") or f"{name}. {GENERIC[loc]}",
        override.get("index", True),
        override.get("targetKeywords", [])
    )

def url(loc, slug=None):
    if slug:
        return f"{base}/{loc}/tools/{slug}/"
    return f"{base}/{loc}/"

def static_url(loc, slug):
    return f"{base}/{loc}/{slug}/"

def esc(s):
    return html.escape(str(s), quote=True)

def asset(depth, name):
    return ("../" if depth == 1 else "../../../") + "public/" + name

def topnav(loc, depth, home_override=None):
    labels = {"en":"EN","zh":"中文","es":"ES","fr":"FR","de":"DE","pt":"PT","ru":"RU","ja":"日本語","ar":"العربية","id":"ID"}
    home = home_override or ("./" if depth == 1 else "../../")
    links = " ".join(f'<a href="{("../"*depth)}{l}/"' + (' aria-current="page"' if l == loc else '') + f'>{n}</a>' for l,n in labels.items())
    return f'<header><div class="wrap top"><a class="brand" href="{home}">{esc(site["siteName"])}</a><nav class="langs" aria-label="Language">{links}</nav></div></header>'

def footer(loc, kind, static_slug=""):
    if kind == "home":
        about_href, privacy_href = "about/", "privacy/"
    elif kind == "static":
        about_href = "./" if static_slug == "about" else "../about/"
        privacy_href = "../privacy/" if static_slug == "about" else "./"
    else:
        about_href, privacy_href = "../../about/", "../../privacy/"
    return f"""<footer class="footer"><div class="wrap footer-inner">
<strong>{esc(site["siteName"])}</strong>
<nav aria-label="Footer">
<a href="{about_href}">{esc(i18n[loc].get("aboutPage","About"))}</a>
<a href="{privacy_href}">{esc(i18n[loc].get("privacyPage","Privacy"))}</a>
</nav>
<span>{esc(i18n[loc]["privacy"])}</span>
</div></footer>"""

def analytics_tags():
    a = site.get("analytics", {})
    parts = []
    if a.get("googleSiteVerification"):
        parts.append(f'<meta name="google-site-verification" content="{esc(a["googleSiteVerification"])}">')
    if a.get("bingSiteVerification"):
        parts.append(f'<meta name="msvalidate.01" content="{esc(a["bingSiteVerification"])}">')
    gid = a.get("googleAnalyticsId", "")
    if gid:
        parts.append(f'''<script async src="https://www.googletagmanager.com/gtag/js?id={esc(gid)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config","{esc(gid)}");</script>''')
    return "\n".join(parts)

def shell(loc, title, desc, canonical, body, depth, extra="", index=True, schema=None):
    direction = "rtl" if loc == "ar" else "ltr"
    alts = []
    for l in locales:
        alt_url = canonical.replace(f"/{loc}/", f"/{l}/")
        alts.append(f'<link rel="alternate" hreflang="{l}" href="{esc(alt_url)}">')
    xdefault = canonical.replace(f"/{loc}/", f"/{default_locale}/")
    alts.append(f'<link rel="alternate" hreflang="x-default" href="{esc(xdefault)}">')
    page_schema = schema or {
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
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="{esc(site.get("themeColor","#111827"))}">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="{esc(site["seo"]["robots"] if index else "noindex,follow")}">
<link rel="canonical" href="{esc(canonical)}">
{''.join(alts)}
<meta property="og:type" content="website">
<meta property="og:site_name" content="{esc(site["siteName"])}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:locale" content="{esc(loc)}">
<meta property="og:image" content="{esc(base + site["ogImage"])}">
<meta property="og:image:alt" content="{esc(site["siteName"])}">
<meta name="twitter:card" content="{esc(site["seo"]["twitterCard"])}">
<link rel="icon" href="{asset(depth,'og-default.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="{asset(depth,'style.css')}">
<script>window.GQB_I18N={json.dumps(i18n,ensure_ascii=False)};</script>
<script defer src="{asset(depth,'app.js')}"></script>
<script type="application/ld+json">{json.dumps(page_schema,ensure_ascii=False)}</script>
{analytics_tags()}
{extra}
</head>
<body data-locale="{loc}">
<script>if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("{("../"*depth)}sw.js").catch(()=>{}));</script>
{body}
</body>
</html>'''

def card_html(tool, loc):
    name = t(tool["names"], loc)
    desc = f"{name}. {GENERIC[loc]}"
    return f'''<a class="toolcard" data-tool-search="{esc((name + " " + tool["slug"]).lower())}" href="{url(loc, tool["slug"])}">
<div class="icon" aria-hidden="true">{esc(tool["icon"])}</div>
<h3>{esc(name)}</h3>
<p>{esc(desc)}</p>
<span class="use">{esc(i18n[loc]["useTool"])} →</span>
</a>'''

def page_schema(loc, title, desc, canonical):
    return {
      "@context":"https://schema.org",
      "@type":"WebPage",
      "name":title,
      "description":desc,
      "url":canonical,
      "inLanguage":loc,
      "isPartOf":{"@type":"WebSite","name":site["siteName"],"url":base}
    }

# Clean build output first.
if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir(parents=True, exist_ok=True)

# Project-root entry point for https://cymswj.github.io/gqbapp/
root_target = f"{base}/{default_locale}/"
root_html = f'''<!doctype html><html lang="{default_locale}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0;url={esc(root_target)}">
<link rel="canonical" href="{esc(root_target)}">
<title>{esc(site["siteName"])}</title>
</head><body><p>Redirecting to <a href="{esc(root_target)}">{esc(site["siteName"])}</a>…</p>
<script>location.replace({json.dumps(root_target)});</script></body></html>'''
(DIST / "index.html").write_text(root_html, encoding="utf-8")

# Localized home, about and privacy pages.
for loc in locales:
    stitle, sdesc, sh1, sintro, sindex = site_meta(loc)

    grouped = {c["slug"]: [] for c in categories}
    for tool in tools:
        grouped.setdefault(tool["group"], []).append(tool)

    featured_order = [
      "percentage-calculator","age-calculator","currency-converter","unit-converter",
      "password-generator","word-counter","qr-code-generator","image-compressor"
    ]
    featured = [next((x for x in tools if x["slug"] == slug), None) for slug in featured_order]
    featured = [x for x in featured if x]

    body = topnav(loc, 1)
    body += f'''<main class="wrap">
<section class="hero">
<div class="eyebrow">{esc(i18n[loc].get("eyebrow","Online tools"))}</div>
<h1>{esc(sh1)}</h1>
<p class="hero-lead">{esc(sintro)}</p>
<form class="search" onsubmit="return false">
<label class="sr-only" for="toolSearch">{esc(i18n[loc]["search"])}</label>
<input id="toolSearch" autocomplete="off" placeholder="{esc(i18n[loc]["searchPlaceholder"])}" oninput="filterTools(this.value)">
</form>
<div class="stats"><span>{len(tools)} {esc(i18n[loc].get("toolsLabel","tools"))}</span><span>{len(locales)} {esc(i18n[loc].get("languagesLabel","languages"))}</span><span>{esc(i18n[loc]["noSignup"])}</span></div>
</section>

<section id="featuredSection" aria-labelledby="featured-title">
<h2 id="featured-title" class="section-title">{esc(i18n[loc].get("featured","Featured tools"))}</h2>
<div class="grid featured-grid">{''.join(card_html(x,loc) for x in featured)}</div>
</section>

<nav class="category-nav" aria-label="{esc(i18n[loc].get("categories","Categories"))}">
<button type="button" class="category-chip active" data-category="all">{esc(i18n[loc].get("all","All"))}</button>
{''.join(f'<button type="button" class="category-chip" data-category="{esc(c["slug"])}">{esc(t(c["names"],loc))}</button>' for c in categories)}
</nav>

<div id="catalog">
'''
    for c in categories:
        items = grouped.get(c["slug"], [])
        if not items:
            continue
        body += f'''<section class="category-section" data-category-section="{esc(c["slug"])}">
<div class="section-heading"><h2>{esc(t(c["names"],loc))}</h2><span>{len(items)}</span></div>
<div class="grid">{''.join(card_html(x,loc) for x in items)}</div>
</section>
'''
    body += f'''<p id="noResults" class="no-results" hidden>{esc(i18n[loc].get("noResults","No matching tools found."))}</p>
</div></main>'''
    body += footer(loc,"home")
    body += '''<script>
(function(){
 const input=document.getElementById("toolSearch");
 const cards=[...document.querySelectorAll("#catalog [data-tool-search]")];
 const featured=document.getElementById("featuredSection");
 const sections=[...document.querySelectorAll("[data-category-section]")];
 const chips=[...document.querySelectorAll("[data-category]")];
 const none=document.getElementById("noResults");
 function applyCategory(cat){chips.forEach(x=>x.classList.toggle("active",x.dataset.category===cat));
   featured.hidden=cat!=="all";
   sections.forEach(s=>s.hidden=cat!=="all"&&s.dataset.categorySection!==cat);
 }
 function filterTools(q){q=(q||"").trim().toLowerCase();
   let shown=0;
   featured.hidden=!!q;
   cards.forEach(c=>{const ok=!q||c.dataset.toolSearch.includes(q);c.hidden=!ok;if(ok)shown++;});
   sections.forEach(s=>{if(input.value.trim()){s.hidden=[...s.querySelectorAll("[data-tool-search]")].every(c=>c.hidden)}});
   none.hidden=shown!==0;
   if(!q) sections.forEach(s=>s.hidden=false);
 }
 chips.forEach(c=>c.addEventListener("click",()=>{input.value="";applyCategory(c.dataset.category);filterTools("")}));
 input.addEventListener("input",()=>{chips.forEach(x=>x.classList.toggle("active",x.dataset.category==="all"));filterTools(input.value)});
 applyCategory("all");
})();
</script>'''
    schema = {
      "@context":"https://schema.org",
      "@type":"WebSite",
      "name":site["siteName"],
      "url":url(loc),
      "inLanguage":loc,
      "description":sdesc
    }
    out = DIST / loc / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(shell(loc, stitle, sdesc, url(loc), body, 1, index=sindex, schema=schema), encoding="utf-8")

    copy = STATIC_COPY[loc]
    for slug, title_key, h1_key, p_key, p2_key in [
        ("about","about_title","about_h1","about_p","about_p2"),
        ("privacy","privacy_title","privacy_h1","privacy_p","privacy_p2")
    ]:
        canonical = static_url(loc,slug)
        body = topnav(loc,2,"../") + f'''<main class="wrap static-page">
<a class="back" href="{url(loc)}">← {esc(i18n[loc]["back"])}</a>
<h1>{esc(copy[h1_key])}</h1>
<p class="lead">{esc(copy[p_key])}</p>
<section class="content-card"><h2>{esc(copy[title_key])}</h2><p>{esc(copy[p_key])}</p><p>{esc(copy[p2_key])}</p></section>
</main>''' + footer(loc,"static",slug)
        sch = page_schema(loc, copy[title_key], copy[p_key], canonical)
        out = DIST / loc / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(loc, copy[title_key], copy[p_key], canonical, body, 2, index=True, schema=sch), encoding="utf-8")

    # Tool pages.
    for tool in tools:
        title, desc, h1, intro, indexable, keywords = tool_meta(tool, loc)
        canonical = url(loc, tool["slug"])
        name = t(tool["names"], loc)
        breadcrumbs = {
          "@context":"https://schema.org",
          "@type":"BreadcrumbList",
          "itemListElement":[
            {"@type":"ListItem","position":1,"name":site["siteName"],"item":url(loc)},
            {"@type":"ListItem","position":2,"name":t(next(c["names"] for c in categories if c["slug"]==tool["group"]),loc),"item":url(loc)},
            {"@type":"ListItem","position":3,"name":name,"item":canonical}
          ]
        }
        app_schema = {
          "@context":"https://schema.org",
          "@type":"WebApplication",
          "name":name,
          "description":desc,
          "applicationCategory":"UtilitiesApplication",
          "operatingSystem":"Any",
          "url":canonical,
          "isAccessibleForFree":True,
          "inLanguage":loc
        }
        if keywords:
            app_schema["keywords"] = keywords
        extra = '<script type="application/ld+json">'+json.dumps(app_schema,ensure_ascii=False)+'</script>'
        extra += '<script type="application/ld+json">'+json.dumps(breadcrumbs,ensure_ascii=False)+'</script>'

        tool_body = topnav(loc,2)
        category_name = t(next(c["names"] for c in categories if c["slug"]==tool["group"]),loc)
        tool_body += f'''<main class="wrap tool-page">
<nav class="breadcrumbs"><a href="{url(loc)}">{esc(i18n[loc].get("home","Home"))}</a><span>›</span><span>{esc(category_name)}</span></nav>
<a class="back" href="{url(loc)}">← {esc(i18n[loc]["back"])}</a>
<h1>{esc(h1)}</h1>
<p class="lead">{esc(intro)}</p>
<div id="toolApp" aria-live="polite"></div>
<section class="content-card"><h2>{esc(i18n[loc]["about"])}</h2><p>{esc(desc)}</p><p>{esc(i18n[loc].get("privacyNote","Many browser-based tools process input on your device; external-service tools may send requests over the network."))}</p></section>
<section class="faq"><h2>{esc(i18n[loc]["howToUse"])}</h2>
<details open><summary>{esc(i18n[loc].get("step1","Use the fields above"))}</summary><p>{esc(intro)}</p></details>
<details><summary>{esc(i18n[loc]["noSignup"])}</summary><p>{esc(i18n[loc]["privacy"])}</p></details>
</section></main>'''
        tool_body += footer(loc,"tool")
        page = shell(loc,title,desc,canonical,tool_body,2,extra,index=indexable,schema=page_schema(loc,title,desc,canonical))
        page = page.replace(f'<body data-locale="{loc}">', f'<body data-locale="{loc}" data-tool="{esc(tool["impl"])}">')
        out = DIST / loc / "tools" / tool["slug"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page, encoding="utf-8")

# Public assets.
shutil.copy2(PUB / "sw.js", DIST / "sw.js")
(DIST / "public").mkdir(exist_ok=True)
for name in ["style.css","app.js","og-default.svg","favicon.svg","site.webmanifest","sw.js"]:
    src = PUB / name
    if src.exists():
        shutil.copy2(src, DIST / "public" / name)

# SEO admin is intentionally outside the sitemap and marked noindex.
admin_src = ROOT / "admin.html"
if admin_src.exists():
    shutil.copy2(admin_src, DIST / "admin.html")

# Robots.
(DIST / "robots.txt").write_text(
    "User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: " + base + "/sitemap.xml\n",
    encoding="utf-8"
)

# Sitemap: only indexable pages, with accurate localized alternates.
indexable_urls = []
for loc in locales:
    _,_,_,_,home_index = site_meta(loc)
    if home_index:
        indexable_urls.append((url(loc),loc,None))
    indexable_urls.append((static_url(loc,"about"),loc,"about"))
    indexable_urls.append((static_url(loc,"privacy"),loc,"privacy"))
    for tool in tools:
        indexable = tool_meta(tool,loc)[4]
        if indexable:
            indexable_urls.append((url(loc,tool["slug"]),loc,tool["slug"]))

sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
]
for u, loc, slug in indexable_urls:
    sitemap.append("  <url>")
    sitemap.append("    <loc>" + esc(u) + "</loc>")
    if slug is None:
        rel_urls = {l: url(l) for l in locales}
    elif slug in ("about","privacy"):
        rel_urls = {l: static_url(l,slug) for l in locales}
    else:
        rel_urls = {l: url(l,slug) for l in locales}
    for l, alt in rel_urls.items():
        sitemap.append(f'    <xhtml:link rel="alternate" hreflang="{l}" href="{esc(alt)}" />')
    sitemap.append("    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"" + esc(rel_urls[default_locale]) + "\" />")
    sitemap.append("  </url>")
sitemap.append("</urlset>")
(DIST / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")

print("Built", len(indexable_urls), "indexable URLs across", len(locales), "languages and", len(tools), "tools.")
