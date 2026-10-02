const fs = require("fs");
const vm = require("vm");
const { webcrypto } = require("crypto");

const tools = [
  ...JSON.parse(fs.readFileSync("src/tools.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/tools-extra.json", "utf8"))
];
const impls = [...new Set(tools.map(t => t.impl))];
const coreSource = fs.readFileSync("public/gqb-core.js", "utf8");
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
    this._innerHTML = "";
    this.textContent = "";
    this.checked = false;
    this.files = [];
    this.options = [];
    this.selectedIndex = 0;
    this.generatedButtons = [];
    this.toolbox = null;
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value ?? "");
    this.generatedButtons = Array.from({length:(this._innerHTML.match(/<button\b/g)||[]).length}, () => {
      const b = new FakeElement("button");
      b.onclick = null;
      return b;
    });
    const marker = '<div class="toolbox">';
    const start = this._innerHTML.indexOf(marker);
    if (start >= 0) {
      const box = new FakeElement("div");
      box.innerHTML = this._innerHTML.slice(start + marker.length);
      this.toolbox = box;
    } else {
      this.toolbox = null;
    }
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
  querySelector(selector) {
    if (selector.includes("button") && this.generatedButtons.length) return this.generatedButtons[0];
    if (selector === ".toolbox" && this.toolbox) return this.toolbox;
    return fakeFor(selector);
  }
  querySelectorAll(selector) {
    if (selector.includes("button")) return this.generatedButtons;
    return fakeMany(selector);
  }
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
    root.toolbox = null;
    root.innerHTML = "";
    vm.runInNewContext(coreSource, ctx, { filename: "public/gqb-core.js" });
    vm.runInNewContext(source, ctx, { filename: "public/app.js" });
    const buttons = root.toolbox?.generatedButtons || [];
    const unbound = buttons.filter(b => typeof b.onclick !== "function").length;
    if (unbound) failures.push({impl, message:"Generated button(s) without onclick handler: " + unbound + "/" + buttons.length});
  } catch (err) {
    failures.push({
      impl,
      message: (err instanceof Error ? (err.message || err.name) : String(err)).slice(0, 500)
    });
  }
}

const core = ctx.window.GQB_CORE;
if (!core) failures.push({impl:"helpers", message:"GQB core was not initialized"});
else {
  if (core.calcPercentage(500,18) !== 90) failures.push({impl:"core", message:"Core percentage assertion failed"});
  if (!core.calcBmi(72,168,"china") || Math.abs(core.calcBmi(72,168,"china").bmi-25.5102) >= 0.001) failures.push({impl:"core", message:"Core BMI assertion failed"});
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

  assert("percentage", api.calcPercentage(500,18) === 90);
  assert("age parts", JSON.stringify(api.calcAgeParts(new Date("1990-05-10T00:00:00"), new Date("2026-10-02T00:00:00"))) === JSON.stringify({years:36,months:4,days:22}));
  const bmi = api.calcBmi(72,168,"china"); assert("BMI value", Math.abs(bmi.bmi-25.5102)<0.001); assert("BMI category", bmi.category==="overweight");
  const loan = api.calcLoan(100000,3.5,20); assert("Loan payment", Math.abs(loan.payment-579.96)<0.1);
  const vatAdd = api.calcVat(100,20,"add"), vatRemove = api.calcVat(120,20,"remove"); assert("VAT add", vatAdd.gross===120); assert("VAT extract", Math.abs(vatRemove.net-100)<1e-9);
  const pct = api.calcPercentageChange(100,120); assert("percentage change", pct.change===20);
  assert("ROI", api.calcRoi(1000,1300)===30);
  assert("Markup", Math.abs(api.calcMarkup(60,100).markup-66.6666667)<1e-6);
  assert("Margin", api.calcMargin(60,100).margin===40);
  assert("Break even", api.calcBreakEven(5000,100,40).units===84);

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
