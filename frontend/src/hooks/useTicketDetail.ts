import { useState, useEffect, useCallback } from 'react';
import { TicketDetail } from '../types/ticket';
import { getTicket } from '../api/ticketsApi';

export function useTicketDetail(ticketId: number | null) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId || isNaN(ticketId)) {
      setError('Invalid ticket ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve ticket';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, loading, error, refresh: fetchTicket };
}
