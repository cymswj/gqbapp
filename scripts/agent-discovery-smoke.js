const fs=require("fs");
const path=require("path");

const manifest=JSON.parse(fs.readFileSync(path.join("dist","api","agent.json"),"utf8"));
const required=["schemaVersion","name","role","status","modelAgnostic","registries","interfaces","executionModel","safety"];
for(const key of required)if(!(key in manifest))throw new Error("Agent manifest missing: "+key);
if(manifest.role!=="digital-task-infrastructure")throw new Error("Unexpected agent role");
if(manifest.status!=="discovery-only")throw new Error("Agent execution status must remain discovery-only until remote execution is real");
if(manifest.modelAgnostic!==true)throw new Error("Agent manifest must be model agnostic");
for(const key of ["tools","tasks","workflows"]){
  if(!/^https:\/\//.test(manifest.registries[key]))throw new Error("Invalid registry URL: "+key);
}
if(manifest.safety.optionalWorkflowSteps!=="explicit-selection-required")throw new Error("Optional workflow safety policy missing");
console.log("Agent discovery smoke test passed: manifest, registries, execution status and safety policy verified.");
