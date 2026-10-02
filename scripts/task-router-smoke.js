const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("public/task-router.js", "utf8");
const context = {
  document: {
    readyState: "complete",
    getElementById(){ return null; }
  },
  window: null
};
context.window = context;
context.__GQB_TEST__ = true;
vm.runInNewContext(source, context, {filename:"public/task-router.js"});

const api = context.GQB_TASK_ROUTER_TEST;
if (!api) throw new Error("Task router test API missing");

const tasks = [
  {id:"pdf",name:"Process PDF",keywords:["pdf","合并PDF"],tools:["pdf-merger"]},
  {id:"image",name:"Process image",keywords:["image","图片","compress image"],tools:["image-compressor"]}
];

if (api.scoreTask(tasks[0], "pdf") <= 0) throw new Error("PDF task scoring failed");
if (api.scoreTask(tasks[1], "compress image") <= 0) throw new Error("Image task scoring failed");
const ranked = api.rankTasks(tasks, "compress image");
if (!ranked.length || ranked[0].task.id !== "image") throw new Error("Task ranking failed");
if (api.rankTasks(tasks, "completely unrelated request").length !== 0) throw new Error("Unrelated query should not match");

console.log("Task router smoke test passed: scoring, ranking and no-match behavior.");
