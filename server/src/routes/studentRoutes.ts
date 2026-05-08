import { Router } from "express";
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  loginStudent,
} from "../controllers/studentController";

const router = Router();

// ─── Auth ──────────────────────────────────────────────────────────────────────
router.post("/login", loginStudent);

// ─── Student CRUD ──────────────────────────────────────────────────────────────
router.post("/register", createStudent);
router.get("/students", getStudents);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);

export default router;
