import { useState, useEffect, useCallback } from 'react';
import { TicketSummary } from '../types/ticket';
import { listTickets, TicketsListResult } from '../api/ticketsApi';

export function useTickets(page = 0, size = 10) {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStubbed, setIsStubbed] = useState(false);
  const [missingEndpoint, setMissingEndpoint] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: TicketsListResult = await listTickets(page, size);
      setTickets(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setIsStubbed(result.isStubbed);
      setMissingEndpoint(result.missingEndpoint);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    totalElements,
    totalPages,
    loading,
    error,
    isStubbed,
    missingEndpoint,
    refresh: fetchTickets,
  };
}
