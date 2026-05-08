import express, { Application, Request, Response } from "express";

import studentRoutes from "./routes/studentRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app: Application = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});


// ─── API Routes
app.use("/api", studentRoutes);

// ─── 404 Handler 
app.use(notFound);

// ─── Global Error Handler
app.use(errorHandler);


export default app;