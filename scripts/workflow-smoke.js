const fs = require("fs");

const catalog = [
  ...JSON.parse(fs.readFileSync("src/tools.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/tools-extra.json", "utf8"))
];
const knownTools = new Set(catalog.map(x => x.slug));
const workflows = JSON.parse(fs.readFileSync("src/workflows.json", "utf8")).workflows || [];

for (const wf of workflows) {
  const ids = new Set((wf.steps || []).map(s => s.id));
  for (const step of wf.steps || []) {
    if (!knownTools.has(step.tool)) throw new Error(wf.id + ": unknown tool " + step.tool);
    for (const dep of step.dependsOn || []) if (!ids.has(dep)) throw new Error(wf.id + ": unknown dependency " + dep);
  }
  for (const edge of wf.edges || []) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) throw new Error(wf.id + ": edge references unknown step");
  }

  const indegree = new Map([...ids].map(id => [id, 0]));
  const next = new Map([...ids].map(id => [id, []]));
  for (const edge of wf.edges || []) {
    next.get(edge.from).push(edge.to);
    indegree.set(edge.to, indegree.get(edge.to) + 1);
  }
  const queue = [...indegree].filter(([,d]) => d === 0).map(([id]) => id);
  let visited = 0;
  while (queue.length) {
    const id = queue.shift();
    visited++;
    for (const to of next.get(id)) {
      indegree.set(to, indegree.get(to) - 1);
      if (indegree.get(to) === 0) queue.push(to);
    }
  }
  if (visited !== ids.size) throw new Error(wf.id + ": workflow graph contains a cycle");
}

console.log("Workflow smoke test passed: " + workflows.length + " workflow DAGs validated.");
