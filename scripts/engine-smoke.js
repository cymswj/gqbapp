const vm=require("vm");
const fs=require("fs");
const src=fs.readFileSync("public/gqb-engine.js","utf8");
const ctx={window:null,Promise,Map,Set,Date};
ctx.window=ctx;ctx.__GQB_TEST__=true;
vm.runInNewContext(src,ctx,{filename:"public/gqb-engine.js"});
const E=ctx.GQB_ENGINE_TEST;
if(!E)throw new Error("engine test API missing");

(async()=>{
  const tasks=[{id:"sum",name:"Calculate a sum",keywords:["sum","add"],tools:["sum-tool"]}];
  const workflows=[
    {id:"demo",version:"2",steps:[
      {id:"a",tool:"sum-tool",purpose:"first",dependsOn:[],outputKey:"a",inputStrategy:"primary-input"},
      {id:"b",tool:"double-tool",purpose:"second",dependsOn:["a"],outputKey:"b",inputStrategy:"previous-output"}
    ],edges:[{from:"a",to:"b"}]},
    {id:"optional-demo",version:"2",steps:[
      {id:"a",tool:"sum-tool",purpose:"first",dependsOn:[],outputKey:"a"},
      {id:"b",tool:"double-tool",purpose:"optional second",optional:true,dependsOn:["a"],outputKey:"b"}
    ],edges:[{from:"a",to:"b"}]}
  ];

  const plan=E.plan("sum",{tasks,workflows});
  if(plan.status!=="planned"||plan.steps.length!==1)throw new Error("single-tool plan failed");

  const optionalTask={id:"optional",name:"Optional flow",keywords:["optional"],tools:["sum-tool"],workflow:"optional-demo"};
  const needsSelection=E.plan("optional",{tasks:[optionalTask],workflows});
  if(needsSelection.status!=="needs-selection"||!needsSelection.requiresSelection||needsSelection.selectableSteps.length!==1)throw new Error("optional workflow must require explicit selection");

  const selected=E.plan("optional",{tasks:[optionalTask],workflows,selectedStepIds:["b"]});
  if(selected.status!=="planned"||selected.steps.length!==2)throw new Error("selected workflow plan failed");

  const wfPlan={status:"planned",query:"demo",task:{id:"demo"},workflow:workflows[0],steps:workflows[0].steps};
  const states=[];
  const state=await E.execute(wfPlan,{input:3,adapters:{
    "sum-tool":({input})=>({output:input+1,verify:x=>x===4}),
    "double-tool":({input})=>({output:input*2,verify:x=>x===8})
  },hooks:{onState:s=>states.push(s)}});
  if(state.status!=="completed")throw new Error("execution did not complete");
  if(state.results.length!==2||state.results[1].output!==8)throw new Error("workflow result propagation failed");
  if(!states.includes("validating")||!states.includes("verifying")||!states.includes("completed"))throw new Error("state machine incomplete");

  try{
    await E.execute({...wfPlan,workflow:workflows[1]},{adapters:{}});
    throw new Error("optional workflow without selection should fail");
  }catch(err){
    if(err.code!=="INVALID_WORKFLOW")throw err;
  }

  try{
    await E.execute(wfPlan,{adapters:{}});
    throw new Error("missing adapter should fail");
  }catch(err){
    if(err.code!=="TOOL_ADAPTER_MISSING")throw err;
  }

  console.log("GQB engine smoke test passed: planning, optional-step selection, input strategies, DAG execution, result verification and error propagation.");
})().catch(err=>{console.error(err);process.exit(1);});
