const fs=require("fs");
const path=require("path");
const {chromium}=require("playwright");

const BASE=(process.env.GQB_E2E_BASE_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const locales=["en","zh","es","fr","de","pt","ru","ja","ar","id"];
const categories=JSON.parse(fs.readFileSync("src/categories.json","utf8")).map(x=>x.slug);
const tools=[...JSON.parse(fs.readFileSync("src/tools.json","utf8")),...JSON.parse(fs.readFileSync("src/tools-extra.json","utf8"))];

const samples=[];
for(const loc of locales){
  samples.push({loc,path:"/"+loc+"/",kind:"home"});
  samples.push({loc,path:"/"+loc+"/about/",kind:"static"});
  samples.push({loc,path:"/"+loc+"/privacy/",kind:"static"});
  samples.push({loc,path:"/"+loc+"/category/"+categories[0]+"/",kind:"category"});
  samples.push({loc,path:"/"+loc+"/tools/"+tools[0].slug+"/",kind:"tool"});
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  for(const viewport of [{name:"desktop",width:1440,height:1000},{name:"mobile",width:390,height:844}]){
    const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
    for(const sample of samples){
      await page.goto(BASE+sample.path,{waitUntil:"domcontentloaded",timeout:30000});
      const brand=page.locator("a.brand");
      if(await brand.count()!==1)throw new Error("Brand missing: "+sample.path+" ("+viewport.name+")");
      const href=await brand.getAttribute("href");
      const expected=BASE+"/"+sample.loc+"/";
      if(href!==expected)throw new Error("Brand href mismatch: "+sample.path+" => "+href+" expected "+expected);
      await brand.click();
      await page.waitForURL(expected,{timeout:10000});
      if(new URL(page.url()).pathname!=="/"+sample.loc+"/")throw new Error("Brand click landed incorrectly: "+sample.path+" => "+page.url());
    }
    await page.close();
  }
  await browser.close();
  console.log("Header mobile/desktop smoke test passed:",samples.length,"pages across",locales.length,"locales.");
})();
