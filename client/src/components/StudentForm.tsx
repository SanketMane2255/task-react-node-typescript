// src/components/StudentForm.tsx
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Calendar, Users, MapPin,
  BookOpen, Lock, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import InputField from './InputField';
import SelectField from './SelectField';
import TextAreaField from './TextAreaField';
import LoadingSpinner from './LoadingSpinner';
import { registerStudentApi, updateStudentApi } from '../utils/api';
import { encryptData } from '../utils/crypto';
import { validateStudent, hasErrors } from '../utils/validation';
import type{ Student, StudentFormData, ValidationErrors } from '../types';

// ─── Constants ───

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const COURSE_OPTIONS = [
  { value: 'Full Stack Development', label: 'Full Stack Development' },
  { value: 'Frontend Development', label: 'Frontend Development' },
  { value: 'Backend Development', label: 'Backend Development' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Cloud Computing', label: 'Cloud Computing' },
  { value: 'DevOps Engineering', label: 'DevOps Engineering' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'Database Administration', label: 'Database Administration' },
  { value: 'Other', label: 'Other' },
];

const EMPTY_FORM: StudentFormData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  courseEnrolled: '',
  password: '',
};

// ─── Props ───

interface StudentFormProps {
  editStudent?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Component ───

const StudentForm: React.FC<StudentFormProps> = ({
  editStudent,
  onSuccess,
  onCancel,
}) => {
  const isEdit = !!editStudent;

  const [form, setForm] = useState<StudentFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof StudentFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editStudent) {
      setForm({
        fullName: editStudent.fullName || '',
        email: editStudent.email || '',
        phoneNumber: editStudent.phoneNumber || '',
        dateOfBirth: editStudent.dateOfBirth || '',
        gender: editStudent.gender || '',
        address: editStudent.address || '',
        courseEnrolled: editStudent.courseEnrolled || '',
        password: '', // never pre-fill password
      });
      setErrors({});
      setTouched({});
    } else {
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
    }
  }, [editStudent]);

  const handleChange = (field: keyof StudentFormData, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      const errs = validateStudent(updated, isEdit);
      setErrors(errs);
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateStudent(form, isEdit);
    setErrors(errs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof StudentFormData, boolean>
    );
    setTouched(allTouched);

    const errs = validateStudent(form, isEdit);
    setErrors(errs);
    if (hasErrors(errs)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && editStudent) {
        // Build partial update — only send changed non-empty fields
        const updatePayload: Record<string, string> = {};
        (Object.keys(form) as (keyof StudentFormData)[]).forEach((key) => {
          const val = form[key];
          if (key === 'password') {
            if (val && val.trim() !== '') {
              updatePayload[key] = encryptData(val);
            }
          } else if (val && val.trim() !== '') {
            updatePayload[key] = encryptData(val);
          }
        });

        const res = await updateStudentApi(editStudent._id, updatePayload);
        if (res.success) {
          toast.success('Student updated successfully!');
          onSuccess();
        } else {
          toast.error(res.message || 'Update failed');
        }
      } else {
        // Encrypt all fields for create
        const encrypted: Record<string, string> = {};
        (Object.keys(form) as (keyof StudentFormData)[]).forEach((key) => {
          encrypted[key] = encryptData(form[key]);
        });

        const res = await registerStudentApi(encrypted);
        if (res.success) {
          toast.success('Student registered successfully!');
          setForm(EMPTY_FORM);
          setTouched({});
          setErrors({});
          onSuccess();
        } else {
           if (res.error === 'DUPLICATE_EMAIL' || res.message?.toLowerCase().includes('email already')) {
            setErrors({ email: 'This email is already registered. Please use a different email.' });
            setTouched((prev) => ({ ...prev, email: true }));
            toast.error('Email already registered');
          } else {
            toast.error(res.message || 'Registration failed');
          }
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isEdit ? 'Failed to update student' : 'Failed to register student');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Row 1: Full Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          type="text"
          value={form.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          onBlur={() => handleBlur('fullName')}
          placeholder="e.g. John Doe"
          error={touched.fullName ? errors.fullName : undefined}
          icon={<User size={16} />}
          required={!isEdit}
          autoComplete="name"
        />
        <InputField
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="john@example.com"
          error={touched.email ? errors.email : undefined}
          icon={<Mail size={16} />}
          required={!isEdit}
          autoComplete="email"
        />
      </div>

      {/* Row 2: Phone + DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Phone Number"
          type="tel"
          value={form.phoneNumber}
          onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
          onBlur={() => handleBlur('phoneNumber')}
          placeholder="10-digit mobile number"
          error={touched.phoneNumber ? errors.phoneNumber : undefined}
          icon={<Phone size={16} />}
          required={!isEdit}
          autoComplete="tel"
          maxLength={10}
        />
        <InputField
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          onBlur={() => handleBlur('dateOfBirth')}
          error={touched.dateOfBirth ? errors.dateOfBirth : undefined}
          icon={<Calendar size={16} />}
          required={!isEdit}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Row 3: Gender + Course */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Gender"
          value={form.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          onBlur={() => handleBlur('gender')}
          options={GENDER_OPTIONS}
          placeholder="Select gender"
          error={touched.gender ? errors.gender : undefined}
          icon={<Users size={16} />}
          required={!isEdit}
        />
        <SelectField
          label="Course Enrolled"
          value={form.courseEnrolled}
          onChange={(e) => handleChange('courseEnrolled', e.target.value)}
          onBlur={() => handleBlur('courseEnrolled')}
          options={COURSE_OPTIONS}
          placeholder="Select course"
          error={touched.courseEnrolled ? errors.courseEnrolled : undefined}
          icon={<BookOpen size={16} />}
          required={!isEdit}
        />
      </div>

      {/* Row 4: Address */}
      <TextAreaField
        label="Address"
        value={form.address}
        onChange={(e) => handleChange('address', e.target.value)}
        onBlur={() => handleBlur('address')}
        placeholder="Full residential address"
        error={touched.address ? errors.address : undefined}
        icon={<MapPin size={16} />}
        required={!isEdit}
        rows={3}
      />

      {/* Row 5: Password */}
      <InputField
        label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
        type="password"
        value={form.password}
        onChange={(e) => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
        placeholder={isEdit ? 'Leave blank to keep current password' : 'Min 8 chars, 1 uppercase, 1 number'}
        error={touched.password ? errors.password : undefined}
        icon={<Lock size={16} />}
        required={!isEdit}
        autoComplete={isEdit ? 'new-password' : 'new-password'}
      />

      {/* Password hint */}
      {!isEdit && (
        <p className="text-xs text-slate-500 font-body -mt-3 ml-1">
          Must be at least 8 characters with 1 uppercase letter and 1 number
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-slate-700/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1 sm:flex-none sm:w-32"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              {isEdit ? 'Updating…' : 'Registering…'}
            </>
          ) : (
            <>
              <Save size={16} />
              {isEdit ? 'Update Student' : 'Register Student'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
