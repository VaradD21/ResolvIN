import React from 'react';
import { TicketEvent } from '../../types/ticket';
import { EventItem } from './EventItem';
import { Activity, Clock } from 'lucide-react';

interface EventTimelineProps {
  events?: TicketEvent[];
  isLoading?: boolean;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
        Loading event timeline...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
        <Activity className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Events Logged Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Ticket events (classification, policy evaluation, action dispatch) are queued asynchronously on the backend.
          Click &ldquo;Refresh Ticket&rdquo; above to check for newly generated events.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pt-2">
      {events.map((event, index) => (
        <EventItem
          key={event.id || `${event.type}-${index}`}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
};
