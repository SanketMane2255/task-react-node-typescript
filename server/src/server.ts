import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is running successfully ",
  });
});

// Port
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});