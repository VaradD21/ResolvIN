import React from 'react';
import { TicketEvent } from '../../types/ticket';
import {
  BrainCircuit,
  FileCheck2,
  Zap,
  MessageSquareReply,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface EventItemProps {
  event: TicketEvent;
  isLast?: boolean;
}

export const EventItem: React.FC<EventItemProps> = ({ event, isLast = false }) => {
  const { type, payload, createdAt } = event;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderEventContent = () => {
    switch (type) {
      case 'ticket_classified': {
        const confidencePct =
          typeof payload.confidence === 'number'
            ? Math.round(payload.confidence * 100)
            : null;

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800">Auto-Classified:</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded">
                {String(payload.category || 'UNKNOWN')}
              </span>
              {confidencePct !== null && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                  {confidencePct}% confidence
                </span>
              )}
            </div>

            {payload.extractedOrderId && (
              <div className="text-xs text-slate-600">
                <span className="font-medium text-slate-700">Order ID Extracted: </span>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">
                  {String(payload.extractedOrderId)}
                </code>
              </div>
            )}

            {payload.extractedIntent && (
              <div className="text-xs text-slate-600">
                <span className="font-medium text-slate-700">Intent: </span>
                <span>{String(payload.extractedIntent)}</span>
              </div>
            )}

            {payload.reasoning && (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                &ldquo;{String(payload.reasoning)}&rdquo;
              </p>
            )}
          </div>
        );
      }

      case 'policy_checked': {
        const isEligible = payload.eligible === true;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Policy Engine Evaluation:</span>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  isEligible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isEligible ? 'Eligible for Auto-Resolution' : 'Ineligible / Requires Human'}
              </span>
              {payload.action && (
                <span className="text-xs font-mono font-medium px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                  Action: {String(payload.action)}
                </span>
              )}
            </div>
            {payload.reason && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="font-medium text-slate-700">Rule Logic: </span>
                {String(payload.reason)}
              </p>
            )}
          </div>
        );
      }

      case 'action_taken': {
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Action Executed:</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded">
                {String(payload.action || 'COMPLETED')}
              </span>
            </div>
            {payload.reason && (
              <p className="text-xs text-slate-600">{String(payload.reason)}</p>
            )}
          </div>
        );
      }

      case 'replied': {
        return (
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-800 text-xs">Automated Reply Sent to Customer:</span>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md p-3 text-xs leading-relaxed font-sans shadow-xs">
              {String(payload.message || 'No reply text provided')}
            </div>
          </div>
        );
      }

      case 'escalated': {
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-rose-800">Ticket Escalated to Human Agent:</span>
            </div>
            {payload.reason && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-md p-3 text-xs leading-relaxed">
                <span className="font-semibold">Reason: </span>
                {String(payload.reason)}
              </div>
            )}
          </div>
        );
      }

      default: {
        return (
          <div className="text-xs text-slate-600">
            <div className="font-semibold text-slate-800 capitalize mb-1">
              {type.replace(/_/g, ' ')}
            </div>
            <pre className="bg-slate-50 p-2 rounded text-slate-700 text-2xs overflow-x-auto border border-slate-100">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        );
      }
    }
  };

  const getEventIcon = () => {
    switch (type) {
      case 'ticket_classified':
        return <BrainCircuit className="w-4 h-4 text-blue-600" />;
      case 'policy_checked':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'action_taken':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'replied':
        return <MessageSquareReply className="w-4 h-4 text-teal-600" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'ticket_classified':
        return 'border-blue-200 bg-blue-50/30';
      case 'policy_checked':
        return 'border-emerald-200 bg-emerald-50/30';
      case 'action_taken':
        return 'border-purple-200 bg-purple-50/30';
      case 'replied':
        return 'border-teal-200 bg-teal-50/30';
      case 'escalated':
        return 'border-rose-200 bg-rose-50/30';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  return (
    <div className="relative flex items-start gap-4 text-sm">
      {/* Timeline line connector */}
      {!isLast && (
        <span
          className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-200"
          aria-hidden="true"
        />
      )}

      {/* Icon node */}
      <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
        {getEventIcon()}
      </div>

      {/* Content Card */}
      <div className={`flex-1 rounded-lg border p-3.5 shadow-xs mb-4 ${getBorderColor()}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            {type.replace(/_/g, ' ')}
          </span>
          <span className="text-2xs text-slate-400 font-medium">
            {formatDate(createdAt)}
          </span>
        </div>
        {renderEventContent()}
      </div>
    </div>
  );
};
