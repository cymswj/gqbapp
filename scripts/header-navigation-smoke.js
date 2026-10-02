const fs=require("fs");
const path=require("path");

const base="https://gqb.app";
const locales=["en","zh","es","fr","de","pt","ru","ja","ar","id"];
const root="dist";

function walk(dir){
  const out=[];
  for(const name of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,name.name);
    if(name.isDirectory())out.push(...walk(p));
    else if(name.isFile()&&name.name==="index.html")out.push(p);
  }
  return out;
}

function expectedHome(page,loc){
  return base+"/"+loc+"/";
}

const pages=walk(root).filter(p=>!p.startsWith(path.join(root,"api"))&&!p.includes(path.sep+".well-known"+path.sep)&&!p.endsWith(path.join("dist","index.html")));
let checked=0;
for(const file of pages){
  const rel=file.slice(root.length+1).replaceAll(path.sep,"/");
  const loc=locales.find(x=>rel===x+"/index.html"||rel.startsWith(x+"/"));
  if(!loc)continue;
  const html=fs.readFileSync(file,"utf8");
  const m=html.match(/<a class="brand" href="([^"]+)">/);
  if(!m)throw new Error("Missing brand link: "+rel);
  const actual=m[1];
  const expected=expectedHome(file,loc);
  if(actual!==expected)throw new Error("Wrong brand target on "+rel+": "+actual+" expected "+expected);

  const links=[...html.matchAll(/<nav class="langs"[^>]*>\s*((?:<a[^>]*>.*?<\/a>\s*)+)<\/nav>/gs)][0]?.[1]||"";
  const langLinks=[...links.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(x=>x[1]);
  if(langLinks.length!==locales.length)throw new Error("Language link count mismatch on "+rel);
  checked++;
}
if(checked<locales.length*3)throw new Error("Too few localized pages checked: "+checked);
console.log("Header navigation smoke test passed:",checked,"localized pages; brand targets and language links are structurally present.");
