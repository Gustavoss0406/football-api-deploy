import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // --------------------------------------------------
  // Basic middlewares
  // --------------------------------------------------
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // --------------------------------------------------
  // Health check (REST, simples, sem dependências)
  // --------------------------------------------------
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // --------------------------------------------------
  // OAuth routes
  // --------------------------------------------------
  registerOAuthRoutes(app);

  // --------------------------------------------------
  // tRPC API
  // --------------------------------------------------
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // --------------------------------------------------
  // Frontend (Vite dev / Static prod)
  // --------------------------------------------------
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // --------------------------------------------------
  // Render / Production-safe port binding
  // --------------------------------------------------
  const port = Number(process.env.PORT) || 3000;

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
