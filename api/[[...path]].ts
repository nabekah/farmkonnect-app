import type { VercelRequest, VercelResponse } from "@vercel/node";
import "dotenv/config";
import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { initializeWeatherCron } from "../server/weatherCron";
import { initializeNotificationCron } from "../server/notificationCron";
import { initializeNotificationScheduler } from "../server/services/notificationScheduler";

// Create Express app instance
const app = express();

// Enable compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cache middleware
function cacheMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
}

app.use(cacheMiddleware);

// ============================================================================
// CRITICAL: OAuth and API routes FIRST (before static file serving)
// ============================================================================

// OAuth routes
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// ============================================================================
// Static files and SPA fallback
// ============================================================================
// This comes AFTER API routes so /api/* requests don't get intercepted

const publicDir = path.join(process.cwd(), 'public');
console.log(`[Static] Serving from: ${publicDir}`);

if (fs.existsSync(publicDir)) {
  console.log(`[Static] ✓ Found public directory`);
  
  // Serve static files with proper cache headers
  app.use(express.static(publicDir, {
    maxAge: '1d',
    etag: false,
    index: false, // Don't auto-serve index.html
  }));
  
  // SPA fallback: serve index.html for all non-API, non-static routes
  app.get('*', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.sendFile(indexPath);
    } else {
      console.error(`[Static] index.html not found at: ${indexPath}`);
      res.status(404).json({ error: 'Not found' });
    }
  });
} else {
  console.error(`[Static] ✗ Public directory not found at: ${publicDir}`);
  console.error(`[Static] Current working directory: ${process.cwd()}`);
  
  // Fallback: serve a simple error page
  app.get('*', (req, res) => {
    res.status(500).json({ error: 'Static files not available' });
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error Handler]', err);
  const isDev = process.env.NODE_ENV === 'development';
  const message = isDev ? err.message : 'Internal Server Error';
  const stack = isDev ? err.stack : undefined;
  res.status(err.status || 500).json({
    error: message,
    ...(stack && { stack }),
  });
});

// Initialize background jobs (only once)
let initialized = false;
if (!initialized) {
  initialized = true;
  try {
    initializeWeatherCron();
    initializeNotificationCron();
    initializeNotificationScheduler();
  } catch (e) {
    console.error('Error initializing background jobs:', e);
  }
}

// Vercel serverless handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
