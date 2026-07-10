export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Helper to get the full API endpoint URL
 */
export const getApiUrl = (endpoint: string) => {
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${path}`;
};
