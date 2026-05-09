// src/utils/api.ts

import axios from 'axios';
import type{ ApiResponse, Student, AuthUser } from '../types';

const api = axios.create({
  baseURL: ' http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request interceptor: attach token if present ───
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: handle 401 globally ─────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───

export const loginApi = async (
  encryptedEmail: string,
  encryptedPassword: string
): Promise<ApiResponse<AuthUser>> => {
  console.log('API Call: /login with encrypted email and password');
  console.log('Encrypted Email:', encryptedEmail);
  const { data } = await api.post<ApiResponse<AuthUser>>('/login', {
    email: encryptedEmail,
    password: encryptedPassword,
  });
  return data;
};

// ─── Students ──

export const registerStudentApi = async (
  encryptedData: Record<string, string>
): Promise<ApiResponse<{ _id: string; createdAt: string }>> => {
  const { data } = await api.post('/register', encryptedData);
  return data;
};

export const getStudentsApi = async (): Promise<ApiResponse<Student[]>> => {
  const { data } = await api.get<ApiResponse<Student[]>>('/students');
  return data;
};

export const updateStudentApi = async (
  id: string,
  encryptedData: Record<string, string>
): Promise<ApiResponse<{ _id: string; updatedAt: string }>> => {
  const { data } = await api.put(`/student/${id}`, encryptedData);
  return data;
};

export const deleteStudentApi = async (
  id: string
): Promise<ApiResponse<{ _id: string }>> => {
  const { data } = await api.delete(`/student/${id}`);
  return data;
};

export default api;
