export default {
  async fetch(req) {
    const url = new URL(req.url);

    // Allow test ping
    if (url.pathname === "/") {
      return new Response("WealthVille Proxy Active", {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Proxy Jupiter API
    if (url.pathname.startsWith("/jup")) {
      const target = new URL("https://quote-api.jup.ag/v6/quote");
      url.searchParams.forEach((v, k) => target.searchParams.set(k, v));

      const resp = await fetch(target.toString(), {
        headers: { "accept": "application/json" },
      });

      const body = await resp.arrayBuffer();
      const headers = new Headers(resp.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Headers", "*");
      headers.set("Cache-Control", "no-store");

      return new Response(body, { status: resp.status, headers });
    }

    // Default response
    return new Response("Not Found", { status: 404 });
  },
};
