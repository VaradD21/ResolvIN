import { request, ApiRequestError } from './client';
import { Brand } from '../types/brand';
import { FALLBACK_BRANDS } from '../constants/mockData';

export interface BrandsResult {
  brands: Brand[];
  isFallback: boolean;
  missingEndpoint: boolean;
}

export async function getBrands(): Promise<BrandsResult> {
  try {
    const data = await request<Brand[]>('/brands');
    if (Array.isArray(data) && data.length > 0) {
      return { brands: data, isFallback: false, missingEndpoint: false };
    }
    // Empty backend response, provide fallback brands
    return { brands: FALLBACK_BRANDS, isFallback: true, missingEndpoint: false };
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 404 || err.status === 405)) {
      // Endpoint doesn't exist yet on backend
      return {
        brands: FALLBACK_BRANDS,
        isFallback: true,
        missingEndpoint: true,
      };
    }
    // Fallback on network or connection errors too so form remains usable
    return {
      brands: FALLBACK_BRANDS,
      isFallback: true,
      missingEndpoint: false,
    };
  }
}
