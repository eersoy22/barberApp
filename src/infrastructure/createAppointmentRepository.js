import { useSupabase } from '../config/env.js';
import { ApiAppointmentRepository } from './ApiAppointmentRepository.js';
import { SupabaseAppointmentRepository } from './SupabaseAppointmentRepository.js';

/**
 * Composition Root helper — ortama göre repository seçer.
 * Supabase env varsa: Vercel/Netlify (statik)
 * Yoksa: yerel Express API (/api)
 */
export function createAppointmentRepository() {
  if (useSupabase()) {
    return SupabaseAppointmentRepository.getInstance();
  }
  return ApiAppointmentRepository.getInstance();
}
