const fs = require("fs");
const vm = require("vm");
const { webcrypto } = require("crypto");

const ROOT = process.cwd();
const tools = [
  ...JSON.parse(fs.readFileSync("src/tools.json","utf8")),
  ...JSON.parse(fs.readFileSync("src/tools-extra.json","utf8"))
];
const impls = [...new Set(tools.map(t => t.impl))];
const source = fs.readFileSync("public/app.js","utf8");

class FakeElement {
  constructor(tag="div") {
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
  setAttribute(k,v){ this.attributes[k]=String(v); }
  add(option){ this.options.push(option); }
  appendChild(x){ this.children.push(x); return x; }
  querySelector(selector){ return fakeFor(selector); }
  querySelectorAll(selector){ return fakeMany(selector); }
}

function fakeFor(selector){
  if(selector === "#toolApp") return root;
  if(selector.includes("button")) return new FakeElement("button");
  if(selector.includes("select")) return new FakeElement("select");
  if(selector.includes("textarea")) return new FakeElement("textarea");
  if(selector.includes("input")) return new FakeElement("input");
  return new FakeElement("div");
}
function fakeMany(selector){
  if(selector.includes("button")) return Array.from({length:4},()=>new FakeElement("button"));
  if(selector.includes("select")) return Array.from({length:3},()=>new FakeElement("select"));
  if(selector.includes("textarea")) return [new FakeElement("textarea")];
  if(selector.includes("input")) return Array.from({length:6},()=>new FakeElement("input"));
  return [new FakeElement("div")];
}

const root = new FakeElement("div");
const body = new FakeElement("body");
body.dataset.locale = "en";
const document = {
  body,
  querySelector(selector){ return fakeFor(selector); },
  querySelectorAll(selector){ return fakeMany(selector); },
  createElement(tag){ return new FakeElement(tag); },
  documentElement: new FakeElement("html")
};

const ctx = {
  console,
  document,
  window: null,
  navigator: { clipboard: { writeText(){ return Promise.resolve(); } } },
  crypto: webcrypto,
  Intl,
  URL,
  Blob,
  FileReader: class {},
  Option: class { constructor(text,value){ this.text=text; this.value=value; } },
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

const failures = [];
for (const impl of impls) {
  body.dataset.tool = impl;
  root.innerHTML = "";
  try {
    vm.runInNewContext(source, ctx, { filename: "public/app.js" });
  } catch (err) {
    failures.push({ impl, message: String(err && err.stack || err) });
  }
}
if (failures.length) {
  for (const f of failures) {
    console.error("\n[" + f.impl + "]\n" + f.message);
  }
  process.exit(1);
}
console.log("Runtime initialization smoke test passed: " + impls.length + " unique implementations / " + tools.length + " catalog tools.");
