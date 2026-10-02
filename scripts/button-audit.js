const fs = require("fs");

const source = fs.readFileSync("public/app.js", "utf8");
const catalog = [
  ...JSON.parse(fs.readFileSync("src/tools.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/tools-extra.json", "utf8"))
];

const branchStarts = [];
const startRe = /(?:^|else )if\(tool===/g;
let match;
while ((match = startRe.exec(source))) {
  branchStarts.push(match.index + (match[0].startsWith("else ") ? 5 : 0));
}

const branches = new Map();
for (let i = 0; i < branchStarts.length; i++) {
  const start = branchStarts[i];
  const end = i + 1 < branchStarts.length ? branchStarts[i + 1] : source.length;
  const branch = source.slice(start, end);
  const headerEnd = branch.indexOf("){");
  if (headerEnd < 0) continue;
  const header = branch.slice(0, headerEnd + 2);
  const impls = [...header.matchAll(/tool===['"]([^'"]+)['"]/g)].map(x => x[1]);
  impls.forEach(impl => branches.set(impl, branch));
}

const missing = [];
const noButton = [];
const unbound = [];

for (const tool of catalog) {
  const branch = branches.get(tool.impl);
  if (!branch) {
    missing.push(tool.impl);
    continue;
  }

  const buttonCount =
    (branch.match(/\bbutton\(/g) || []).length +
    (branch.match(/<button\b/g) || []).length;

  if (!buttonCount) {
    noButton.push(tool.impl);
    continue;
  }

  const hasButtonSelector =
    /\$\(\s*['"]button(?:['".,)]|\s)/.test(branch) ||
    /\$\$\(\s*['"]button['"]/.test(branch);

  const hasClickBinding =
    /\.onclick\s*=/.test(branch) ||
    /addEventListener\(\s*['"]click['"]/.test(branch);

  if (!hasButtonSelector || !hasClickBinding) {
    unbound.push(tool.impl);
  }
}

if (missing.length) throw new Error("Tool implementations missing from app.js: " + missing.join(", "));
if (unbound.length) throw new Error("Button-bearing implementations without a detectable button click binding: " + unbound.join(", "));

console.log(
  "Button audit passed: " +
  catalog.length +
  " catalog tools checked; " +
  new Set(noButton).size +
  " implementations intentionally have no button UI; " +
  (catalog.length - new Set(noButton).size) +
  " button-bearing implementations have click wiring."
);
