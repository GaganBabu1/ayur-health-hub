import { apiGet, apiPost, apiPut, apiDel } from './apiClient';

export interface ConsultationShare {
  _id: string;
  consultation: {
    _id: string;
    symptoms: { _id: string; name: string }[];
    predictedDiseases: { name: string; confidence: number }[];
  };
  sharedBy: {
    _id: string;
    name: string;
    email: string;
  };
  sharedWith: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export const consultationShareService = {
  /**
   * Share a consultation with a doctor
   */
  async shareConsultation(consultationId: string, doctorId: string, message: string = '') {
    return await apiPost(`/consultations/${consultationId}/share`, {
      doctorId,
      message,
    });
  },

  /**
   * Get consultations shared with me (for doctors)
   */
  async getSharedWithMe() {
    return await apiGet<ConsultationShare[]>('/consultation-share/shared-with-me');
  },

  /**
   * Get feedback from doctors (for patients)
   */
  async getFeedbackFromDoctors() {
    return await apiGet<ConsultationShare[]>('/consultation-share/feedback-from-doctors');
  },

  /**
   * Get consultations I've shared (for patients)
   */
  async getMyShares() {
    return await apiGet<ConsultationShare[]>('/consultation-share/my-shares');
  },

  /**
   * Accept a shared consultation (doctor)
   */
  async acceptShare(shareId: string) {
    return await apiPut(`/consultation-share/${shareId}/accept`, {});
  },

  /**
   * Reject a shared consultation (doctor)
   */
  async rejectShare(shareId: string) {
    return await apiPut(`/consultation-share/${shareId}/reject`, {});
  },

  /**
   * Share feedback with patient (doctor sharing review back)
   */
  async shareFeedbackWithPatient(shareId: string, message: string) {
    return await apiPut(`/consultation-share/${shareId}/feedback`, { message });
  },

  /**
   * Revoke a shared consultation (patient)
   */
  async revokeShare(shareId: string) {
    return await apiDel(`/consultation-share/${shareId}/revoke`);
  },
};
