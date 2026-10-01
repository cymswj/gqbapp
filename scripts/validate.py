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
print(f"Validated {len(tools)} tools and {len(impls)} JS branches.")
