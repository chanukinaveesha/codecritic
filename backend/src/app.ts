import express, { Application } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { usersRouter } from "./routes/users";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(clerkMiddleware());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/users", usersRouter);

  return app;
}
