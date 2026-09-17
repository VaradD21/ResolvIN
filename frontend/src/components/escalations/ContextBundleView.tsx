import React, { useState } from 'react';
import { ContextBundle } from '../../types/escalation';
import { CategoryBadge } from '../common/CategoryBadge';
import { FileText, Bot, Scale, ChevronDown, ChevronUp } from 'lucide-react';

interface ContextBundleViewProps {
  contextBundle: ContextBundle;
}

export const ContextBundleView: React.FC<ContextBundleViewProps> = ({ contextBundle }) => {
  const [showRawJson, setShowRawJson] = useState(false);

  const { classification, decision, body, subject } = contextBundle;

  const confidencePct =
    classification?.confidence !== undefined
      ? Math.round(Number(classification.confidence) * 100)
      : null;

  return (
    <div className="space-y-4 text-sm mt-3 pt-3 border-t border-slate-200">
      {/* Subject & Body excerpt if present */}
      {(subject || body) && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Original Customer Message
          </div>
          {subject && <div className="text-xs font-bold text-slate-800 mb-1">{subject}</div>}
          {body && (
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
              {body}
            </p>
          )}
        </div>
      )}

      {/* Two Column Layout: Classification vs Policy Decision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Classification Column */}
        <div className="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
            <Bot className="w-4 h-4 text-blue-600" />
            AI Classification Analysis
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Category:</span>
              <CategoryBadge category={classification?.category} />
            </div>

            {confidencePct !== null && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Confidence:</span>
                <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {confidencePct}%
                </span>
              </div>
            )}

            {classification?.extractedOrderId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Order ID:</span>
                <code className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-slate-800 font-bold">
                  {String(classification.extractedOrderId)}
                </code>
              </div>
            )}

            {classification?.extractedIntent && (
              <div className="pt-1">
                <span className="text-slate-600 font-medium block mb-0.5">Detected Intent:</span>
                <span className="text-slate-800 italic block bg-white/70 p-1.5 rounded border border-blue-100">
                  {String(classification.extractedIntent)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Policy Decision Column */}
        <div className="bg-amber-50/50 rounded-lg p-3.5 border border-amber-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4 text-amber-600" />
            Policy Engine Reasoning
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Policy Eligibility:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-2xs ${
                  decision?.eligible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {decision?.eligible ? 'ELIGIBLE' : 'INELIGIBLE (ESCALATE)'}
              </span>
            </div>

            {decision?.action && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Policy Action:</span>
                <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {String(decision.action)}
                </span>
              </div>
            )}

            {decision?.reason && (
              <div className="pt-1">
                <span className="text-slate-600 font-medium block mb-0.5">Reason for Human Review:</span>
                <div className="text-slate-800 bg-white/90 p-2 rounded border border-amber-200 leading-relaxed font-sans">
                  {String(decision.reason)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw JSON inspection toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowRawJson(!showRawJson)}
          className="inline-flex items-center gap-1 text-2xs font-mono text-slate-500 hover:text-slate-800 transition-colors"
        >
          {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{showRawJson ? 'Hide Raw Context Bundle' : 'Inspect Raw Context JSON'}</span>
        </button>
        {showRawJson && (
          <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg text-2xs overflow-x-auto font-mono">
            {JSON.stringify(contextBundle, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
