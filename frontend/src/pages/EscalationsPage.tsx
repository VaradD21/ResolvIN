import React, { useState } from 'react';
import { useEscalations } from '../hooks/useEscalations';
import { EscalationCard } from '../components/escalations/EscalationCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { resolveEscalation } from '../api/escalationsApi';
import { ResolveEscalationRequest } from '../types/escalation';
import { AlertCircle, RotateCw, CheckCircle2, Info, X } from 'lucide-react';

export const EscalationsPage: React.FC = () => {
  const { escalations, loading, error, refresh, unresolvedCount } = useEscalations();
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleResolve = async (id: number, payload: ResolveEscalationRequest) => {
    await resolveEscalation(id, payload);
    const actionLabel = payload.resolutionAction.replace(/_/g, ' ');
    setSuccessBanner(`Escalation #${id} successfully resolved with action: ${actionLabel}`);
    // Refresh queue to remove resolved escalation
    await refresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Escalations Queue
            </h1>
            {unresolvedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
                {unresolvedCount} Pending
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cases flagged by the deterministic policy engine or AI classifier requiring human judgment.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Workflow notice banner */}
      <div className="rounded-lg bg-slate-100 border border-slate-200 p-3.5 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">Human Review Active:</span> Review the full AI classification and deterministic policy reasons below. Choosing an approval action will automatically enqueue the corresponding action and update the ticket status.
        </p>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-semibold">Failed to fetch escalations: </span>
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      {loading && escalations.length === 0 ? (
        <LoadingSpinner label="Loading escalations queue..." />
      ) : escalations.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          description="There are currently no unresolved tickets requiring human intervention. All recent tickets were either auto-resolved or have not triggered escalation rules."
          icon={CheckCircle2}
        />
      ) : (
        <div className="space-y-4">
          {escalations.map((escalation) => (
            <EscalationCard
              key={escalation.id}
              escalation={escalation}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
};

