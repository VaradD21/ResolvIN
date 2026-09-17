import React from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { TicketTable } from '../components/tickets/TicketTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BackendNotice } from '../components/common/BackendNotice';
import { EmptyState } from '../components/common/EmptyState';
import { PlusCircle, RotateCw, Ticket as TicketIcon } from 'lucide-react';

export const TicketsListPage: React.FC = () => {
  const {
    tickets,
    loading,
    error,
    isStubbed,
    missingEndpoint,
    refresh,
  } = useTickets(0, 20);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and monitor autonomous ticket classifications, evaluations, and statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Backend Missing Endpoint Notice */}
      {(missingEndpoint || isStubbed) && (
        <BackendNotice
          endpoint="GET /tickets"
          type="warning"
          message="Backend currently has no GET /tickets (list-all) endpoint implemented. The table below is displaying seeded preview tickets to verify formatting, badges, and detail page navigation. Once GET /tickets is added to Spring Boot, live data will populate automatically."
        />
      )}

      {/* Error Banner */}
      {error && !isStubbed && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm">
          <span className="font-semibold">Error: </span>
          {error}
        </div>
      )}

      {/* Content Area */}
      {loading && tickets.length === 0 ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No Tickets Found"
          description="There are currently no customer support tickets in the queue. Create one to begin testing."
          icon={TicketIcon}
          action={{
            label: 'Create First Ticket',
            onClick: () => {
              window.location.href = '/#/tickets/new';
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          <TicketTable tickets={tickets} />
          <div className="text-xs text-slate-400 text-right pr-2">
            Showing {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
          </div>
        </div>
      )}
    </div>
  );
};
