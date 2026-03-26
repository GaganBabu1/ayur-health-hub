import { apiPost, setAuthToken, clearAuthToken } from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: 'patient' | 'doctor';
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  lifestyle?: string;
  sleepQuality?: number;
  diseaseHistory?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  age?: number;
  gender?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Storage keys
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

/**
 * Auth Service - Handles all authentication operations
 * Uses real HTTP calls via apiClient with automatic token management
 */
export const authService = {
  /**
   * Register a new user
   * Stores token and user in localStorage on success
   */
  register: async (data: SignupData): Promise<User> => {
    try {
      const response = await apiPost<AuthResponse>('/auth/register', data);

      if (response.token && response.user) {
        // Store token and user in localStorage
        setAuthToken(response.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }

      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Login with email and password
   * Stores token and user in localStorage on success
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await apiPost<AuthResponse>('/auth/login', credentials);

      if (response.token && response.user) {
        // Store token and user in localStorage
        setAuthToken(response.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }

      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Logout - Clear token and user from localStorage
   */
  logout: (): void => {
    clearAuthToken();
    localStorage.removeItem(AUTH_USER_KEY);
  },

  /**
   * Get current logged-in user from localStorage
   * Returns null if user is not logged in
   */
  getCurrentUser: (): User | null => {
    try {
      const userJson = localStorage.getItem(AUTH_USER_KEY);
      if (!userJson) {
        return null;
      }
      return JSON.parse(userJson) as User;
    } catch (error) {
      // If parsing fails, clear corrupted data
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  /**
   * Get current auth token from localStorage
   * Returns null if no token exists
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Check if user is authenticated
   * Returns true if valid token and user exist
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = localStorage.getItem(AUTH_USER_KEY);
    return !!(token && user);
  },

  /**
   * Get user role (patient, doctor, admin)
   * Returns null if not authenticated
   */
  getUserRole: (): 'patient' | 'doctor' | 'admin' | null => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },
};
