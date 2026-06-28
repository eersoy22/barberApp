import { useSupabase } from '../config/env.js';
import { ApiAppointmentRepository } from './ApiAppointmentRepository.js';
import { SupabaseAppointmentRepository } from './SupabaseAppointmentRepository.js';

/**
 * Composition Root helper — selects repository based on environment.
 * When Supabase env vars are set: Vercel (static)
 * Otherwise: local Express API (/api)
 */
export function createAppointmentRepository() {
  if (useSupabase()) {
    return SupabaseAppointmentRepository.getInstance();
  }
  return ApiAppointmentRepository.getInstance();
}
