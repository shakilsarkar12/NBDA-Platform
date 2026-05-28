import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { donorsRouter } from "./routes/donors.js";
import { healthRouter } from "./routes/health.js";
import { AppError } from "./utils/errors.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/auth", authRouter);
  app.use("/donors", donorsRouter);
  app.use("/health", healthRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
      return;
    }

    console.error("[express] unexpected error:", error);
    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  });

  return app;
}
