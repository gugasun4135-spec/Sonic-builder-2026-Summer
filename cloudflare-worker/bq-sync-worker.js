export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Cache-Control": "no-store"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname !== "/state") {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const expected = `Bearer ${env.SYNC_TOKEN}`;
    if (!env.SYNC_TOKEN || request.headers.get("Authorization") !== expected) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const key = env.GAME_ID || "zhenyu-builder-quest";

    if (request.method === "GET") {
      const value = await env.BQ_GAME.get(key);
      return new Response(value || "null", {
        status: value ? 200 : 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    if (request.method === "PUT") {
      const payload = await request.json();

      if (!payload?.state || typeof payload.updatedAt !== "number") {
        return new Response("Bad request", { status: 400, headers: corsHeaders });
      }

      const current = await env.BQ_GAME.get(key, "json");
      if (current?.updatedAt && current.updatedAt > payload.updatedAt) {
        return Response.json(current, { headers: corsHeaders });
      }

      await env.BQ_GAME.put(key, JSON.stringify(payload));
      return Response.json(payload, { headers: corsHeaders });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
};
