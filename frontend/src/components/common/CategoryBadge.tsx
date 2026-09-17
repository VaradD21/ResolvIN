import React from 'react';
import { TicketCategory } from '../../types/ticket';

interface CategoryBadgeProps {
  category?: TicketCategory | string | null;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  if (!category) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-400 bg-slate-100 ${className}`}>
        UNCLASSIFIED
      </span>
    );
  }

  const normalized = category.toUpperCase();
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (normalized) {
    case 'WISMO':
      badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'RETURN':
      badgeStyles = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'EXCHANGE':
      badgeStyles = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'REFUND_STATUS':
      badgeStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'CANCELLATION':
      badgeStyles = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'OTHER':
    default:
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border ${badgeStyles} ${className}`}
    >
      {normalized.replace('_', ' ')}
    </span>
  );
};
