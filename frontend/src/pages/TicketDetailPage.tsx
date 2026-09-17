import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTicketDetail } from '../hooks/useTicketDetail';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { EventTimeline } from '../components/tickets/EventTimeline';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  RotateCw,
  Mail,
  Calendar,
  Building2,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = id ? parseInt(id, 10) : null;

  const { ticket, loading, error, refresh } = useTicketDetail(ticketId);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const confidencePct =
    ticket?.confidence !== undefined && ticket?.confidence !== null
      ? Math.round(ticket.confidence * 100)
      : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button and page controls */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </Link>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ticket</span>
        </button>
      </div>

      {loading && !ticket ? (
        <LoadingSpinner label="Fetching ticket details..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Ticket Not Found or Connection Failed</span>
          </div>
          <p className="text-sm opacity-90">{error}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-rose-700 hover:underline"
            >
              Return to tickets list
            </Link>
          </div>
        </div>
      ) : ticket ? (
        <div className="space-y-6">
          {/* Main Ticket Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            {/* Header / ID & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    TICKET #{ticket.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {ticket.subject}
                </h1>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            {/* Ticket Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 text-xs border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Customer:</span>
                <span className="font-medium text-slate-800 truncate">{ticket.customerEmail}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Brand ID:</span>
                <span className="font-mono font-medium text-slate-800">#{ticket.brandId}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Category:</span>
                <CategoryBadge category={ticket.category} />
                {confidencePct !== null && (
                  <span className="font-mono text-2xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    ({confidencePct}%)
                  </span>
                )}
              </div>
            </div>

            {/* Customer Body Content */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Customer Inquiry</span>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                {ticket.body}
              </div>
            </div>
          </div>

          {/* Event Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Autonomous Pipeline Events
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {ticket.events?.length || 0} events recorded
              </span>
            </div>

            <EventTimeline events={ticket.events} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
