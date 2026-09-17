import { useState, useEffect, useCallback } from 'react';
import { Brand } from '../types/brand';
import { getBrands, BrandsResult } from '../api/brandsApi';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [missingEndpoint, setMissingEndpoint] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: BrandsResult = await getBrands();
      setBrands(result.brands);
      setIsFallback(result.isFallback);
      setMissingEndpoint(result.missingEndpoint);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load brands';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { brands, loading, error, isFallback, missingEndpoint, refresh: fetchBrands };
}
