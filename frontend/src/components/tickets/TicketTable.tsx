import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketSummary } from '../../types/ticket';
import { StatusBadge } from '../common/StatusBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { ChevronRight, Clock, Mail } from 'lucide-react';

interface TicketTableProps {
  tickets: TicketSummary[];
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  const navigate = useNavigate();

  const handleRowClick = (id: number) => {
    navigate(`/tickets/${id}`);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="overflow-hidden bg-white shadow-xs border border-slate-200 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3.5 w-16">ID</th>
              <th scope="col" className="px-6 py-3.5">Customer</th>
              <th scope="col" className="px-6 py-3.5">Subject</th>
              <th scope="col" className="px-6 py-3.5">Category</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5">Created</th>
              <th scope="col" className="px-4 py-3.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => handleRowClick(ticket.id)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                {/* ID */}
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-500">
                  #{ticket.id}
                </td>

                {/* Customer Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{ticket.customerEmail}</span>
                  </div>
                </td>

                {/* Subject */}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {ticket.subject}
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <CategoryBadge category={ticket.category} />
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} />
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </td>

                {/* Arrow indicator */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
