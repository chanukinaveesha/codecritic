import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express, { Application } from "express";
import { submissionRouter } from "./routes/submissions";
import { usersRouter } from "./routes/users";
import { reviewRouter } from "./routes/reviews";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(clerkMiddleware());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/users", usersRouter);
  app.use("/submissions", submissionRouter);
  app.use("/submissions", reviewRouter);
  return app;
}
