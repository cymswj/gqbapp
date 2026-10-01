import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "src"
tools = json.loads((src / "tools.json").read_text(encoding="utf-8")) + json.loads((src / "tools-extra.json").read_text(encoding="utf-8"))
slugs = [t["slug"] for t in tools]
if len(slugs) != len(set(slugs)):
    raise SystemExit("Duplicate tool slug found")
supported_locales = json.loads((src / "site-config.json").read_text(encoding="utf-8")).get("supportedLocales", [])
categories = json.loads((src / "categories.json").read_text(encoding="utf-8"))
category_slugs = {c["slug"] for c in categories}
missing_names = [f"{t['slug']}:{loc}" for t in tools for loc in supported_locales if not t.get("names", {}).get(loc)]
if missing_names:
    raise SystemExit("Missing localized tool names: " + ", ".join(missing_names[:30]))
invalid_groups = [f"{t['slug']}:{t.get('group')}" for t in tools if t.get("group") not in category_slugs]
if invalid_groups:
    raise SystemExit("Invalid tool categories: " + ", ".join(invalid_groups[:30]))
impls = set(re.findall(r"tool==='([^']+)'", (ROOT / "public" / "app.js").read_text(encoding="utf-8")))
missing = sorted({t["impl"] for t in tools} - impls)
if missing:
    raise SystemExit("Missing tool implementations: " + ", ".join(missing))
seo = json.loads((src / "seo-overrides.json").read_text(encoding="utf-8"))
if not isinstance(seo.get("pages", {}), dict):
    raise SystemExit("Invalid SEO page overrides")
known_slugs = set(slugs)
invalid_seo_keys = [k for k in seo.get("pages", {}) if ":" not in k or k.split(":",1)[0] not in supported_locales or k.split(":",1)[1] not in known_slugs]
if invalid_seo_keys:
    raise SystemExit("Invalid SEO override keys: " + ", ".join(invalid_seo_keys[:30]))
app = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
collection_method_re = re.compile(r"\$\([^)]*\)\.(?:forEach|map|filter|some|every|reduce|join)\(")
for m in collection_method_re.finditer(app):
    if m.start() == 0 or app[m.start()-1] != "$":
        raise SystemExit("Single-element selector used with collection method; use $()")
if re.search(r"\b(?:Function|eval)\s*\(", app):
    raise SystemExit("Unsafe dynamic expression evaluation found")
tool_content_path = src / "tool-content.json"
if tool_content_path.exists():
    tool_content = json.loads(tool_content_path.read_text(encoding="utf-8"))
    supported_locales = json.loads((src / "site-config.json").read_text(encoding="utf-8")).get("supportedLocales", [])
    unsupported_content_locales = set()
    for slug, localized in tool_content.items():
        unsupported_content_locales.update(set(localized) - set(supported_locales))
    if unsupported_content_locales:
        raise SystemExit("Unsupported tool-content locales: " + ", ".join(sorted(unsupported_content_locales)))
    invalid_content_slugs = [slug for slug in tool_content if slug not in known_slugs]
    if invalid_content_slugs:
        raise SystemExit("Invalid tool-content slugs: " + ", ".join(invalid_content_slugs[:30]))
    bmi = tool_content.get("bmi-calculator", {})
    if "en" not in bmi or "zh" not in bmi:
        raise SystemExit("BMI tool content must include en and zh")
print(f"Validated {len(tools)} tools and {len(impls)} JS branches plus runtime safety and content checks.")

password_pos = app.find("else if(tool==='password')")
random_pos = app.find("else if(tool==='random')")
text_pos = app.find("else if(tool==='text'||tool==='characters')")
if password_pos >= 0 and random_pos > password_pos and "Math.random" in app[password_pos:random_pos]:
    raise SystemExit("Password generator must use cryptographic randomness")
if random_pos >= 0 and text_pos > random_pos and "Math.random" in app[random_pos:text_pos]:
    raise SystemExit("Random number generator must not use Math.random")

if "Math.random" in app:
    raise SystemExit("Math.random is forbidden in runtime code; use crypto.getRandomValues")

cdn_re = re.compile(r"https://cdn\.jsdelivr\.net/npm/[^'"]+")
for url in cdn_re.findall(app):
    package_part = url.split("/npm/", 1)[1].split("/", 1)[0]
    if "@" not in package_part:
        raise SystemExit("Unpinned CDN dependency: " + url)
for forbidden in ["$('button',r)[", "$('select',r)[", "$('input',r)["]:
    if forbidden in app:
        raise SystemExit("Single-element selector indexed as a collection: " + forbidden)
