import { apiGet, apiPut } from './apiClient';

/**
 * Doctor Service - Real API Integration
 * Uses apiClient to make authenticated HTTP calls to backend doctor endpoints.
 * All endpoints require doctor role (JWT token validates this).
 */

// ============ DOCTOR INTERFACES ============

export interface DoctorUser {
  _id: string;
  name: string;
  email: string;
  role: 'doctor';
  phone?: string;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientUser {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
}

export interface Symptom {
  _id: string;
  name: string;
  category?: string;
}

export interface PredictedDisease {
  disease?: string;
  name: string;
  confidence: number;
}

export interface MentalState {
  stressLevel?: number;
  sleepQuality?: number;
  mood?: string;
}

export interface Consultation {
  _id: string;
  user: PatientUser;
  doctor?: DoctorUser | string;
  symptoms: Symptom[];
  mentalState?: MentalState;
  diseaseHistory?: string;
  oldTreatments?: string;
  predictedDiseases: PredictedDisease[];
  recommendedPlan?: {
    herbs?: string[];
    diet?: string[];
    lifestyle?: string[];
  };
  triageLevel: 'normal' | 'doctor' | 'urgent';
  status: 'pending' | 'review_pending' | 'completed';
  doctorNotes?: string;
  followUpRecommendation?: string;
  aiAssessment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFeedbackPayload {
  doctorNotes: string;
  followUpRecommendation?: string;
  status?: 'review_pending' | 'completed';
}

export interface DoctorProfile {
  doctor: DoctorUser;
  statistics: {
    totalConsultations: number;
    completedConsultations: number;
    pendingConsultations: number;
  };
}

export interface Appointment {
  _id: string;
  patient: string;
  doctor: string;
  date: string;
  timeSlot: string;
  reason?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// ============ CONSULTATION MANAGEMENT ============

/**
 * Get consultations for doctor (triage "doctor" or "urgent", or assigned to doctor)
 * GET /doctor/consultations
 */
export async function getConsultationsForDoctor(): Promise<Consultation[]> {
  return apiGet<Consultation[]>('/doctor/consultations');
}

/**
 * Add doctor feedback/notes to a consultation
 * PUT /doctor/consultations/${consultationId}/feedback
 */
export async function addFeedback(
  consultationId: string,
  payload: DoctorFeedbackPayload
): Promise<{
  message: string;
  consultation: Consultation;
}> {
  return apiPut<{
    message: string;
    consultation: Consultation;
  }>(`/doctor/consultations/${consultationId}/feedback`, payload);
}

// ============ DOCTOR PROFILE ============

/**
 * Get doctor profile and statistics
 * GET /doctor/profile
 */
export async function getDoctorProfile(): Promise<DoctorProfile> {
  return apiGet<DoctorProfile>('/doctor/profile');
}

// ============ DOCTOR APPOINTMENTS ============

/**
 * Get doctor's appointments
 * GET /appointments/doctor/list
 */
export async function getDoctorAppointments(): Promise<Appointment[]> {
  return apiGet<Appointment[]>('/appointments/doctor/list');
}

// ============ DOCTOR LISTING (For dropdowns) ============

/**
 * Get all doctors from the system (public endpoint)
 * GET /api/doctor/list
 */
export async function getDoctors(): Promise<DoctorUser[]> {
  return await apiGet<DoctorUser[]>('/doctor/list');
}

/**
 * Get all doctors for discovery page
 */
export async function getAllDoctors(): Promise<DoctorUser[]> {
  return await apiGet<DoctorUser[]>('/doctor/all');
}

// ============ LEGACY EXPORTS (For backward compatibility) ============

export const doctorService = {
  // Consultations
  getConsultationsForDoctor,
  addFeedback,

  // Profile
  getDoctorProfile,

  // Appointments
  getDoctorAppointments,

  // Doctors
  getDoctors,
  getAllDoctors,
};
