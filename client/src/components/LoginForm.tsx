// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../utils/api';
import { encryptData } from '../utils/crypto';
import { validateLogin, hasErrors } from '../utils/validation';
import type{ LoginFormData, ValidationErrors } from '../types';

const INITIAL: LoginFormData = { email: '', password: '' };

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginFormData>(INITIAL);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate single field on blur
  const handleBlur = (field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateLogin(form);
    setErrors(errs);
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errs = validateLogin({ ...form, [field]: value });
      setErrors(errs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const errs = validateLogin(form);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setLoading(true);
    try {
      const encryptedEmail = encryptData(form.email.trim().toLowerCase());
      const encryptedPassword = encryptData(form.password);

      const res = await loginApi(encryptedEmail, encryptedPassword);

      if (res.success && res.data) {
        login(res.data);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-900/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-950/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-800/10 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,165,245,1) 1px, transparent 1px), linear-gradient(90deg, rgba(42,165,245,1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo & heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow-lg mb-4">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-100">
            Welcome to{' '}
            <span className="text-gradient">EduVault</span>
          </h1>
          <p className="text-slate-400 mt-2 font-body text-sm">
            Secure student management, powered by dual-layer encryption
          </p>
        </div>

        {/* Card */}
        <div className="card p-8 space-y-6">
          {/* Security badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <ShieldCheck size={15} className="text-primary-400 flex-shrink-0" />
            <p className="text-xs text-primary-300 font-body">
              AES-256 end-to-end encryption active
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="form-label">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors duration-200 pointer-events-none">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-base pl-10 ${touched.email && errors.email ? 'input-error' : ''}`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="error-text flex items-center gap-1 animate-slide-up">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="form-label">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors duration-200 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`input-base pl-10 pr-11 ${touched.password && errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="error-text flex items-center gap-1 animate-slide-up">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-body">
            Your credentials are encrypted before leaving your browser
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6 font-body">
          EduVault Student Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
