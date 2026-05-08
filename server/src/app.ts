import express, { Application, Request, Response } from "express";
import cors from "cors";
import studentRoutes from "./routes/studentRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app: Application = express();

// ─── CORS Configuration ───
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", 
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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