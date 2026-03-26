/**
 * API Client for E-Ayurvedic Frontend
 * 
 * FEATURES:
 * - Centralized API base URL configuration via VITE_API_BASE_URL
 * - Automatic JWT token injection from localStorage
 * - Request/Response interceptors for auth & error handling
 * - Auto-redirect to /login on 401 unauthorized
 * - Helper functions for GET, POST, PUT, DELETE, PATCH
 * - TypeScript generic typing for responses
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Simple GET request:
 *    const symptoms = await apiGet<Symptom[]>('/symptoms');
 * 
 * 2. POST with data:
 *    const response = await apiPost<AuthResponse>('/auth/login', {
 *      email: 'user@example.com',
 *      password: 'password'
 *    });
 *    setAuthToken(response.token); // Store token
 * 
 * 3. PUT/UPDATE:
 *    const updated = await apiPut<User>('/user/profile', { name: 'New Name' });
 * 
 * 4. DELETE:
 *    await apiDel('/appointments/123');
 * 
 * 5. Error handling:
 *    try {
 *      const result = await apiPost('/consultations', data);
 *    } catch (error) {
 *      console.error(error.message); // "At least one symptom is required"
 *    }
 * 
 * 6. Check if authenticated:
 *    if (isAuthenticated()) {
 *      // Show authenticated UI
 *    }
 */

/**
 * API Client for E-Ayurvedic Frontend
 * Handles:
 * - Centralized API base URL configuration
 * - JWT token management from localStorage
 * - Request/Response interceptors
 * - Error handling and 401 redirect
 * - Helper functions for GET, POST, PUT, DELETE
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'authToken';

/**
 * Generic fetch wrapper with interceptors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Request interceptor - Add authorization header if token exists
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Response interceptor - Handle different status codes
  if (response.status === 401) {
    // Clear auth on unauthorized
    localStorage.removeItem(AUTH_TOKEN_KEY);

    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }

    throw new Error('Unauthorized - Please login again');
  }

  if (!response.ok) {
    // Try to parse error response
    let errorMessage = `HTTP ${response.status}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData: any = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  // Parse and return successful response
  const data = await response.json();
  return data as T;
}

/**
 * Helper function for GET requests
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiGet = <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    ...options,
  });
};

/**
 * Helper function for POST requests
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiPost = <T = any>(
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  options?: RequestInit
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
};

/**
 * Helper function for PUT requests
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiPut = <T = any>(
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  options?: RequestInit
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
};

/**
 * Helper function for DELETE requests
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiDel = <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
};

/**
 * Helper function for PATCH requests
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiPatch = <T = any>(
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  options?: RequestInit
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Clear auth token from localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Export default client object for alternative usage
 */
export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDel,
  patch: apiPatch,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  isAuthenticated,
  baseURL: API_BASE_URL,
};

export default apiClient;
