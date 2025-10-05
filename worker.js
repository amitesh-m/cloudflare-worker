export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://wealthville.net",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // Health check
    if (url.pathname === "/" || url.pathname === "") {
      return new Response("Wealthville proxy active", {
        headers: { "Access-Control-Allow-Origin": "https://wealthville.net" }
      });
    }

    // Jupiter quote proxy: /jup?inputMint=...&outputMint=...&amount=...&slippageBps=...
    if (url.pathname === "/jup") {
      const upstream = "https://quote-api.jup.ag/v6/quote?" + url.searchParams.toString();
      try {
        const r = await fetch(upstream, {
          // helps with edge DNS weirdness
          cf: { cacheTtl: 30, resolveOverride: "quote-api.jup.ag" }
        });
        const body = await r.text(); // pass-through
        return new Response(body, {
          status: r.status,
          headers: {
            "Content-Type": r.headers.get("content-type") || "application/json",
            "Access-Control-Allow-Origin": "https://wealthville.net",
            "Cache-Control": "max-age=15"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://wealthville.net"
          }
        });
      }
    }

    // 404
    return new Response("Not found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "https://wealthville.net" }
    });
  }
};
