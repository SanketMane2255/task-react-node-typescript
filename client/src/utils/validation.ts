// src/utils/validation.ts

import type{ StudentFormData, LoginFormData, ValidationErrors } from '../types';

// ─── Login Validation ──

export function validateLogin(data: LoginFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

// ─── Student Form Validation ───

export function validateStudent(data: StudentFormData, isUpdate = false): ValidationErrors {
  const errors: ValidationErrors = {};

  // Full Name
  if (!isUpdate || data.fullName) {
    if (!data.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.fullName.trim())) {
      errors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
  }

  // Email
  if (!isUpdate || data.email) {
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  // Phone Number
  if (!isUpdate || data.phoneNumber) {
    if (!data.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(data.phoneNumber.trim())) {
      errors.phoneNumber = 'Enter a valid 10-digit Indian mobile number';
    }
  }

  // Date of Birth
  if (!isUpdate || data.dateOfBirth) {
    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (dob >= today) {
        errors.dateOfBirth = 'Date of birth must be in the past';
      } else if (age < 5) {
        errors.dateOfBirth = 'Student must be at least 5 years old';
      } else if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
  }

  // Gender
  if (!isUpdate || data.gender) {
    if (!data.gender) {
      errors.gender = 'Please select a gender';
    } else if (!['Male', 'Female', 'Other', 'Prefer not to say'].includes(data.gender)) {
      errors.gender = 'Please select a valid gender option';
    }
  }

  // Address
  if (!isUpdate || data.address) {
    if (!data.address.trim()) {
      errors.address = 'Address is required';
    } else if (data.address.trim().length < 10) {
      errors.address = 'Please enter a complete address (min 10 characters)';
    }
  }

  // Course Enrolled
  if (!isUpdate || data.courseEnrolled) {
    if (!data.courseEnrolled.trim()) {
      errors.courseEnrolled = 'Course enrolled is required';
    } else if (data.courseEnrolled.trim().length < 3) {
      errors.courseEnrolled = 'Please enter a valid course name';
    }
  }

  // Password (only required on create, optional on update)
  if (!isUpdate) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = 'Password must contain at least one number';
    }
  } else if (data.password && data.password.length > 0) {
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = 'Password must contain at least one number';
    }
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
