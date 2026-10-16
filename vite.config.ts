import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import fs from "fs";

function cleanUrlsPlugin(): Plugin {
  const handler = (req: any, res: any, next: any) => {
    if (req.url) {
      const [pathname, search] = req.url.split("?");
      if (pathname.endsWith(".html") && pathname !== "/index.html") {
        const clean = pathname.slice(0, -5);
        const targetFile = resolve(__dirname, `.${clean}.html`);
        if (fs.existsSync(targetFile)) {
          const destination = search ? `${clean}?${search}` : clean;
          res.statusCode = 301;
          res.setHeader("Location", destination);
          res.end();
          return;
        }
      }
      if (!pathname.includes(".") && pathname !== "/") {
        const clean = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
        const targetFile = resolve(__dirname, `.${clean}.html`);
        if (fs.existsSync(targetFile)) {
          req.url = search ? `${clean}.html?${search}` : `${clean}.html`;
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
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless"
    }
  },
  plugins: [cleanUrlsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        embed: resolve(__dirname, "embed.html"),
        docs: resolve(__dirname, "docs.html"),
        test: resolve(__dirname, "test-embed.html")
      }
    }
  }
});
