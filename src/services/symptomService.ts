// Real API symptom service

import { apiGet, apiPost, apiPut, apiDel } from './apiClient';

export interface Symptom {
  _id: string;
  id?: string;
  name: string;
  category: string;
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export const symptomService = {
  getSymptoms: async (): Promise<Symptom[]> => {
    try {
      const response = await apiGet<Symptom[]>('/admin/symptoms');
      // Map _id to id for compatibility
      return response.map(s => ({ ...s, id: s._id }));
    } catch (error) {
      console.error('Failed to load symptoms:', error);
      throw error;
    }
  },

  getSymptomById: async (id: string): Promise<Symptom | null> => {
    try {
      const response = await apiGet<Symptom>(`/admin/symptoms/${id}`);
      return { ...response, id: response._id };
    } catch (error) {
      console.error('Failed to load symptom:', error);
      return null;
    }
  },

  getSymptomsByCategory: async (category: string): Promise<Symptom[]> => {
    try {
      const symptoms = await apiGet<Symptom[]>('/admin/symptoms');
      return symptoms
        .filter(s => s.category === category)
        .map(s => ({ ...s, id: s._id }));
    } catch (error) {
      console.error('Failed to load symptoms by category:', error);
      return [];
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const symptoms = await apiGet<Symptom[]>('/admin/symptoms');
      return [...new Set(symptoms.map(s => s.category))];
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  },

  // Admin functions
  addSymptom: async (symptom: Omit<Symptom, '_id' | 'id'>): Promise<Symptom> => {
    try {
      const response = await apiPost<Symptom>('/admin/symptoms', symptom);
      return { ...response, id: response._id };
    } catch (error) {
      console.error('Failed to add symptom:', error);
      throw error;
    }
  },

  updateSymptom: async (id: string, data: Partial<Symptom>): Promise<Symptom | null> => {
    try {
      const response = await apiPut<Symptom>(`/admin/symptoms/${id}`, data);
      return { ...response, id: response._id };
    } catch (error) {
      console.error('Failed to update symptom:', error);
      return null;
    }
  },

  deleteSymptom: async (id: string): Promise<boolean> => {
    try {
      await apiDel(`/admin/symptoms/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete symptom:', error);
      return false;
    }
  },
};

