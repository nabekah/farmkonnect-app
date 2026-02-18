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
// STEP 2: SERVE STATIC FILES FROM PUBLIC DIRECTORY FIRST
// ============================================================================
// This must come BEFORE API routes to ensure static files are served first

const publicDir = path.join(process.cwd(), 'public');
console.log(`[Static] Attempting to serve from: ${publicDir}`);

// Check if public directory exists
if (fs.existsSync(publicDir)) {
  console.log(`[Static] ✓ Found public directory`);
  
  // Serve static files with proper cache headers
  app.use(express.static(publicDir, {
    maxAge: '1d',
    etag: false,
    index: ['index.html'],
  }));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
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
      next();
    }
  });
} else {
  console.error(`[Static] ✗ Public directory not found at: ${publicDir}`);
  console.error(`[Static] Current working directory: ${process.cwd()}`);
  console.error(`[Static] Directory contents:`, fs.readdirSync(process.cwd()).join(', '));
}

// ============================================================================
// API ROUTES (After static files)
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
