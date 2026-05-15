// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type{ AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  forceLogout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      // If localStorage is corrupted, start unauthenticated
      localStorage.removeItem('auth_user');
      return null;
    }
  });

  // Keep localStorage in sync whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = (userData: AuthUser) => setUser(userData);
  const logout = () => setUser(null);

  // forceLogout() clears localStorage SYNCHRONOUSLY AND IMMEDIATELY 
  // before updating React state, so there is absolutely no window for stale auth.
   
  const forceLogout = () => {
    // 1. Synchronously clear localStorage right now — no async gap
    localStorage.removeItem('auth_user');
    // 2. Then update React state to trigger re-render and route protection
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, forceLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
