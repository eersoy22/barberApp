import { BARBER_LABELS } from '../config/constants.js';

/**
 * GRASP — Information Expert
 * Carries appointment conflict information.
 */
export class Appointment {
  constructor({
    id,
    name,
    phone,
    serviceId,
    service,
    barberId,
    barber,
    date,
    time,
    note = '',
    createdAt,
  }) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.serviceId = serviceId;
    this.service = service;
    this.barberId = barberId;
    this.barber = barber;
    this.date = date;
    this.time = time;
    this.note = note;
    this.createdAt = createdAt;
  }

  getBarberId() {
    if (this.barberId) return this.barberId;

    const entry = Object.entries(BARBER_LABELS).find(([, name]) => name === this.barber);
    return entry ? entry[0] : null;
  }

  getSlotKey() {
    return `${this.date}|${this.getBarberId()}|${this.time}`;
  }

  conflictsWith(date, barberId, time) {
    return this.date === date
      && this.getBarberId() === barberId
      && this.time === time;
  }

  static normalizeName(name) {
    if (!name) return '';
    return name.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
  }

  static normalizePhone(phone) {
    if (!phone) return '';

    let digits = String(phone).replace(/\D/g, '');

    if (digits.startsWith('90') && digits.length >= 12) {
      digits = digits.slice(2);
    }

    if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.slice(1);
    }

    if (digits.length >= 10) {
      return digits.slice(-10);
    }

    return digits;
  }

  static isValidPhone(phone) {
    const normalized = Appointment.normalizePhone(phone);
    return /^5\d{9}$/.test(normalized);
  }

  matchesCustomer(name, phone) {
    return Appointment.normalizeName(this.name) === Appointment.normalizeName(name)
      && Appointment.normalizePhone(this.phone) === Appointment.normalizePhone(phone);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      serviceId: this.serviceId,
      service: this.service,
      barberId: this.barberId,
      barber: this.barber,
      date: this.date,
      time: this.time,
      note: this.note,
      createdAt: this.createdAt,
    };
  }

  static fromJSON(data) {
    return new Appointment(data);
  }
}
