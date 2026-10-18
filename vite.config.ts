import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import fs from "fs";

const rootDir = import.meta.dirname;

function cleanUrlsPlugin(): Plugin {
  const handler = (req: any, res: any, next: any) => {
    if (req.url) {
      const [pathname, search] = req.url.split("?");
      if (pathname.startsWith("/api/")) {
        return next();
      }
      if (pathname.endsWith(".html") && pathname !== "/index.html") {
        const clean = pathname.slice(0, -5);
        const targetFile = resolve(rootDir, `.${clean}.html`);
        if (fs.existsSync(targetFile)) {
          const destination = search ? `${clean}?${search}` : clean;
          res.statusCode = 301;
          res.setHeader("Location", destination);
          res.end();
          return;
        }
      }
      if (pathname === "/auto.html" && search && (new URLSearchParams(search).get("embed") === "1" || new URLSearchParams(search).get("plain") === "1")) {
        req.url = `/auto-embed.html?${search}`;
      }
      if (!pathname.includes(".") && pathname !== "/") {
        const clean = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
        if (clean === "/auto/embed") {
          req.url = search ? `/auto-embed.html?${search}` : `/auto-embed.html`;
        } else if (clean === "/auto/docs" || clean === "/docs/auto") {
          req.url = search ? `/auto-docs.html?${search}` : `/auto-docs.html`;
        } else if (clean === "/auto" || clean.startsWith("/auto/")) {
          const sp = new URLSearchParams(search || "");
          if (sp.get("embed") === "1" || sp.get("plain") === "1") {
            req.url = search ? `/auto-embed.html?${search}` : `/auto-embed.html`;
          } else {
            req.url = search ? `/auto.html?${search}` : `/auto.html`;
          }
        } else {
          const targetFile = resolve(rootDir, `.${clean}.html`);
          if (fs.existsSync(targetFile)) {
            req.url = search ? `${clean}.html?${search}` : `${clean}.html`;
          }
        }
      }
    }
    next();
  };
  return {
    name: "vite-plugin-clean-urls",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api/stream": {
        target: "https://api.thugtv.online",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [cleanUrlsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        embed: resolve(rootDir, "embed.html"),
        auto: resolve(rootDir, "auto.html"),
        autoEmbed: resolve(rootDir, "auto-embed.html"),
        autoDocs: resolve(rootDir, "auto-docs.html"),
        docs: resolve(rootDir, "docs.html"),
        test: resolve(rootDir, "test-embed.html")
      }
    }
  }
});
