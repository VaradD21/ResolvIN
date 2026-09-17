/**
 * ResolveDesk central API Client
 * Configured via Vite environment variable VITE_API_BASE_URL.
 * Supports both web hosting and desktop webviews (Tauri).
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class ApiRequestError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Network failure';
    throw new ApiRequestError(`Failed to connect to backend at ${API_BASE_URL}: ${errorMsg}`, 0);
  }

  if (!response.ok) {
    let errorDetail: unknown = null;
    let message = `Request failed with status ${response.status} (${response.statusText})`;
    try {
      errorDetail = await response.json();
      if (typeof errorDetail === 'object' && errorDetail !== null) {
        if ('error' in errorDetail && typeof (errorDetail as Record<string, unknown>).error === 'string') {
          message = String((errorDetail as Record<string, unknown>).error);
        } else if ('message' in errorDetail && typeof (errorDetail as Record<string, unknown>).message === 'string') {
          message = String((errorDetail as Record<string, unknown>).message);
        }
      }
    } catch {
      // response is not JSON
    }
    throw new ApiRequestError(message, response.status, errorDetail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
