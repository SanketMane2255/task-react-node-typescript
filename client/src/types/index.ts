// src/types/index.ts

export interface Student {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface AuthUser {
  _id: string;
  createdAt: string;
}
