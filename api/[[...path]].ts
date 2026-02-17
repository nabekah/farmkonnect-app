import type { VercelRequest, VercelResponse } from "@vercel/node";
import "dotenv/config";
import express from "express";
import compression from "compression";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic } from "../server/_core/vite";
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

// Serve static files and frontend
serveStatic(app);

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
