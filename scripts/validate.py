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
runtime_policy = json.loads((src / "runtime-policy.json").read_text(encoding="utf-8")) if (src / "runtime-policy.json").exists() else {}
tool_contract_path = src / "tool-contracts.json"
if not tool_contract_path.exists():
    raise SystemExit("Missing src/tool-contracts.json")
tool_contracts = json.loads(tool_contract_path.read_text(encoding="utf-8"))
definitions = tool_contracts.get("definitions", {})
missing_contracts = sorted(set(t["impl"] for t in tools) - set(definitions))
extra_contracts = sorted(set(definitions) - set(t["impl"] for t in tools))
if missing_contracts or extra_contracts:
    raise SystemExit("Tool contract mismatch; missing=" + ",".join(missing_contracts) + " extra=" + ",".join(extra_contracts))
if not isinstance(seo.get("pages", {}), dict):
    raise SystemExit("Invalid SEO page overrides")
known_slugs = set(slugs)
declared_policy = set(runtime_policy) - {"version"}
missing_policy = sorted({t["impl"] for t in tools} - declared_policy)
extra_policy = sorted(declared_policy - {t["impl"] for t in tools})
if missing_policy or extra_policy:
    raise SystemExit("Runtime policy mismatch; missing=" + ",".join(missing_policy) + " extra=" + ",".join(extra_policy))
invalid_seo_keys = [k for k in seo.get("pages", {}) if ":" not in k or k.split(":",1)[0] not in supported_locales or k.split(":",1)[1] not in known_slugs]
if invalid_seo_keys:
    raise SystemExit("Invalid SEO override keys: " + ", ".join(invalid_seo_keys[:30]))
core_path = ROOT / "public" / "gqb-core.js"
if not core_path.exists():
    raise SystemExit("Missing public/gqb-core.js")
core = core_path.read_text(encoding="utf-8")
if "window.GQB_CORE" not in core:
    raise SystemExit("GQB core registry is missing")
workflows_path = src / "workflows.json"
workflow_schema_path = src / "workflows.schema.json"
contract_schema_path = src / "tool-contract.schema.json"
for required_path in [workflows_path, workflow_schema_path, contract_schema_path]:
    if not required_path.exists():
        raise SystemExit("Missing architecture file: " + str(required_path.relative_to(ROOT)))
workflows = json.loads(workflows_path.read_text(encoding="utf-8"))
workflow_ids = [w.get("id") for w in workflows.get("workflows", [])]
if len(workflow_ids) != len(set(workflow_ids)):
    raise SystemExit("Duplicate workflow id found")
known_workflow_tools = set(slugs)
invalid_workflow_tools = [step.get("tool") for w in workflows.get("workflows", []) for step in w.get("steps", []) if step.get("tool") not in known_workflow_tools]
if invalid_workflow_tools:
    raise SystemExit("Workflow references unknown tools: " + ", ".join(sorted(set(invalid_workflow_tools))))
app = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
function_names = re.findall(r"\bfunction\s+([A-Za-z_$][\w$]*)\s*\(", app)
duplicate_function_names = sorted({name for name in function_names if function_names.count(name) > 1})
if duplicate_function_names:
    raise SystemExit("Duplicate function definitions: " + ", ".join(duplicate_function_names))
unsafe_collection = re.findall(r"(?<!\$)\$\([^)]*\)\.(?:forEach|map|filter|some|every|reduce|join)\(", app)
if unsafe_collection:
    raise SystemExit("Single-element selector used with collection method: " + unsafe_collection[0])
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

cdn_re = re.compile(r'''https://cdn\.jsdelivr\.net/npm/[^'"]+''')
for url in cdn_re.findall(app):
    package_part = url.split("/npm/", 1)[1].split("/", 1)[0]
    if "@" not in package_part:
        raise SystemExit("Unpinned CDN dependency: " + url)
if re.search(r"(?<!\$)\$\('(button|select|input)',r\)\[", app):
    raise SystemExit("Single-element selector indexed as a collection")
if "$" * 3 + "(" in app:
    raise SystemExit("Invalid triple-dollar selector syntax")

build_source = (ROOT / "scripts" / "build.py").read_text(encoding="utf-8")
inline_public_handlers = re.findall(r"\s+on(?:click|change|input|submit)=['\"]", build_source)
if inline_public_handlers:
    raise SystemExit("Public page builder still contains inline event handlers")
