const LOCALES = new Set(["en","zh","es","fr","de","pt","ru","ja","ar","id"]);
const CORS_METHODS = "GET, PUT, OPTIONS";
const MAX_BODY_BYTES = 64 * 1024;

function authOK(request, env) {
  return Boolean(env.ADMIN_PASSWORD) && request.headers.get("X-Admin-Password") === env.ADMIN_PASSWORD;
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ADMIN_ORIGIN || "https://gqb.app";
  const originHeader = origin === allowed ? origin : allowed;
  return {
    "Access-Control-Allow-Origin": originHeader,
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    "Access-Control-Allow-Methods": CORS_METHODS,
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function jsonResponse(request, env, data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type":"application/json; charset=utf-8", ...corsHeaders(request, env)}
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response("", {headers});
    if (url.pathname !== "/api/seo") return new Response("Not found", {status:404, headers});

    if (!authOK(request, env)) return new Response("Unauthorized", {status:401, headers});

    const repo = env.GITHUB_REPO || "cymswj/gqbapp";
    const branch = env.GITHUB_BRANCH || "main";
    const filePath = "src/seo-overrides.json";

    async function githubFile() {
      if (!env.GITHUB_TOKEN) return {data:{site:{},pages:{}},sha:null,error:null};
      const api = "https://api.github.com/repos/" + repo + "/contents/" + filePath + "?ref=" + encodeURIComponent(branch);
      const r = await fetch(api, {
        headers: {
          "Authorization": "Bearer " + env.GITHUB_TOKEN,
          "Accept": "application/vnd.github+json",
          "User-Agent": "GQB-SEO-Admin"
        }
      });
      if (!r.ok) return {data:{site:{},pages:{}},sha:null,error:"GitHub read failed: "+r.status};
      const j = await r.json();
      const bytes = Uint8Array.from(atob((j.content || "").replace(/\n/g,"")), c => c.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      try { return {data:JSON.parse(decoded),sha:j.sha,error:null}; }
      catch { return {data:{site:{},pages:{}},sha:j.sha,error:"Stored SEO JSON is invalid"}; }
    }

    function base64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

    function validLang(value) {
      return LOCALES.has(String(value || ""));
    }

    if (request.method === "GET") {
      const result = await githubFile();
      if (result.error && env.GITHUB_TOKEN) return jsonResponse(request,env,{error:result.error},503);
      const {data} = result;
      const lang = url.searchParams.get("lang");
      const slug = url.searchParams.get("slug");
      if (!validLang(lang)) return jsonResponse(request,env,{error:"Invalid language"},400);

      if (slug) {
        if (!/^[a-z0-9-]{1,120}$/.test(slug)) return jsonResponse(request,env,{error:"Invalid slug"},400);
        return jsonResponse(request,env,{lang,slug,data:data.pages?.[lang+":"+slug] || {}});
      }
      return jsonResponse(request,env,{lang,data:data.site?.[lang] || {}});
    }

    if (request.method !== "PUT") return new Response("Method not allowed", {status:405,headers});

    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > MAX_BODY_BYTES) return jsonResponse(request,env,{error:"Request too large"},413);
    let rawBody;
    try { rawBody = await request.text(); }
    catch { return jsonResponse(request,env,{error:"Unable to read request"},400); }
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(request,env,{error:"Request too large"},413);
    }
    let body;
    try { body = JSON.parse(rawBody); }
    catch { return jsonResponse(request,env,{error:"Invalid JSON"},400); }

    const current = await githubFile();
    if (current.error && env.GITHUB_TOKEN) return jsonResponse(request,env,{error:current.error},503);
    const data = current.data && typeof current.data === "object" ? current.data : {site:{},pages:{}};
    data.site = data.site && typeof data.site === "object" ? data.site : {};
    data.pages = data.pages && typeof data.pages === "object" ? data.pages : {};

    if (body.scope === "page") {
      const lang = String(body.lang || "en");
      const slug = String(body.slug || "");
      if (!validLang(lang)) return jsonResponse(request,env,{error:"Invalid language"},400);
      if (!/^[a-z0-9-]{1,120}$/.test(slug)) return jsonResponse(request,env,{error:"Invalid slug"},400);
      data.pages[lang + ":" + slug] = {
        title:String(body.data?.title || "").slice(0,180),
        description:String(body.data?.description || "").slice(0,320),
        h1:String(body.data?.h1 || "").slice(0,180),
        intro:String(body.data?.intro || "").slice(0,1200),
        targetKeywords:Array.isArray(body.data?.targetKeywords) ? body.data.targetKeywords.slice(0,30).map(x=>String(x).slice(0,80)) : [],
        index:body.data?.index !== false
      };
    } else if (body.scope === "site") {
      const lang = String(body.lang || "en");
      if (!validLang(lang)) return jsonResponse(request,env,{error:"Invalid language"},400);
      data.site[lang] = {
        title:String(body.data?.title || "").slice(0,180),
        description:String(body.data?.description || "").slice(0,320),
        h1:String(body.data?.h1 || "").slice(0,180),
        intro:String(body.data?.intro || "").slice(0,1200),
        index:body.data?.index !== false
      };
    } else if (body.scope === "full") {
      if (!body.data || typeof body.data !== "object") return jsonResponse(request,env,{error:"Invalid data"},400);
      data.site = body.data.site && typeof body.data.site === "object" ? body.data.site : {};
      data.pages = body.data.pages && typeof body.data.pages === "object" ? body.data.pages : {};
    } else {
      return jsonResponse(request,env,{error:"Unknown scope"},400);
    }

    if (env.GITHUB_TOKEN) {
      const encoded = base64Utf8(JSON.stringify(data,null,2) + "\n");
      const api = "https://api.github.com/repos/" + repo + "/contents/" + filePath;
      const payload = {
        message: "Update SEO configuration",
        content: encoded,
        branch
      };
      if (current.sha) payload.sha = current.sha;

      const r = await fetch(api, {
        method:"PUT",
        headers:{
          "Authorization":"Bearer "+env.GITHUB_TOKEN,
          "Accept":"application/vnd.github+json",
          "Content-Type":"application/json",
          "User-Agent":"GQB-SEO-Admin"
        },
        body:JSON.stringify(payload)
      });
      if (!r.ok) return new Response(await r.text(),{status:502,headers});
      return jsonResponse(request,env,{ok:true,storage:"github",data});
    }

    if (env.SEO_KV) {
      await env.SEO_KV.put("seo-overrides", JSON.stringify(data));
      return jsonResponse(request,env,{ok:true,storage:"kv",data});
    }

    return jsonResponse(request,env,{error:"No persistent storage configured. Set GITHUB_TOKEN or bind SEO_KV."},503);
  }
};
