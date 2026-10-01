export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS"
    };

    if (request.method === "OPTIONS") return new Response("", {headers:cors});
    if (url.pathname !== "/api/seo") return new Response("Not found", {status:404,headers:cors});

    const repo = env.GITHUB_REPO || "cymswj/gqbapp";
    const branch = env.GITHUB_BRANCH || "main";
    const filePath = "src/seo-overrides.json";

    async function githubFile() {
      if (!env.GITHUB_TOKEN) return {data:{site:{},pages:{}},sha:null};
      const api = "https://api.github.com/repos/" + repo + "/contents/" + filePath + "?ref=" + encodeURIComponent(branch);
      const r = await fetch(api, {
        headers: {
          "Authorization": "Bearer " + env.GITHUB_TOKEN,
          "Accept": "application/vnd.github+json",
          "User-Agent": "GQB-SEO-Admin"
        }
      });
      if (!r.ok) return {data:{site:{},pages:{}},sha:null};
      const j = await r.json();
      const bytes = Uint8Array.from(atob((j.content || "").replace(/\n/g,"")), c => c.charCodeAt(0));
      const text = new TextDecoder().decode(bytes);
      try { return {data:JSON.parse(text),sha:j.sha}; } catch { return {data:{site:{},pages:{}},sha:j.sha}; }
    }

    function jsonResponse(data, status=200) {
      return new Response(JSON.stringify(data), {
        status,
        headers: {"Content-Type":"application/json; charset=utf-8", ...cors}
      });
    }

    if (request.method === "GET") {
      const {data} = await githubFile();
      const lang = url.searchParams.get("lang");
      const slug = url.searchParams.get("slug");
      if (lang && slug) {
        return jsonResponse({lang,slug,data:data.pages?.[lang+":"+slug] || {}});
      }
      return jsonResponse(data);
    }

    if (request.method === "PUT") {
      if (!env.ADMIN_PASSWORD || request.headers.get("X-Admin-Password") !== env.ADMIN_PASSWORD)
        return new Response("Unauthorized",{status:401,headers:cors});

      let body;
      try { body = await request.json(); } catch { return new Response("Invalid JSON",{status:400,headers:cors}); }

      const current = await githubFile();
      const data = current.data || {site:{},pages:{}};
      data.site = data.site || {};
      data.pages = data.pages || {};

      if (body.scope === "page") {
        const lang = String(body.lang || "en");
        const slug = String(body.slug || "");
        if (!slug) return new Response("Missing slug",{status:400,headers:cors});
        data.pages[lang + ":" + slug] = {
          title:String(body.data?.title || "").slice(0,180),
          description:String(body.data?.description || "").slice(0,320),
          h1:String(body.data?.h1 || "").slice(0,180),
          intro:String(body.data?.intro || "").slice(0,1000),
          targetKeywords:Array.isArray(body.data?.targetKeywords) ? body.data.targetKeywords.slice(0,30).map(x=>String(x).slice(0,80)) : [],
          index:body.data?.index !== false
        };
      } else if (body.scope === "site") {
        const lang = String(body.lang || "en");
        data.site[lang + ".title"] = String(body.data?.title || "").slice(0,180);
        data.site[lang + ".description"] = String(body.data?.description || "").slice(0,320);
      } else if (body.scope === "full") {
        if (!body.data || typeof body.data !== "object") return new Response("Invalid data",{status:400,headers:cors});
        data.site = body.data.site || {};
        data.pages = body.data.pages || {};
      } else {
        return new Response("Unknown scope",{status:400,headers:cors});
      }

      if (env.GITHUB_TOKEN) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2) + "\n")));
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
        if (!r.ok) return new Response(await r.text(),{status:502,headers:cors});
        return jsonResponse({ok:true,storage:"github",data});
      }

      if (env.SEO_KV) await env.SEO_KV.put("seo-overrides", JSON.stringify(data));
      return jsonResponse({ok:true,storage:"kv",data});
    }

    return new Response("Method not allowed",{status:405,headers:cors});
  }
};