/** Base URL for API (no trailing slash). Dev default `/api` uses Vite proxy → Django :8000. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim().replace(/\/$/, '');
  }
  return '/api';
}

export const getAuthToken = () => localStorage.getItem('auth_token');
export const setAuthToken = (token: string) => localStorage.setItem('auth_token', token);
export const removeAuthToken = () => localStorage.removeItem('auth_token');

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      if (errorData.detail) errorMessage = errorData.detail;
      else if (errorData.error) errorMessage = errorData.error;
      else if (typeof errorData === 'object') {
        errorMessage = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
      }
    } catch {
      errorMessage = text || errorMessage;
    }
    // Truncate extremely long messages (like HTML error pages)
    if (errorMessage.length > 500) errorMessage = errorMessage.substring(0, 500) + '... (truncated)';
    throw new Error(errorMessage);
  }

  if (response.status !== 204) {
    const data = await response.json();
    // Unwrap DRF paginated responses automatically
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    return data;
  }
}
