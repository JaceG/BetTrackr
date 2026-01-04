import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust Replit proxy for secure cookies
app.set('trust proxy', 1);

// Session configuration with MongoDB store (with fallback to memory store)
const mongoUri = process.env.MONGODB_URI;
let sessionStore: any;

if (mongoUri) {
  const MongoDBStore = ConnectMongoDBSession(session);
  sessionStore = new MongoDBStore({
    uri: mongoUri,
    collection: 'sessions',
    expires: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  sessionStore.on('error', (error: Error) => {
    console.error('Session store error:', error);
  });
  
  log('Using MongoDB session store');
} else {
  console.warn('WARNING: MONGODB_URI not set - using memory store (sessions will not persist across restarts)');
  console.warn('For production deployments, please configure MONGODB_URI in your deployment secrets');
  // sessionStore will be undefined, which makes express-session use memory store
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Will be undefined if MONGODB_URI is missing (uses memory store)
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: "auto", // Auto-detect HTTPS (works with trust proxy)
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 3000 if not specified (5000 is often used by macOS AirPlay Receiver).
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '3000', 10);
  
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Try setting PORT environment variable to a different port.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
