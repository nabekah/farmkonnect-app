import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use process.cwd() for reliable path resolution in production
  const distPath = path.join(process.cwd(), "dist", "public");
  
  // Check if the directory exists, if not try alternative paths
  let finalDistPath = distPath;
  if (!fs.existsSync(finalDistPath)) {
    // Try relative to the current file location
    const altPath = path.resolve(import.meta.dirname, "../../dist/public");
    if (fs.existsSync(altPath)) {
      finalDistPath = altPath;
    } else {
      console.error(
        `Could not find the build directory at ${distPath} or ${altPath}. Available paths: ${process.cwd()}`
      );
      // Create a fallback that serves a simple HTML page
      app.use("*", (_req, res) => {
        res.status(200).set({ "Content-Type": "text/html" }).send(`
          <!DOCTYPE html>
          <html>
            <head><title>FarmKonnect</title></head>
            <body>
              <h1>Build directory not found</h1>
              <p>Expected: ${distPath}</p>
              <p>Current working directory: ${process.cwd()}</p>
            </body>
          </html>
        `);
      });
      return;
    }
  }

  console.log(`[Static] Serving files from: ${finalDistPath}`);
  app.use(express.static(finalDistPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(finalDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });
}
