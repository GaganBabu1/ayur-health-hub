/**
 * Appointment Service - Real API calls with backend
 * Handles appointment CRUD operations for patients and doctors
 */

import { apiGet, apiPost, apiPut } from './apiClient';

/**
 * Doctor information in appointment
 */
export interface DoctorInfo {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
}

/**
 * Patient information in appointment
 */
export interface PatientInfo {
  _id: string;
  name: string;
  email: string;
}

/**
 * Appointment data from backend
 */
export interface Appointment {
  _id: string;
  patient: PatientInfo | string;
  doctor: DoctorInfo | string;
  date: string; // ISO date string
  timeSlot: string; // e.g. "10:00–10:30"
  reason?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
}

/**
 * Create appointment request payload
 */
export interface CreateAppointmentInput {
  doctor: string; // Doctor ID
  date: string; // ISO date string
  timeSlot: string; // e.g. "10:00–10:30"
  reason?: string;
}

/**
 * Get my appointments response
 */
export interface MyAppointmentsResponse {
  upcoming: Appointment[];
  past: Appointment[];
  totalAppointments: number;
  upcomingCount: number;
  pastCount: number;
}

/**
 * Create a new appointment
 */
async function createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
  try {
    const response = await apiPost<{ appointment: Appointment }>(
      '/appointments',
      data
    );
    return response.appointment;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to create appointment');
  }
}

/**
 * Get all appointments for the current logged-in patient
 * Returns both upcoming and past appointments
 */
async function getMyAppointments(): Promise<MyAppointmentsResponse> {
  try {
    const response = await apiGet<MyAppointmentsResponse>('/appointments/my');
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to load appointments');
  }
}

/**
 * Cancel a specific appointment
 * Only works for appointments owned by the patient
 */
async function cancelAppointment(id: string): Promise<Appointment> {
  try {
    const response = await apiPut<{ appointment: Appointment }>(
      `/appointments/${id}/cancel`,
      {}
    );
    return response.appointment;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to cancel appointment');
  }
}

/**
 * Get all appointments for the logged-in doctor
 * Used in doctor dashboard
 */
async function getDoctorAppointments(): Promise<Appointment[]> {
  try {
    const response = await apiGet<Appointment[]>('/appointments/doctor/list');
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to load doctor appointments');
  }
}

/**
 * Export service object with all functions
 */
export const appointmentService = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
};
