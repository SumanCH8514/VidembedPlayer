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

    if (pathname.endsWith(".html") && pathname !== "/index.html") {
      const cleanPath = pathname.slice(0, -5);
      return Response.redirect(`${url.origin}${cleanPath}${search}`, 301);
    }

    let assetResponse: Response;

    if (!pathname.includes(".") && pathname !== "/") {
      const clean = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
      let targetHtml = `${clean}.html`;
      if (clean === "/auto" && (url.searchParams.get("embed") === "1" || url.searchParams.get("plain") === "1")) {
        targetHtml = "auto-embed.html";
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
