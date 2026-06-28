import { getEnv } from '../config/env.js';
import { Appointment } from '../domain/Appointment.js';
import { DateUtils } from '../utils/DateUtils.js';
import { appointmentToRow, rowToAppointment } from '../utils/appointmentUtils.js';
import { IAppointmentRepository } from './IAppointmentRepository.js';

/**
 * GRASP — Pure Fabrication
 * Supabase (PostgreSQL) üzerinden randevu erişimi — Vercel/Netlify uyumlu.
 */
export class SupabaseAppointmentRepository extends IAppointmentRepository {
  static #instance = null;

  static getInstance() {
    if (!SupabaseAppointmentRepository.#instance) {
      SupabaseAppointmentRepository.#instance = new SupabaseAppointmentRepository();
    }
    return SupabaseAppointmentRepository.#instance;
  }

  constructor() {
    super();
    const env = getEnv();
    this.supabaseUrl = env.SUPABASE_URL.replace(/\/$/, '');
    this.anonKey = env.SUPABASE_ANON_KEY;
  }

  async #request(path, options = {}) {
    const response = await fetch(`${this.supabaseUrl}/rest/v1${path}`, {
      ...options,
      headers: {
        apikey: this.anonKey,
        Authorization: `Bearer ${this.anonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(errorBody.message || 'Supabase request failed');
      error.status = response.status;
      error.code = errorBody.code;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  #toAppointments(rows) {
    return rows.map((row) => Appointment.fromJSON(rowToAppointment(row)));
  }

  #filterActive(rows) {
    return rows.filter((row) => !DateUtils.isPastAppointment(row.date, row.time));
  }

  async findAll() {
    const data = await this.#request('/appointments?select=*&order=date.asc,time.asc');
    return this.#toAppointments(this.#filterActive(data));
  }

  async save(appointment) {
    try {
      await this.#request('/appointments', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(appointmentToRow(appointment.toJSON())),
      });
    } catch (error) {
      if (error.status === 409 || error.code === '23505') {
        const conflict = new Error('Slot already booked');
        conflict.status = 409;
        conflict.code = 'SLOT_TAKEN';
        throw conflict;
      }
      throw error;
    }
  }

  async isSlotBooked(date, barberId, time) {
    const params = new URLSearchParams({
      select: 'id',
      date: `eq.${date}`,
      barber_id: `eq.${barberId}`,
      time: `eq.${time}`,
      limit: '1',
    });
    const data = await this.#request(`/appointments?${params}`);
    return Array.isArray(data) && data.length > 0;
  }

  async findByCustomer(name, phone) {
    const data = await this.#request('/appointments?select=*&order=date.asc,time.asc');
    const normalizedName = Appointment.normalizeName(name);
    const normalizedPhone = Appointment.normalizePhone(phone);

    const matches = this.#filterActive(data).filter((row) => (
      Appointment.normalizeName(row.name) === normalizedName
      && Appointment.normalizePhone(row.phone) === normalizedPhone
    ));

    return this.#toAppointments(matches);
  }

  async findById(id) {
    const params = new URLSearchParams({
      select: '*',
      id: `eq.${id}`,
      limit: '1',
    });
    const data = await this.#request(`/appointments?${params}`);
    if (!Array.isArray(data) || data.length === 0) return null;

    const row = data[0];
    if (DateUtils.isPastAppointment(row.date, row.time)) return null;
    return Appointment.fromJSON(rowToAppointment(row));
  }

  async deleteById(id) {
    const params = new URLSearchParams({ id: `eq.${id}` });
    await this.#request(`/appointments?${params}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
  }

  async findByBarberId(barberId) {
    const params = new URLSearchParams({
      select: '*',
      barber_id: `eq.${barberId}`,
      order: 'date.asc,time.asc',
    });
    const data = await this.#request(`/appointments?${params}`);
    return this.#toAppointments(this.#filterActive(data));
  }
}
