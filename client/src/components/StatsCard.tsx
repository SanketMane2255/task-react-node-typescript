// src/components/StatsCard.tsx
import React from 'react';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue: {
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/20',
    icon: 'text-primary-400',
    value: 'text-primary-300',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    value: 'text-emerald-300',
  },
  purple: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: 'text-violet-400',
    value: 'text-violet-300',
  },
  orange: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    value: 'text-amber-300',
  },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}) => {
  const c = colorMap[color];
  return (
    <div className={`card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-300`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-body uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-display font-bold ${c.value} leading-tight mt-0.5`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 font-body mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
