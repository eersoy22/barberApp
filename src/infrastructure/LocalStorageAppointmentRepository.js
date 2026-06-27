import { STORAGE_KEY, BARBER_LABELS } from '../config/constants.js';
import { Appointment } from '../domain/Appointment.js';
import { DateUtils } from '../utils/DateUtils.js';
import { IAppointmentRepository } from './IAppointmentRepository.js';

const LEGACY_BARBER_ID_MAP = {
  ahmet: 'mehmet',
  can: 'ramazan',
};

const LEGACY_BARBER_NAME_MAP = {
  'Ahmet Yılmaz': 'mehmet',
  'Mehmet Kaya': 'mehmet',
  'Can Demir': 'ramazan',
};

/**
 * GOF — Singleton
 * GRASP — Pure Fabrication (depolama erişim sorumluluğu)
 */
export class LocalStorageAppointmentRepository extends IAppointmentRepository {
  static #instance = null;

  static getInstance() {
    if (!LocalStorageAppointmentRepository.#instance) {
      LocalStorageAppointmentRepository.#instance = new LocalStorageAppointmentRepository();
    }
    return LocalStorageAppointmentRepository.#instance;
  }

  #readAll() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let migrated = false;

      const parsed = raw
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
        if (!item.id) {
          migrated = true;
          item.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
        }

        item.phone = item.phone ?? '';
        item.name = item.name ?? '';
        item.date = item.date ?? '';
        item.time = item.time ?? '';

        if (item.barberId && LEGACY_BARBER_ID_MAP[item.barberId]) {
          migrated = true;
          item.barberId = LEGACY_BARBER_ID_MAP[item.barberId];
          item.barber = BARBER_LABELS[item.barberId];
        } else if (!item.barberId && LEGACY_BARBER_NAME_MAP[item.barber]) {
          migrated = true;
          item.barberId = LEGACY_BARBER_NAME_MAP[item.barber];
          item.barber = BARBER_LABELS[item.barberId];
        } else if (item.barberId && BARBER_LABELS[item.barberId]) {
          item.barber = BARBER_LABELS[item.barberId];
        }

        return Appointment.fromJSON(item);
      });

      const appointments = parsed.filter((appointment) => appointment.date && appointment.time);
      if (appointments.length !== parsed.length) {
        migrated = true;
      }

      if (migrated) {
        this.#persist(appointments);
      }

      return appointments;
    } catch {
      return [];
    }
  }

  #persist(appointments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments.map((a) => a.toJSON())));
  }

  #removePast(appointments) {
    return appointments.filter(
      (appointment) => !DateUtils.isPastAppointment(appointment.date, appointment.time),
    );
  }

  #getActiveAppointments() {
    const appointments = this.#readAll();
    const active = this.#removePast(appointments);

    if (active.length !== appointments.length) {
      this.#persist(active);
    }

    return active;
  }

  findAll() {
    return this.#getActiveAppointments();
  }

  save(appointment) {
    const appointments = this.#getActiveAppointments();
    appointments.push(appointment);
    this.#persist(appointments);
  }

  isSlotBooked(date, barberId, time) {
    return this.findAll().some((appointment) => appointment.conflictsWith(date, barberId, time));
  }

  findByCustomer(name, phone) {
    return this.findAll()
      .filter((appointment) => appointment.matchesCustomer(name, phone))
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
  }

  findById(id) {
    return this.findAll().find((appointment) => appointment.id === id) ?? null;
  }

  deleteById(id) {
    const appointments = this.findAll().filter((appointment) => appointment.id !== id);
    this.#persist(appointments);
  }

  findByBarberId(barberId) {
    return this.findAll()
      .filter((appointment) => appointment.getBarberId() === barberId)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
  }
}
