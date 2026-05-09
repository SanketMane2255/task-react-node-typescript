
import { Request, Response } from "express";
import Student, { IStudentPlain } from "../models/Student";
import { encryptData, decryptData, decryptFrontendData } from "../utils/crypto";

interface EncryptedStudentBody {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

function applyLevel2Encryption(body: EncryptedStudentBody) {
  return {
    fullName: encryptData(body.fullName),
    email: encryptData(body.email),
    phoneNumber: encryptData(body.phoneNumber),
    dateOfBirth: encryptData(body.dateOfBirth),
    gender: encryptData(body.gender),
    address: encryptData(body.address),
    courseEnrolled: encryptData(body.courseEnrolled),
    password: encryptData(body.password),
  };
}

function stripLevel2Encryption(doc: {
  _id: unknown;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: doc._id,
    fullName: decryptData(doc.fullName),
    email: decryptData(doc.email),
    phoneNumber: decryptData(doc.phoneNumber),
    dateOfBirth: decryptData(doc.dateOfBirth),
    gender: decryptData(doc.gender),
    address: decryptData(doc.address),
    courseEnrolled: decryptData(doc.courseEnrolled),
    password: decryptData(doc.password), // still Level-1 encrypted from frontend
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─── Helper: Validate that all required fields are present ────────────────────

function validateRequiredFields(body: Partial<EncryptedStudentBody>): string | null {
  const required: (keyof EncryptedStudentBody)[] = [
    "fullName",
    "email",
    "phoneNumber",
    "dateOfBirth",
    "gender",
    "address",
    "courseEnrolled",
    "password",
  ];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === "") {
      return `Field '${field}' is required and must not be empty`;
    }
  }
  return null;
}

// ─── Controller: POST /api/register ───────────────────────────────────────────

export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as Partial<EncryptedStudentBody>;

    // Validate required fields
    const validationError = validateRequiredFields(body);
    if (validationError) {
      const response: ApiResponse = {
        success: false,
        message: "Validation failed",
        error: validationError,
      };
      res.status(400).json(response);
      return;
    }

    // Apply Level-2 encryption
    const doubleEncrypted = applyLevel2Encryption(body as EncryptedStudentBody);

    // Save to MongoDB
    const student = new Student(doubleEncrypted);
    const saved = await student.save();

    const response: ApiResponse = {
      success: true,
      message: "Student registered successfully",
      data: { _id: saved._id, createdAt: saved.createdAt },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("[createStudent] Error:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error while creating student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
};

// ─── Controller: GET /api/students ────────────────────────────────────────────

export const getStudents = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    // Strip backend (Level-2) encryption from each student
    const level1EncryptedStudents = students.map((student: InstanceType<typeof Student>) =>
      stripLevel2Encryption({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        courseEnrolled: student.courseEnrolled,
        password: student.password,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      })
    );

    const response: ApiResponse = {
      success: true,
      message: "Students fetched successfully",
      data: level1EncryptedStudents,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("[getStudents] Error:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error while fetching students",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
};

// ─── Controller: PUT /api/student/:id ─────────────────────────────────────────

export const updateStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<EncryptedStudentBody>;

    // Check student exists
    const existing = await Student.findById(id);
    if (!existing) {
      const response: ApiResponse = {
        success: false,
        message: "Student not found",
        error: `No student found with id: ${id}`,
      };
      res.status(404).json(response);
      return;
    }

    // Build partial update — only encrypt fields that are provided
    const updatePayload: Partial<ReturnType<typeof applyLevel2Encryption>> = {};

    const fields: (keyof EncryptedStudentBody)[] = [
      "fullName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "address",
      "courseEnrolled",
      "password",
    ];

    for (const field of fields) {
      if (body[field] !== undefined && String(body[field]).trim() !== "") {
        updatePayload[field] = encryptData(body[field] as string);
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No valid fields provided for update",
      };
      res.status(400).json(response);
      return;
    }

    const updated = await Student.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    const response: ApiResponse = {
      success: true,
      message: "Student updated successfully",
      data: { _id: updated?._id, updatedAt: updated?.updatedAt },
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("[updateStudent] Error:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error while updating student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
};

// ─── Controller: DELETE /api/student/:id ──────────────────────────────────────

export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        message: "Student not found",
        error: `No student found with id: ${id}`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: "Student deleted successfully",
      data: { _id: deleted._id },
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("[deleteStudent] Error:", error);
    const response: ApiResponse = {
      success: false,
      message: "Internal server error while deleting student",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
};

// ─── Controller: POST /api/login ──────────────────────────────────────────────

export const loginStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Decrypt Level-1 (frontend encryption) to get plain text
    let plainEmail: string;
    let plainPassword: string;

    try {
      plainEmail = decryptFrontendData(email);
      plainPassword = decryptFrontendData(password);
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid encrypted credentials format",
      });
      return;
    }

    const adminEmail    = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // ── Check against hardcoded admin credentials first ──────────────────────
    if (
      adminEmail &&
      adminPassword &&
      plainEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim() &&
      plainPassword === adminPassword
    ) {
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          _id: "admin",
          createdAt: new Date().toISOString(),
          role: "admin",
        },
      });
      return;
    }

    // ── Fallback: check against registered students in DB ────────────────────
    const allStudents = await Student.find();
    let matchedStudent = null;

    for (const student of allStudents) {
      try {
        const level1Email    = decryptData(student.email);
        const level1Password = decryptData(student.password);
        const dbPlainEmail    = decryptFrontendData(level1Email);
        const dbPlainPassword = decryptFrontendData(level1Password);

        if (
          dbPlainEmail.toLowerCase().trim() === plainEmail.toLowerCase().trim() &&
          dbPlainPassword === plainPassword
        ) {
          matchedStudent = student;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedStudent) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: matchedStudent._id,
        createdAt: matchedStudent.createdAt,
      },
    });
  } catch (error) {
    console.error("[loginStudent] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};