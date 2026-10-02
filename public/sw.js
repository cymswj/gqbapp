const CACHE="__GQB_CACHE_VERSION__";
const CORE=["./","./public/style.css","./public/gqb-core.js","./public/app.js","./public/gqb-engine.js","./public/task-router.js","./public/site.webmanifest"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.endsWith("/admin.html") || url.pathname.endsWith("/sitemap.xml") || url.pathname.endsWith("/robots.txt")) return;
  if(req.mode==="navigate"){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok) caches.open(CACHE).then(c=>c.put(req,res.clone()));
      return res;
    }).catch(()=>caches.match(req).then(c=>c||caches.match("./"))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res.ok) caches.open(CACHE).then(c=>c.put(req,res.clone()));
    return res;
  })));
});