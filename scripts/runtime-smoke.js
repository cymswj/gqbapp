const fs = require("fs");
const vm = require("vm");
const { webcrypto } = require("crypto");

const tools = [
  ...JSON.parse(fs.readFileSync("src/tools.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/tools-extra.json", "utf8"))
];
const impls = [...new Set(tools.map(t => t.impl))];
const source = fs.readFileSync("public/app.js", "utf8");

class FakeElement {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.classList = { add(){}, remove(){}, toggle(){} };
    this.style = {};
    this.attributes = {};
    this.value = "";
    this.innerHTML = "";
    this.textContent = "";
    this.checked = false;
    this.files = [];
    this.options = [];
    this.selectedIndex = 0;
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  add(option) { this.options.push(option); }
  appendChild(x) { this.children.push(x); return x; }
  addEventListener() {}
  getBoundingClientRect() { return {left:0, top:0, width:100, height:100}; }
  getContext() {
    return {
      fillStyle: "",
      fillRect(){},
      drawImage(){},
      getImageData(){ return {data:[0,0,0,255]}; }
    };
  }
  querySelector(selector) { return fakeFor(selector); }
  querySelectorAll(selector) { return fakeMany(selector); }
}

function fakeFor(selector) {
  if (selector === "#toolApp") return root;
  if (selector.includes("button")) return new FakeElement("button");
  if (selector.includes("unit-dim")) { const e = new FakeElement("select"); e.value = "length"; return e; }
  if (selector.includes("unit-from")) { const e = new FakeElement("select"); e.value = "m"; return e; }
  if (selector.includes("unit-to")) { const e = new FakeElement("select"); e.value = "km"; return e; }
  if (selector.includes("select")) return new FakeElement("select");
  if (selector.includes("canvas")) return new FakeElement("canvas");
  if (selector.includes("textarea")) return new FakeElement("textarea");
  if (selector.includes("input[type=file]")) { const e = new FakeElement("input"); e.files = []; return e; }
  if (selector.includes("input")) return new FakeElement("input");
  return new FakeElement("div");
}

function fakeMany(selector) {
  if (selector.includes("button")) return Array.from({length:4}, () => new FakeElement("button"));
  if (selector.includes("select")) return Array.from({length:3}, () => new FakeElement("select"));
  if (selector.includes("textarea")) return [new FakeElement("textarea")];
  if (selector.includes("input")) return Array.from({length:6}, () => new FakeElement("input"));
  return [new FakeElement("div")];
}

const root = new FakeElement("div");
const body = new FakeElement("body");
body.dataset.locale = "en";
const document = {
  body,
  querySelector(selector) { return fakeFor(selector); },
  querySelectorAll(selector) { return fakeMany(selector); },
  createElement(tag) { return new FakeElement(tag); },
  documentElement: new FakeElement("html")
};

const ctx = {
  console,
  document,
  window: null,
  navigator: { clipboard: { writeText(){ return Promise.resolve(); } } },
  crypto: webcrypto,
  Intl,
  TextEncoder,
  TextDecoder,
  btoa,
  atob,
  URL,
  Blob,
  FileReader: class {},
  Option: class { constructor(text, value) { this.text = text; this.value = value; } },
  setInterval(){ return 0; },
  clearInterval(){},
  setTimeout,
  clearTimeout,
  Promise,
  Math,
  Date,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  TypeError
};
ctx.window = ctx;
ctx.window.GQB_I18N = { en: { labels:{} } };
ctx.window.GQB_TOOL_COPY = {};
ctx.window.__GQB_TEST__ = true;

const failures = [];
for (const impl of impls) {
  body.dataset.tool = impl;
  root.innerHTML = "";
  try {
    vm.runInNewContext(source, ctx, { filename: "public/app.js" });
  } catch (err) {
    failures.push({
      impl,
      message: (err instanceof Error ? (err.message || err.name) : String(err)).slice(0, 500)
    });
  }
}

const api = ctx.window.GQB_TEST;
if (!api) failures.push({impl:"helpers", message:"Test helpers were not exposed"});
else {
  const assert = (name, condition) => {
    if (!condition) failures.push({impl:"helpers", message:"Assertion failed: " + name});
  };
  const checkThrows = (name, fn) => {
    try { fn(); failures.push({impl:"helpers", message:"Expected rejection: " + name}); }
    catch {}
  };

  assert("safeCalc arithmetic", api.safeCalc("2+3*4") === 14);
  assert("safeCalc functions", Math.abs(api.safeCalc("sqrt(9)+sin(0)") - 3) < 1e-12);
  checkThrows("safeCalc rejects code syntax", () => api.safeCalc("2+(()=>location.href)()"));

  assert(
    "CSV quoted fields",
    JSON.stringify(api.parseCSV('name,note\nAlice,"hello, world"')) ===
      JSON.stringify([["name","note"],["Alice","hello, world"]])
  );
  assert(
    "CSV quoted newline",
    JSON.stringify(api.parseCSV('name,note\nAlice,"line1\nline2"')) ===
      JSON.stringify([["name","note"],["Alice","line1\nline2"]])
  );

  assert(
    "page range",
    JSON.stringify(api.parsePageSpec("1,3-4", 5, 200, false)) ===
      JSON.stringify([0,2,3])
  );
  checkThrows("page range out of bounds", () => api.parsePageSpec("1-6", 5, 200, false));
  assert(
    "page reorder reverse",
    JSON.stringify(api.parsePageSpec("3-1", 3, 200, true)) ===
      JSON.stringify([2,1,0])
  );

  const encoded = api.b64Encode("你好 • GQB");
  assert("UTF-8 Base64", api.b64Decode(encoded) === "你好 • GQB");
  assert("file size gate", api.fileOK({size:1024},2048) === true && api.fileOK({size:4096},2048) === false);
  assert("combined file size gate", api.filesOK([{size:1024},{size:2048}],4096) === true && api.filesOK([{size:3000},{size:2000}],4096) === false);
}

if (failures.length) {
  for (const f of failures) console.error("[smoke:" + f.impl + "] " + f.message);
  process.exit(1);
}

console.log("Runtime smoke test passed: " + impls.length + " unique implementations / " + tools.length + " catalog tools + core helper assertions.");
