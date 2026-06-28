import { API_BASE_URL } from '../config/constants.js';
import { Appointment } from '../domain/Appointment.js';
import { IAppointmentRepository } from './IAppointmentRepository.js';

/**
 * GRASP — Pure Fabrication
 * Appointment access via SQLite API.
 */
export class ApiAppointmentRepository extends IAppointmentRepository {
  static #instance = null;

  static getInstance() {
    if (!ApiAppointmentRepository.#instance) {
      ApiAppointmentRepository.#instance = new ApiAppointmentRepository();
    }
    return ApiAppointmentRepository.#instance;
  }

  async #request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(errorBody.message || 'API request failed');
      error.status = response.status;
      error.code = errorBody.code;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  #toAppointments(data) {
    return data.map((item) => Appointment.fromJSON(item));
  }

  async findAll() {
    const data = await this.#request('/appointments');
    return this.#toAppointments(data);
  }

  async save(appointment) {
    await this.#request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment.toJSON()),
    });
  }

  async isSlotBooked(date, barberId, time) {
    const params = new URLSearchParams({ date, barberId, time });
    const data = await this.#request(`/appointments/slot-booked?${params}`);
    return Boolean(data.booked);
  }

  async findByCustomer(name, phone) {
    const params = new URLSearchParams({ name, phone });
    const data = await this.#request(`/appointments/by-customer?${params}`);
    return this.#toAppointments(data);
  }

  async findById(id) {
    try {
      const data = await this.#request(`/appointments/${encodeURIComponent(id)}`);
      return Appointment.fromJSON(data);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async deleteById(id) {
    await this.#request(`/appointments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async findByBarberId(barberId) {
    const data = await this.#request(`/appointments/by-barber/${encodeURIComponent(barberId)}`);
    return this.#toAppointments(data);
  }
}
