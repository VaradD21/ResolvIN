import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Escalation, ResolutionActionType, ResolveEscalationRequest } from '../../types/escalation';
import { ContextBundleView } from './ContextBundleView';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface EscalationCardProps {
  escalation: Escalation;
  onResolve?: (id: number, payload: ResolveEscalationRequest) => Promise<void>;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({ escalation, onResolve }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolvedBy, setResolvedBy] = useState('Support Agent');
  const [submittingAction, setSubmittingAction] = useState<ResolutionActionType | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const { id, ticketId, reason, subject, customerEmail, contextBundle, createdAt } =
    escalation;

  const category = contextBundle?.classification?.category;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
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

  const policyReason =
    contextBundle?.decision?.reason ||
    contextBundle?.decision?.action ||
    'Policy evaluation flagged ticket for manual inspection';

  const handleAction = async (action: ResolutionActionType) => {
    if (!onResolve) return;
    setSubmittingAction(action);
    setCardError(null);
    try {
      await onResolve(id, {
        resolutionAction: action,
        resolutionNote: resolutionNote.trim() || undefined,
        resolvedBy: resolvedBy.trim() || 'Support Agent',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resolve escalation';
      setCardError(msg);
    } finally {
      setSubmittingAction(null);
    }
  };

  // Determine which approval buttons make sense based on classification
  const showRefund = !category || category === 'RETURN' || category === 'REFUND_STATUS';
  const showExchange = !category || category === 'EXCHANGE' || category === 'RETURN';
  const showCancel = !category || category === 'CANCELLATION';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden">
      {/* Header section: Click to toggle expansion */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Top row: Escalation ID, Ticket reference, and timestamp */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3" />
                Escalation #{id}
              </span>
              <span className="text-slate-400">•</span>
              <Link
                to={`/tickets/${ticketId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium hover:underline"
              >
                Ticket #{ticketId}
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatDate(createdAt)}
              </span>
            </div>

            {/* Subject */}
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {subject || `Support Ticket #${ticketId}`}
            </h3>

            {/* Customer email */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium">{customerEmail}</span>
            </div>
          </div>

          {/* Expand / Collapse Icon */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              {isExpanded ? 'Collapse' : 'Inspect Context'}
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Highlighted Reason Callout */}
        <div className="mt-3.5 bg-rose-50/70 border-l-4 border-rose-500 p-3 rounded-r-md text-xs">
          <div className="font-bold text-rose-950 flex items-center gap-1.5 mb-1">
            <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Escalation Trigger:</span>
          </div>
          <p className="text-rose-900 font-medium leading-relaxed">{reason}</p>
          {policyReason && policyReason !== reason && (
            <p className="text-slate-600 mt-1 pt-1 border-t border-rose-200/60 font-normal">
              <span className="font-semibold text-slate-700">Policy Context:</span> {policyReason}
            </p>
          )}
        </div>
      </div>

      {/* Action Resolution Form */}
      {onResolve && (
        <div className="px-4 py-3 sm:px-5 bg-slate-50/60 border-t border-slate-200">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="sm:w-1/3">
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Operator Name
                </label>
                <input
                  type="text"
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                  disabled={submittingAction !== null}
                  placeholder="e.g. Agent Sarah"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800 disabled:bg-slate-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Resolution Note (Optional)
                </label>
                <input
                  type="text"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  disabled={submittingAction !== null}
                  placeholder="e.g. Customer provided valid photo proof / granted exception"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md shadow-2xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800 disabled:bg-slate-100"
                />
              </div>
            </div>

            {cardError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span>{cardError}</span>
              </div>
            )}

            {/* Resolution Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Take Action:
              </span>

              {showRefund && (
                <button
                  type="button"
                  onClick={() => handleAction('APPROVED_REFUND')}
                  disabled={submittingAction !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md shadow-2xs transition-colors disabled:opacity-50"
                >
                  {submittingAction === 'APPROVED_REFUND' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  Approve Refund
                </button>
              )}

              {showExchange && (
                <button
                  type="button"
                  onClick={() => handleAction('APPROVED_EXCHANGE')}
                  disabled={submittingAction !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md shadow-2xs transition-colors disabled:opacity-50"
                >
                  {submittingAction === 'APPROVED_EXCHANGE' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  Approve Exchange
                </button>
              )}

              {showCancel && (
                <button
                  type="button"
                  onClick={() => handleAction('APPROVED_CANCEL')}
                  disabled={submittingAction !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md shadow-2xs transition-colors disabled:opacity-50"
                >
                  {submittingAction === 'APPROVED_CANCEL' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  Approve Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAction('DENIED')}
                disabled={submittingAction !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md shadow-2xs transition-colors disabled:opacity-50"
              >
                {submittingAction === 'DENIED' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                Deny Request
              </button>

              <button
                type="button"
                onClick={() => handleAction('NEEDS_MORE_INFO')}
                disabled={submittingAction !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md shadow-2xs transition-colors disabled:opacity-50"
              >
                {submittingAction === 'NEEDS_MORE_INFO' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                Needs More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Details: Full Context Bundle */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 border-t border-slate-100 bg-slate-50/30">
          <ContextBundleView contextBundle={contextBundle} />
        </div>
      )}
    </div>
  );
};

