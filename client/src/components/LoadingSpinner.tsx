// src/components/LoadingSpinner.tsx

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizeMap[size]}
          rounded-full
          border-slate-700
          border-t-primary-500
          animate-spin
        `}
      />
      {text && (
        <p className="text-slate-400 text-sm font-body animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
