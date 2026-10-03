import React, { useState } from 'react';
import { ServerOff, RefreshCw, AlertCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';

interface BackendUnreachableStateProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const BackendUnreachableState: React.FC<BackendUnreachableStateProps> = ({
  error,
  onRetry,
  isRetrying = false,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-lg flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Backend currently offline ({API_BASE_URL}). Using local cached/preview mode.
        </span>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="underline hover:text-amber-900 font-semibold cursor-pointer"
        >
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-rose-100 text-rose-600 mt-0.5 shrink-0">
            <ServerOff className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-900">
              Backend Service Unreachable
            </h3>
            <p className="text-xs text-rose-700 leading-relaxed max-w-2xl">
              ResolveDesk desktop shell cannot reach the API service at{' '}
              <code className="px-1.5 py-0.5 rounded bg-rose-100 font-mono font-medium text-rose-800">
                {API_BASE_URL}
              </code>
              . Verify that the Spring Boot backend server is active and accessible.
            </p>
            {error && (
              <p className="text-[11px] text-rose-600/90 font-mono mt-1">
                Details: {error}
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 active:scale-98 transition disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Reconnecting...' : 'Retry Connection'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
              >
                Dismiss &amp; browse offline preview
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
