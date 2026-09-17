import React from 'react';
import { TicketStatus } from '../../types/ticket';

interface StatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || 'NEW').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    case 'NEW':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      dotColor = 'bg-sky-500';
      break;
    case 'PROCESSING':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500 animate-pulse';
      break;
    case 'AUTO_RESOLVED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'RESOLVED':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      dotColor = 'bg-teal-500';
      break;
    case 'ESCALATED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500 animate-ping';
      break;
    case 'CLOSED':
      colorClasses = 'bg-gray-100 text-gray-600 border-gray-200';
      dotColor = 'bg-gray-400';
      break;
  }

  const label = normalized.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
