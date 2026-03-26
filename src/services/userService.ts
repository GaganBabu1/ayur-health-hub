/**
 * User Service - Handles user profile and health history operations
 * All functions use real HTTP calls via apiClient
 * Authentication is handled automatically by apiClient (JWT token injection)
 */

import { apiGet, apiPut } from './apiClient';

/**
 * User Profile interface
 * Represents the user's basic profile information
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  age?: number;
  gender?: string;
  height?: number; // in cm
  weight?: number; // in kg
  lifestyle?: string; // e.g., "Sedentary", "Moderate", "Active"
  sleepQuality?: number; // 1-10 scale
  chronicConditions?: string[];
  allergies?: string[];
  diseaseHistory?: string;
}

/**
 * Health History Entry interface
 * Represents a single health record snapshot
 */
export interface HealthHistoryEntry {
  _id?: string;
  date: string; // ISO date string
  weight?: number; // in kg
  activityLevel?: string; // "sedentary" | "moderate" | "active"
  sleepQuality?: number; // 1-10
  notes?: string;
  chronicConditions?: string[];
}

/**
 * Profile Update Data - Subset of UserProfile for updates
 */
export interface ProfileUpdateData {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  lifestyle?: string;
  sleepQuality?: number;
  chronicConditions?: string[];
  allergies?: string[];
  diseaseHistory?: string;
}

/**
 * User Service - Handles all user-related API calls
 */
export const userService = {
  /**
   * Get current user's profile
   * GET /user/profile
   * Returns: UserProfile object with all user data
   */
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiGet<UserProfile>('/user/profile');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update current user's profile
   * PUT /user/profile
   * Returns: Updated UserProfile object
   */
  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    try {
      const response = await apiPut<UserProfile>('/user/profile', data);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get user's health history
   * GET /user/health-history
   * Returns: Array of HealthHistoryEntry objects sorted by date
   */
  getHealthHistory: async (): Promise<HealthHistoryEntry[]> => {
    try {
      const response = await apiGet<HealthHistoryEntry[]>('/user/health-history');
      // Ensure it's an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health history';
      throw new Error(errorMessage);
    }
  },

  /**
   * Add a health history entry
   * POST /user/health-history
   * Returns: Created HealthHistoryEntry object
   */
  addHealthEntry: async (data: HealthHistoryEntry): Promise<HealthHistoryEntry> => {
    try {
      // Note: POST is imported as apiPost from apiClient
      const { apiPost } = await import('./apiClient');
      const response = await apiPost<HealthHistoryEntry>('/user/health-history', data);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add health entry';
      throw new Error(errorMessage);
    }
  },
};

export default userService;
