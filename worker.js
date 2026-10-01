export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS"
    };
    if (request.method === "OPTIONS") return new Response("", {headers});
    if (url.pathname !== "/api/seo") return new Response("Not found", {status:404, headers});
    if (request.method === "GET") {
      const data = await env.SEO_KV.get("site-config", "json");
      return new Response(JSON.stringify(data || {}), {headers:{"Content-Type":"application/json", ...headers}});
    }
    if (request.method === "PUT") {
      if (!env.ADMIN_PASSWORD || request.headers.get("X-Admin-Password") !== env.ADMIN_PASSWORD)
        return new Response("Unauthorized", {status:401, headers});
      const raw = await request.text();
      if (raw.length > 100000) return new Response("Payload too large", {status:413, headers});
      let data;
      try { data = JSON.parse(raw); } catch { return new Response("Invalid JSON", {status:400, headers}); }
      const clean = {
        siteName: String(data.name || data.siteName || "GQB Tools").slice(0,120),
        defaultLocale: String(data.defaultLocale || "en").slice(0,10),
        baseUrl: String(data.baseUrl || "").slice(0,500),
        robots: String(data.robots || "index,follow").slice(0,80),
        ga: String(data.ga || "").slice(0,80),
        gsv: String(data.gsv || "").slice(0,200)
      };
      await env.SEO_KV.put("site-config", JSON.stringify(clean));
      return new Response(JSON.stringify(clean), {headers:{"Content-Type":"application/json", ...headers}});
    }
    return new Response("Method not allowed", {status:405, headers});
  }
};