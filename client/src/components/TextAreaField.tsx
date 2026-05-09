// src/components/TextAreaField.tsx

import React from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  icon,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      <label className="form-label">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-primary-400 transition-colors duration-200">
            {icon}
          </div>
        )}
        <textarea
          rows={rows}
          className={`
            input-base resize-none
            ${icon ? 'pl-10' : ''}
            ${error ? 'input-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="error-text flex items-center gap-1 animate-slide-up">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;
