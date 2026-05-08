import express, { Application, Request, Response } from "express";

const app: Application = express();

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});




export default app;