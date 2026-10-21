interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, search } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    if (pathname.startsWith("/api/stream/")) {
      const targetUrl = `https://api.thugtv.online${pathname}${search}`;
      try {
        const apiRes = await fetch(targetUrl, {
          method: request.method,
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        const headers = new Headers(apiRes.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "*");
        const text = await apiRes.text();
        const sanitized = text.replace(/brand=thug[s]?tv/gi, "brand=SumanMovies");
        return new Response(sanitized, {
          status: apiRes.status,
          statusText: apiRes.statusText,
          headers
        });
      } catch {
        return new Response(JSON.stringify({ sources: [], pending: false }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    if (pathname.endsWith(".html") && pathname !== "/index.html") {
      const cleanPath = pathname.slice(0, -5);
      return Response.redirect(`${url.origin}${cleanPath}${search}`, 301);
    }

    let assetResponse: Response;

    if (!pathname.includes(".") && pathname !== "/") {
      const clean = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
      let targetHtml = `${clean}.html`;
      if (clean === "/auto/docs" || clean === "/docs/auto") {
        targetHtml = "/auto-docs.html";
      } else if (clean === "/auto/embed" || (clean === "/auto" && (url.searchParams.get("embed") === "1" || url.searchParams.get("plain") === "1"))) {
        targetHtml = "/auto-embed.html";
      } else if (clean === "/auto" || clean.startsWith("/auto/")) {
        targetHtml = "/auto.html";
      }
      const htmlUrl = new URL(`${targetHtml}${search}`, request.url);
      assetResponse = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
      if (assetResponse.status === 404) {
        assetResponse = await env.ASSETS.fetch(request);
      }
    } else {
      assetResponse = await env.ASSETS.fetch(request);
    }

    const responseHeaders = new Headers(assetResponse.headers);

    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
    responseHeaders.set("Cross-Origin-Embedder-Policy", "credentialless");

    if (pathname.startsWith("/assets/") && pathname.includes("-")) {
      responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (pathname.endsWith(".wasm")) {
      responseHeaders.set("Content-Type", "application/wasm");
      responseHeaders.set("Cache-Control", "public, max-age=86400");
    } else if (pathname.endsWith(".js") || pathname === "/vidembed.js") {
      responseHeaders.set("Content-Type", "application/javascript; charset=utf-8");
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: responseHeaders
    });
  }
};
