import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface BackendNoticeProps {
  endpoint: string;
  type?: 'warning' | 'info';
  message: string;
  className?: string;
}

export const BackendNotice: React.FC<BackendNoticeProps> = ({
  endpoint,
  type = 'warning',
  message,
  className = '',
}) => {
  const isWarning = type === 'warning';

  return (
    <div
      className={`rounded-lg border p-4 flex items-start gap-3 shadow-xs ${
        isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-sky-50 border-sky-200 text-sky-900'
      } ${className}`}
    >
      <div className="mt-0.5 shrink-0">
        {isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        ) : (
          <Info className="w-5 h-5 text-sky-600" />
        )}
      </div>
      <div className="text-sm flex-1">
        <div className="font-semibold flex items-center gap-2">
          <span>Backend Endpoint Notice:</span>
          <code className="px-1.5 py-0.5 text-xs bg-white/70 border border-amber-300/60 rounded font-mono font-bold">
            {endpoint}
          </code>
        </div>
        <p className="mt-1 opacity-90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
