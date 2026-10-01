import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "src"
tools = json.loads((src / "tools.json").read_text(encoding="utf-8")) + json.loads((src / "tools-extra.json").read_text(encoding="utf-8"))
slugs = [t["slug"] for t in tools]
if len(slugs) != len(set(slugs)):
    raise SystemExit("Duplicate tool slug found")
impls = set(re.findall(r"tool==='([^']+)'", (ROOT / "public" / "app.js").read_text(encoding="utf-8")))
missing = sorted({t["impl"] for t in tools} - impls)
if missing:
    raise SystemExit("Missing tool implementations: " + ", ".join(missing))
seo = json.loads((src / "seo-overrides.json").read_text(encoding="utf-8"))
if not isinstance(seo.get("pages", {}), dict):
    raise SystemExit("Invalid SEO page overrides")
app = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
if re.search(r"(?<!\$)\$\([^)]*\)\.(?:forEach|map|filter|some|every|reduce|join)\(", app):
    raise SystemExit("Single-element selector used with collection method; use $()")
if "Function('return '" in app or "eval(" in app:
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
    bmi = tool_content.get("bmi-calculator", {})
    if "en" not in bmi or "zh" not in bmi:
        raise SystemExit("BMI tool content must include en and zh")
print(f"Validated {len(tools)} tools and {len(impls)} JS branches plus runtime safety and content checks.")
