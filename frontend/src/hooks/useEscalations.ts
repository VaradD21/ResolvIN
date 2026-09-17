import { useState, useEffect, useCallback } from 'react';
import { Escalation } from '../types/escalation';
import { getUnresolvedEscalations } from '../api/escalationsApi';

export function useEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnresolvedEscalations();
      setEscalations(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch escalations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEscalations();
  }, [fetchEscalations]);

  return {
    escalations,
    loading,
    error,
    refresh: fetchEscalations,
    unresolvedCount: escalations.length,
  };
}
