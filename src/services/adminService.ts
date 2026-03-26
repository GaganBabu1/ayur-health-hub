import { apiClient } from './apiClient';

/**
 * Admin Service - Real API Integration
 * Uses apiClient to make authenticated HTTP calls to backend admin endpoints.
 * All endpoints require admin role (JWT token validates this).
 */

// ============ USER INTERFACES ============

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  age?: number;
  gender?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Symptom {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Disease {
  _id: string;
  name: string;
  description?: string;
  symptoms: string[] | Symptom[];
  severityLevel?: 'mild' | 'moderate' | 'severe';
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  _id: string;
  disease: string | { _id: string; name: string; description: string };
  herbs?: string[];
  dietRecommendations?: string;
  lifestyleRecommendations?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  _id: string;
  user: { _id: string; name: string; email: string };
  doctor: { _id: string; name: string; email: string } | null;
  symptoms: string[];
  aiAssessment?: string;
  doctorNotes?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// ============ USER MANAGEMENT ============

/**
 * Get all users (excludes passwords)
 * GET /admin/users
 */
export async function getUsers(): Promise<User[]> {
  return apiClient.get<User[]>('/admin/users');
}

/**
 * Update user role
 * PUT /admin/users/${userId}/role
 */
export async function updateUserRole(userId: string, role: 'patient' | 'doctor' | 'admin'): Promise<User> {
  return apiClient.put<User>(`/admin/users/${userId}/role`, { role });
}

// ============ SYMPTOM MANAGEMENT ============

/**
 * Get all symptoms
 * GET /admin/symptoms
 */
export async function getSymptoms(): Promise<Symptom[]> {
  return apiClient.get<Symptom[]>('/admin/symptoms');
}

/**
 * Create a new symptom
 * POST /admin/symptoms
 */
export async function createSymptom(data: {
  name: string;
  category?: string;
  description?: string;
}): Promise<Symptom> {
  return apiClient.post<Symptom>('/admin/symptoms', data);
}

/**
 * Update a symptom
 * PUT /admin/symptoms/${id}
 */
export async function updateSymptom(
  id: string,
  data: Partial<{ name: string; category: string; description: string }>
): Promise<Symptom> {
  return apiClient.put<Symptom>(`/admin/symptoms/${id}`, data);
}

/**
 * Delete a symptom
 * DELETE /admin/symptoms/${id}
 */
export async function deleteSymptom(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/admin/symptoms/${id}`);
}

// ============ DISEASE MANAGEMENT ============

/**
 * Get all diseases with populated symptoms
 * GET /admin/diseases
 */
export async function getDiseases(): Promise<Disease[]> {
  return apiClient.get<Disease[]>('/admin/diseases');
}

/**
 * Create a new disease
 * POST /admin/diseases
 */
export async function createDisease(data: {
  name: string;
  description?: string;
  symptoms?: string[];
  severityLevel?: 'mild' | 'moderate' | 'severe';
}): Promise<Disease> {
  return apiClient.post<Disease>('/admin/diseases', data);
}

/**
 * Update a disease
 * PUT /admin/diseases/${id}
 */
export async function updateDisease(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    symptoms: string[];
    severityLevel: 'mild' | 'moderate' | 'severe';
  }>
): Promise<Disease> {
  return apiClient.put<Disease>(`/admin/diseases/${id}`, data);
}

/**
 * Delete a disease
 * DELETE /admin/diseases/${id}
 */
export async function deleteDisease(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/admin/diseases/${id}`);
}

// ============ TREATMENT MANAGEMENT ============

/**
 * Get all treatments with populated disease info
 * GET /admin/treatments
 */
export async function getTreatments(): Promise<Treatment[]> {
  return apiClient.get<Treatment[]>('/admin/treatments');
}

/**
 * Create a new treatment
 * POST /admin/treatments
 */
export async function createTreatment(data: {
  disease: string;
  herbs?: string[];
  dietRecommendations?: string;
  lifestyleRecommendations?: string;
  notes?: string;
}): Promise<Treatment> {
  return apiClient.post<Treatment>('/admin/treatments', data);
}

/**
 * Update a treatment
 * PUT /admin/treatments/${id}
 */
export async function updateTreatment(
  id: string,
  data: Partial<{
    disease: string;
    herbs: string[];
    dietRecommendations: string;
    lifestyleRecommendations: string;
    notes: string;
  }>
): Promise<Treatment> {
  return apiClient.put<Treatment>(`/admin/treatments/${id}`, data);
}

/**
 * Delete a treatment
 * DELETE /admin/treatments/${id}
 */
export async function deleteTreatment(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/admin/treatments/${id}`);
}

// ============ CONSULTATION MANAGEMENT ============

/**
 * Get all consultations (admin view)
 * GET /admin/consultations
 */
export async function getAllConsultations(): Promise<Consultation[]> {
  return apiClient.get<Consultation[]>('/admin/consultations');
}

// ============ ANALYTICS ============

/**
 * Get admin analytics and dashboard data
 * GET /admin/analytics
 */
export interface Analytics {
  totalUsers: number;
  totalConsultations: number;
  todayConsultations: number;
  triageLevels: {
    normal: number;
    needsDoctor: number;
    urgent: number;
  };
  topSymptoms: Array<{
    name: string;
    count: number;
  }>;
}

export async function getAnalytics(): Promise<Analytics> {
  try {
    // Try to fetch from backend first
    return await apiClient.get<Analytics>('/admin/analytics');
  } catch (error) {
    // Fallback: Calculate analytics from actual data
    console.warn('Backend analytics endpoint not available, calculating from data:', error);
    try {
      const [users, consultations] = await Promise.all([
        getUsers(),
        getAllConsultations(),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayConsultations = consultations.filter((c) => {
        const consultationDate = new Date(c.createdAt);
        consultationDate.setHours(0, 0, 0, 0);
        return consultationDate.getTime() === today.getTime();
      }).length;

      const triageLevels = {
        normal: consultations.filter((c) => c.triageLevel === 'Normal' || c.triageLevel === 'normal').length,
        needsDoctor: consultations.filter((c) => c.triageLevel === 'Needs Doctor Consultation' || c.triageLevel === 'doctor').length,
        urgent: consultations.filter((c) => c.triageLevel === 'Urgent' || c.triageLevel === 'urgent').length,
      };

      // Calculate top symptoms from consultations
      const symptomCounts: { [key: string]: number } = {};
      consultations.forEach((c) => {
        c.symptoms.forEach((symptom) => {
          // Handle both populated objects and ID strings
          const name = typeof symptom === 'string' ? symptom : (symptom.name || String(symptom));
          symptomCounts[name] = (symptomCounts[name] || 0) + 1;
        });
      });

      const topSymptoms = Object.entries(symptomCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalUsers: users.length,
        totalConsultations: consultations.length,
        todayConsultations,
        triageLevels,
        topSymptoms,
      };
    } catch (fallbackError) {
      // Final fallback: return empty data
      console.error('Failed to calculate analytics:', fallbackError);
      return {
        totalUsers: 0,
        totalConsultations: 0,
        todayConsultations: 0,
        triageLevels: {
          normal: 0,
          needsDoctor: 0,
          urgent: 0,
        },
        topSymptoms: [],
      };
    }
  }
}

// ============ LEGACY EXPORTS (For backward compatibility) ============

export const adminService = {
  // Users
  getUsers,
  updateUserRole,

  // Symptoms
  getSymptoms,
  createSymptom,
  updateSymptom,
  deleteSymptom,

  // Diseases
  getDiseases,
  createDisease,
  updateDisease,
  deleteDisease,

  // Treatments
  getTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,

  // Consultations
  getAllConsultations,

  // Analytics
  getAnalytics,
};
