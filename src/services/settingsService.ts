/**
 * Settings Service - Real API calls for user settings
 * Handles password changes, preferences, and account deletion
 */

import { apiPatch, apiDel } from './apiClient';

/**
 * Change password request payload
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update preferences request payload
 */
export interface UpdatePreferencesInput {
  emailNotifications?: boolean;
  appointmentReminders?: boolean;
  healthTips?: boolean;
  dataSharing?: boolean;
}

/**
 * User preferences response
 */
export interface UserPreferences {
  emailNotifications: boolean;
  appointmentReminders: boolean;
  healthTips: boolean;
  dataSharing: boolean;
}

/**
 * Delete account request payload
 */
export interface DeleteAccountInput {
  password: string;
}

/**
 * Change user password
 * PATCH /api/user/settings/password
 */
async function changePassword(data: ChangePasswordInput): Promise<{ message: string }> {
  try {
    const response = await apiPatch<{ message: string }>(
      '/user/settings/password',
      data
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to change password');
  }
}

/**
 * Update user preferences
 * PATCH /api/user/settings/preferences
 */
async function updatePreferences(data: UpdatePreferencesInput): Promise<{ message: string; preferences: UserPreferences }> {
  try {
    const response = await apiPatch<{ message: string; preferences: UserPreferences }>(
      '/user/settings/preferences',
      data
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to update preferences');
  }
}

/**
 * Delete user account permanently
 * DELETE /api/user/account
 */
async function deleteAccount(data: DeleteAccountInput): Promise<{ message: string }> {
  try {
    const response = await apiDel<{ message: string }>(
      '/user/account',
      {
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete account');
  }
}

/**
 * Export service object with all functions
 */
export const settingsService = {
  changePassword,
  updatePreferences,
  deleteAccount,
};
