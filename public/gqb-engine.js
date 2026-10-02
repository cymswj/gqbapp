(()=>{"use strict";
const STATUS=Object.freeze(["planned","validating","running","verifying","completed","failed"]);
const ERROR_CODES=Object.freeze({
  INVALID_TASK:"INVALID_TASK",
  WORKFLOW_NOT_FOUND:"WORKFLOW_NOT_FOUND",
  INVALID_WORKFLOW:"INVALID_WORKFLOW",
  TOOL_ADAPTER_MISSING:"TOOL_ADAPTER_MISSING",
  TOOL_EXECUTION_FAILED:"TOOL_EXECUTION_FAILED",
  VERIFICATION_FAILED:"VERIFICATION_FAILED",
  CYCLE_DETECTED:"CYCLE_DETECTED"
});
function normalize(value){return String(value||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");}
function scoreTask(task,query){
  const q=normalize(query).trim(); if(!q)return 0;
  const fields=[task.name,...(task.keywords||[])].map(normalize); let score=0;
  for(const field of fields){if(!field)continue;if(field===q)score+=100;else if(field.includes(q))score+=40;else{const words=q.split(/\s+/).filter(Boolean);score+=words.filter(word=>field.includes(word)).length*12;}}
  return score;
}
function rankTasks(tasks,query){
  return [...new Map((tasks||[]).map(task=>[task.id,task])).values()].map(task=>({task,score:scoreTask(task,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.task.id.localeCompare(b.task.id)).slice(0,5);
}
function topo(workflow){
  const steps=Array.isArray(workflow?.steps)?workflow.steps:[];const ids=new Set(steps.map(x=>x.id));
  if(steps.some(x=>!x.id||!x.tool||!Array.isArray(x.dependsOn)||x.dependsOn.some(dep=>!ids.has(dep))))throw new Error(ERROR_CODES.INVALID_WORKFLOW);
  const indegree=new Map(steps.map(x=>[x.id,0])),next=new Map(steps.map(x=>[x.id,[]]));
  for(const step of steps)for(const dep of step.dependsOn){next.get(dep).push(step.id);indegree.set(step.id,indegree.get(step.id)+1);}
  const queue=steps.filter(x=>indegree.get(x.id)===0).map(x=>x.id),out=[];
  while(queue.length){const id=queue.shift();out.push(steps.find(x=>x.id===id));for(const to of next.get(id)){indegree.set(to,indegree.get(to)-1);if(indegree.get(to)===0)queue.push(to);}}
  if(out.length!==steps.length)throw new Error(ERROR_CODES.CYCLE_DETECTED);
  return out;
}
function plan(query,{tasks=[],workflows=[]}={}){
  const matches=rankTasks(tasks,query);if(!matches.length)return {status:"failed",error:{code:ERROR_CODES.INVALID_TASK,message:"No matching task found.",recoverable:true},matches:[]};
  const best=matches[0].task;
  let workflow=null,steps=[];
  if(best.workflow){workflow=(workflows||[]).find(x=>x.id===best.workflow);if(!workflow)return {status:"failed",error:{code:ERROR_CODES.WORKFLOW_NOT_FOUND,message:"The task references a missing workflow.",recoverable:false},matches};steps=topo(workflow);}
  else {steps=(best.tools||[]).slice(0,1).map((tool,i)=>({id:"tool-"+(i+1),tool,purpose:"Execute the selected task tool.",dependsOn:[]}));}
  return {status:"planned",query:String(query||"").trim(),task:best,matches,workflow,steps};
}
class GQBEngineError extends Error{constructor(code,message,recoverable=true,cause){super(message);this.name="GQBEngineError";this.code=code;this.recoverable=recoverable;this.cause=cause;}}
async function execute(planValue,{input=null,adapters={},hooks={}}={}){
  if(!planValue||planValue.status!=="planned")throw new GQBEngineError(ERROR_CODES.INVALID_TASK,"Execution requires a valid plan.",true);
  const state={status:"planned",task:planValue.task,query:planValue.query,results:[],context:{input}};
  const emit=(name,payload={})=>{state.status=name;if(typeof hooks.onState==="function")hooks.onState(name,payload,state);};
  emit("validating");let steps;try{steps=topo(planValue.workflow||{steps:planValue.steps});}catch(error){emit("failed",{error});throw error;}
  emit("running");
  for(const step of steps){
    const adapter=adapters[step.tool];
    if(typeof adapter!=="function"){const error=new GQBEngineError(ERROR_CODES.TOOL_ADAPTER_MISSING,"No adapter is registered for "+step.tool+".",true);emit("failed",{step,error});throw error;}
    try{
      const stepInput={input,context:state.context,previous:state.results.at(-1)?.output,step};
      const started=Date.now();
      if(typeof hooks.onStep==="function")hooks.onStep("start",step,stepInput);
      const response=await adapter(stepInput);
      const output=response&&Object.prototype.hasOwnProperty.call(response,"output")?response.output:response;
      if(response&&response.error)throw new GQBEngineError(response.error.code||ERROR_CODES.TOOL_EXECUTION_FAILED,response.error.message||"Tool execution failed.",response.error.recoverable!==false,response.error);
      emit("verifying",{step});
      let verified=true;
      if(response&&typeof response.verify==="function")verified=await response.verify(output,stepInput);
      else if(response&&typeof response.verified==="boolean")verified=response.verified;
      if(!verified)throw new GQBEngineError(ERROR_CODES.VERIFICATION_FAILED,"Tool result verification failed.",true);
      const result={stepId:step.id,tool:step.tool,output,verified:true,durationMs:Date.now()-started};
      state.results.push(result);state.context[step.outputKey||step.id]=output;
      if(typeof hooks.onStep==="function")hooks.onStep("complete",step,result);
      emit("running",{step:result});
    }catch(error){
      const wrapped=error instanceof GQBEngineError?error:new GQBEngineError(ERROR_CODES.TOOL_EXECUTION_FAILED,error?.message||"Tool execution failed.",true,error);
      emit("failed",{step,error:wrapped});throw wrapped;
    }
  }
  emit("completed",{results:state.results});return state;
}
const GQB_ENGINE={STATUS,ERROR_CODES,GQBEngineError,normalize,scoreTask,rankTasks,topo,plan,execute};
window.GQB_ENGINE=GQB_ENGINE;
if(window.__GQB_TEST__)window.GQB_ENGINE_TEST=GQB_ENGINE;
})();