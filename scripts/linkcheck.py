import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SRC = ROOT / 'src'
if not DIST.exists(): raise SystemExit('dist does not exist; run build first')
site = json.loads((SRC / 'site-config.json').read_text(encoding='utf-8'))
tools = json.loads((SRC / 'tools.json').read_text(encoding='utf-8')) + json.loads((SRC / 'tools-extra.json').read_text(encoding='utf-8'))
categories = json.loads((SRC / 'categories.json').read_text(encoding='utf-8'))
locales = site['supportedLocales']
host = urlparse(site['baseUrl']).netloc
html_files = list(DIST.rglob('*.html'))
expected = 1 + len(locales) * (3 + len(categories) + len(tools))
if len(html_files) != expected: raise SystemExit(f'Unexpected HTML page count: {len(html_files)} != {expected}')

def resolve(ref, current):
    if not ref or ref.startswith('#') or ref.startswith(('data:','mailto:','tel:','javascript:')): return None
    p = urlparse(ref)
    if p.scheme or p.netloc:
        if p.netloc and p.netloc != host: return None
        if p.scheme and p.scheme not in ('http','https'): return None
        path = p.path or '/'
    else:
        path = urlparse(urljoin('https://' + host + '/' + current.as_posix(), ref)).path
    path = unquote(path.lstrip('/'))
    target = DIST / (path or 'index.html')
    if path.endswith('/') or target.is_dir(): target = target / 'index.html'
    return target

attrs = re.compile(r'(?:href|src)=["\']([^"\']+)["\']', re.I)
broken, checked = [], 0
for page in html_files:
    rel = page.relative_to(DIST)
    text = page.read_text(encoding='utf-8', errors='replace')
    for ref in attrs.findall(text):
        target = resolve(ref, rel)
        if target is None: continue
        checked += 1
        if not target.exists(): broken.append(f'{rel}: {ref}')

for loc in locales:
    for p in [Path(loc)/'index.html', Path(loc)/'about'/'index.html', Path(loc)/'privacy'/'index.html']:
        if not (DIST/p).exists(): broken.append(f'missing page: {p}')
    for cat in categories:
        p = Path(loc)/'category'/cat['slug']/'index.html'
        if not (DIST/p).exists(): broken.append(f'missing category: {p}')
    for tool in tools:
        p = Path(loc)/'tools'/tool['slug']/'index.html'
        if not (DIST/p).exists(): broken.append(f'missing tool: {p}')

manifest = DIST / 'public' / 'site.webmanifest'
if manifest.exists():
    m = json.loads(manifest.read_text(encoding='utf-8'))
    for icon in m.get('icons', []):
        target = resolve(icon.get('src',''), Path('public')/'site.webmanifest')
        if target and not target.exists(): broken.append('manifest icon: ' + icon.get('src',''))

for name in ['robots.txt','sitemap.xml']:
    if not (DIST/name).exists(): broken.append('missing ' + name)

if broken:
    print('\n'.join(broken[:100]))
    raise SystemExit(f'Found {len(broken)} broken internal references or required pages')
print(f'Link check passed: {len(html_files)} HTML pages, {checked} internal references, {len(locales)} locales, {len(tools)} tools.')