import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
PUB = ROOT / "public"

tools = json.loads((SRC / "tools.json").read_text(encoding="utf-8")) + json.loads((SRC / "tools-extra.json").read_text(encoding="utf-8"))
locales = json.loads((SRC / "site-config.json").read_text(encoding="utf-8")).get("supportedLocales", [])
categories = {x["slug"] for x in json.loads((SRC / "categories.json").read_text(encoding="utf-8"))}
app = (PUB / "app.js").read_text(encoding="utf-8")
content = json.loads((SRC / "tool-content.json").read_text(encoding="utf-8")) if (SRC / "tool-content.json").exists() else {}
seo = json.loads((SRC / "seo-overrides.json").read_text(encoding="utf-8"))

slugs = [x["slug"] for x in tools]
impls = {x["impl"] for x in tools}
runtime_impls = set(re.findall(r"tool==='([^']+)'", app))
policy = json.loads((SRC / "runtime-policy.json").read_text(encoding="utf-8"))
policy_keys = set(k for k in policy.keys() if k != "version")
policy_coverage_gaps = sorted(impls - policy_keys)
policy_extras = sorted(policy_keys - impls)
content_keys = set(content.keys())
content_unknown_tools = sorted(content_keys - set(slugs))
content_locale_gaps = sorted(f"{slug}:{loc}" for slug, localized in content.items() for loc in localized if loc not in locales)
content_bad_shapes = []
for slug, localized in content.items():
    if not isinstance(localized, dict):
        content_bad_shapes.append(f"{slug}:not-dict")
        continue
    for loc, data in localized.items():
        if not isinstance(data, dict):
            content_bad_shapes.append(f"{slug}:{loc}:not-dict")
            continue
        if "guide" in data and not isinstance(data["guide"], list):
            content_bad_shapes.append(f"{slug}:{loc}:guide")
        if "sources" in data and not isinstance(data["sources"], list):
            content_bad_shapes.append(f"{slug}:{loc}:sources")


print("GQB Tools structural audit")
print(f"tools={len(tools)} unique_slugs={len(set(slugs))} declared_impls={len(impls)} runtime_branches={len(runtime_impls)}")
print("groups=" + ", ".join(f"{g}:{sum(1 for x in tools if x['group']==g)}" for g in sorted(categories)))

missing_names = [(x["slug"], loc) for x in tools for loc in locales if not x.get("names", {}).get(loc)]
missing_impls = sorted(impls - runtime_impls)
invalid_groups = sorted(x["slug"] for x in tools if x.get("group") not in categories)
bad_seo = sorted(k for k in seo.get("pages", {}) if ":" not in k or k.split(":",1)[0] not in locales or k.split(":",1)[1] not in set(slugs))

print(f"localized_name_gaps={len(missing_names)} implementation_gaps={len(missing_impls)} invalid_groups={len(invalid_groups)} invalid_seo_keys={len(bad_seo)}")
print(f"deep_content_tools={len(content)} ({len(content)}/{len(tools)} = {len(content)/len(tools)*100:.1f}%)")
print(f"runtime_policy_gaps={len(policy_coverage_gaps)} runtime_policy_extras={len(policy_extras)} content_unknown_tools={len(content_unknown_tools)} content_locale_gaps={len(content_locale_gaps)} content_shape_errors={len(content_bad_shapes)}")

unsafe_selectors = re.findall(r"(?<!\$)\$\([^)]*\)\.(?:forEach|map|filter|some|every|reduce|join)\(", app)
dynamic_code = re.findall(r"\b(?:Function|eval)\s*\(", app)
math_random = "Math.random" in app
duplicate_functions = sorted({n for n in re.findall(r"\bfunction\s+([A-Za-z_$][\w$]*)\s*\(", app) if re.findall(r"\bfunction\s+" + re.escape(n) + r"\s*\(", app).count(n) > 1})
cdn_urls = sorted(set(re.findall(r"https://cdn\.jsdelivr\.net/npm/[^'\"]+", app)))
unpinned = [u for u in cdn_urls if "/npm/" in u and "@" not in u.split("/npm/", 1)[1].split("/", 1)[0]]

print(f"unsafe_collection_selectors={len(unsafe_selectors)} dynamic_code_calls={len(dynamic_code)} math_random={math_random} duplicate_named_functions={len(duplicate_functions)}")
print(f"cdn_dependencies={len(cdn_urls)} unpinned_cdn={len(unpinned)}")
print("workflow_quality_gate_files=" + ", ".join(str(p.relative_to(ROOT)) for p in [
    ROOT / ".github" / "workflows" / "pages.yml",
    ROOT / "scripts" / "validate.py",
    ROOT / "scripts" / "runtime-smoke.js",
    ROOT / "scripts" / "linkcheck.py",
] if p.exists()))

if missing_names or missing_impls or invalid_groups or bad_seo or unsafe_selectors or dynamic_code or math_random or duplicate_functions or unpinned or policy_coverage_gaps or policy_extras or content_unknown_tools or content_locale_gaps or content_bad_shapes:
    print("RESULT=FAIL")
    raise SystemExit(1)

print("RESULT=PASS")
