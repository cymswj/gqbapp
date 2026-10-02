const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("dist/en/index.html", "utf8");
const categories = JSON.parse(fs.readFileSync("src/categories.json", "utf8"));
const categorySlugs = ["all", ...categories.map(x => x.slug)];

function sectionCard(section, slug) {
  return {
    dataset: { toolSlug: slug, toolSearch: slug },
    hidden: false,
    _events: {},
    closest(selector) {
      return selector === "[data-category-section]" ? section : null;
    },
    querySelectorAll() { return []; },
    addEventListener(type, fn) { this._events[type] = fn; },
    cloneNode() { return this; }
  };
}

class Node {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.hidden = false;
    this.classList = {
      _set: new Set(),
      toggle: (name, on) => on ? this.classList._set.add(name) : this.classList._set.delete(name)
    };
    this._events = {};
    this.innerHTML = "";
  }
  addEventListener(type, fn) { this._events[type] = fn; }
  cloneNode() { return this; }
  querySelectorAll() { return []; }
}

const chips = categorySlugs.map(slug => new Node({ category: slug }));
const sections = categories.map(cat => {
  const s = new Node({ categorySection: cat.slug });
  const slugs = [];
  const re = /data-tool-slug="([^"]+)"[^>]*data-tool-search=/g;
  let m;
  const start = html.indexOf('data-category-section="' + cat.slug + '"');
  const end = html.indexOf("</section>", start);
  const block = start >= 0 && end >= 0 ? html.slice(start, end) : "";
  while ((m = re.exec(block))) slugs.push(m[1]);
  const cardsForSection = slugs.map(slug => sectionCard(s, slug));
  s.querySelectorAll = selector => selector === "[data-tool-search]" ? cardsForSection : [];
  return s;
});

const cards = sections.flatMap(s => s.querySelectorAll("[data-tool-search]"));
const input = new Node();
const featured = new Node();
const recentSection = new Node();
recentSection.dataset.hasRecent = "0";
const recentBox = new Node();
const none = new Node();

const document = {
  querySelectorAll(selector) {
    if (selector === "#catalog [data-tool-search]") return cards;
    if (selector === "[data-category-section]") return sections;
    if (selector === "[data-category]") return chips;
    return [];
  },
  getElementById(id) {
    return { toolSearch: input, featuredSection: featured, recentSection, recentTools: recentBox, noResults: none }[id] || null;
  }
};

const ctx = { document, window: {}, localStorage: { getItem() { return null; }, setItem() {} } };
ctx.window = ctx;

const marker = 'const input=document.getElementById("toolSearch");';
const markerPos = html.indexOf(marker);
if (markerPos < 0) throw new Error("Generated catalog navigation marker not found");
const start = html.lastIndexOf("<script>", markerPos);
const end = html.indexOf("</script>", start);
if (start < 0 || end < 0) throw new Error("Generated catalog navigation script is missing or unterminated");

vm.runInNewContext(html.slice(start + 8, end), ctx, { filename: "dist/en/index.html#catalog-navigation" });

if (chips.some(c => typeof c._events.click !== "function")) throw new Error("One or more category chips has no click handler");

const finance = chips.find(c => c.dataset.category === "finance");
if (!finance) throw new Error("Finance category chip missing");
finance._events.click();
const financeSection = sections.find(s => s.dataset.categorySection === "finance");
if (!financeSection || financeSection.hidden) throw new Error("Finance section did not become visible");
if (sections.some(s => s !== financeSection && !s.hidden)) throw new Error("Non-selected category remained visible");
if (!featured.hidden) throw new Error("Featured section should be hidden for a selected category");

const all = chips.find(c => c.dataset.category === "all");
all._events.click();
if (sections.some(s => s.hidden)) throw new Error("All category did not restore every section");
if (featured.hidden) throw new Error("Featured section should be visible for All");

input.value = "loan";
input._events.input();
const loanSection = sections.find(s => s.dataset.categorySection === "finance");
if (!loanSection || loanSection.hidden) throw new Error("Search hid the matching finance section");
if (sections.some(s => s !== loanSection && !s.hidden)) throw new Error("Search left unrelated sections visible");

console.log("Navigation smoke test passed: category click, All reset, and search/category interaction verified.");
