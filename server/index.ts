import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";
import path from "path";
import { Server } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Start Python backend
log("Starting Python backend process...");
const pythonProcess = spawn("python", [path.join(process.cwd(), "python_backend/app.py")], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, PYTHON_PORT: "5001" }
});

// Log Python process output
pythonProcess.stdout.on("data", (data) => {
  log(`[python] ${data.toString().trim()}`, "python");
});

pythonProcess.stderr.on("data", (data) => {
  log(`[python-err] ${data.toString().trim()}`, "python");
});

pythonProcess.on("close", (code) => {
  log(`Python backend process exited with code ${code}`, "python");
});

// Log proxy requests manually
app.use("/api/python", (req, res, next) => {
  log(`Proxying to Python backend: ${req.method} ${req.url}`, "express");
  next();
});

// Setup proxy to Python backend
app.use(
  "/api/python",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/python": "", // Remove /api/python prefix when forwarding
    }
  } as any)
);

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
