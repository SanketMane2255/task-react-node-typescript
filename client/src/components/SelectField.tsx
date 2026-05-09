// src/components/SelectField.tsx

import React from 'react';
import type { SelectHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  icon,
  options,
  placeholder = 'Select an option',
  className = '',
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
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors duration-200 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={`
            input-base appearance-none cursor-pointer
            ${icon ? 'pl-10' : ''}
            pr-10
            ${error ? 'input-error' : ''}
            ${!props.value ? 'text-slate-500' : 'text-slate-100'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="bg-slate-800 text-slate-400">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-slate-800 text-slate-100"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary-400 transition-colors duration-200">
          <ChevronDown size={16} />
        </div>
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

export default SelectField;
