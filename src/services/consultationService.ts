/**
 * Consultation Service - Real API calls with backend
 * Handles consultation CRUD operations with AI-powered disease prediction
 */

import { apiGet, apiPost, apiPut } from './apiClient';

/**
 * Input for creating a consultation
 */
export interface ConsultationInput {
  symptomIds: string[];
  mentalState?: {
    stressLevel?: number;
    sleepQuality?: number;
    mood?: string;
  };
  diseaseHistory?: string;
  oldTreatments?: string;
}

/**
 * AI Recommendation from backend
 */
export interface AIRecommendation {
  herbs?: string[];
  diet?: string[];
  lifestyle?: string[];
}

/**
 * Predicted disease/condition
 */
export interface PredictedDisease {
  disease?: string;
  name: string;
  confidence: number;
}

/**
 * Consultation from backend
 */
export interface Consultation {
  _id: string;
  user: string;
  symptoms: Array<string | { _id: string; name: string }>;
  mentalState?: {
    stressLevel?: number;
    sleepQuality?: number;
    mood?: string;
  };
  diseaseHistory?: string;
  oldTreatments?: string;
  predictedDiseases: PredictedDisease[];
  recommendedPlan?: AIRecommendation;
  triageLevel: 'Normal' | 'Needs Doctor Consultation' | 'Urgent' | 'normal' | 'doctor' | 'urgent';
  status: 'pending' | 'completed' | 'reviewed';
  doctor?: string;
  doctorNotes?: string;
  patientNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new consultation with symptoms and health information
 * AI service on backend analyzes and provides Ayurvedic recommendations
 */
async function createConsultation(payload: ConsultationInput): Promise<Consultation> {
  try {
    console.log('📤 Sending consultation create request:', payload);
    
    // Make the actual API call and log response details
    const response = await apiPost<any>('/consultations', payload);
    
    console.log('📥 Received consultation response');
    console.log('  Type:', typeof response);
    console.log('  Is Array:', Array.isArray(response));
    console.log('  Keys:', Object.keys(response || {}).join(', '));
    console.log('  _id field:', response?._id);
    console.log('  id field:', response?.id);
    console.log('  user field:', response?.user);
    console.log('  Full object:', JSON.stringify(response, null, 2));
    
    // Validate and ensure _id exists
    if (!response?._id) {
      console.error('⚠️  WARNING: Response missing _id!');
      // Try fallback fields
      if (response?.id) {
        response._id = response.id;
        console.log('  Using fallback: id →_id');
      }
    }
    
    return response as Consultation;
  } catch (error) {
    console.error('❌ Error creating consultation:', error);
    throw error instanceof Error ? error : new Error('Failed to create consultation');
  }
}

/**
 * Get all consultations for the current logged-in user
 */
async function getMyConsultations(): Promise<Consultation[]> {
  try {
    const response = await apiGet<Consultation[]>('/consultations/my');
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to load consultations');
  }
}

/**
 * Get a specific consultation by ID
 */
async function getConsultationById(id: string): Promise<Consultation> {
  try {
    const response = await apiGet<Consultation>(`/consultations/${id}`);
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to load consultation');
  }
}

/**
 * Get all consultations (admin only)
 */
async function getAllConsultations(): Promise<Consultation[]> {
  try {
    const response = await apiGet<Consultation[]>('/consultations');
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to load consultations');
  }
}

/**
 * Get recent consultations (admin only) - limited to N consultations
 */
async function getRecentConsultations(limit: number = 5): Promise<Consultation[]> {
  try {
    const response = await apiGet<Consultation[]>(`/consultations?limit=${limit}`);
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to load recent consultations');
  }
}

/**
 * Add patient notes to a consultation
 * Note: Backend endpoint may not exist yet - will show placeholder message
 */
async function addPatientNotes(id: string, notes: string): Promise<Consultation> {
  try {
    const response = await apiPut<Consultation>(`/consultations/${id}/patient-notes`, { notes });
    return response;
  } catch (error) {
    // If endpoint doesn't exist, show helpful message
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error('Backend endpoint for patient notes not implemented yet. Contact admin.');
    }
    throw error instanceof Error ? error : new Error('Failed to save notes');
  }
}

/**
 * Share consultation with a doctor and optionally send a message
 * Note: Backend endpoint may not exist yet - will show placeholder message
 */
async function shareWithDoctor(consultationId: string, doctorId: string, message?: string): Promise<Consultation> {
  try {
    const response = await apiPost<Consultation>(`/consultations/${consultationId}/share`, {
      doctorId,
      message: message || '',
    });
    return response;
  } catch (error) {
    // If endpoint doesn't exist, show helpful message
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error('Backend endpoint for sharing with doctor not implemented yet. Contact admin.');
    }
    throw error instanceof Error ? error : new Error('Failed to share consultation');
  }
}

/**
 * Export service object with all functions
 */
export const consultationService = {
  createConsultation,
  getMyConsultations,
  getConsultationById,
  getAllConsultations,
  getRecentConsultations,
  addPatientNotes,
  shareWithDoctor,
};
