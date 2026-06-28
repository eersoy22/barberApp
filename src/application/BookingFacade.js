import { TIME_SLOTS, APP_EVENTS } from '../config/constants.js';
import { TimeSlot } from '../domain/TimeSlot.js';
import { AppointmentFactory } from '../patterns/AppointmentFactory.js';
import { EventBus } from '../patterns/EventBus.js';
import { i18n } from '../i18n/I18n.js';

/**
 * GRASP — Pure Fabrication
 * Müsaitlik hesaplama sorumluluğu.
 */
export class AvailabilityService {
  constructor(repository) {
    this.repository = repository;
  }

  async getTimeSlots(date, barberId) {
    if (!date || !barberId) return [];

    const slots = await Promise.all(
      TIME_SLOTS.map(async (time) => {
        const isBooked = await this.repository.isSlotBooked(date, barberId, time);
        return new TimeSlot(time, isBooked);
      }),
    );

    return slots;
  }

  async getAvailableCount(date, barberId) {
    const slots = await this.getTimeSlots(date, barberId);
    return slots.filter((slot) => slot.isAvailable).length;
  }
}

/**
 * GRASP — Controller (uygulama katmanı)
 * Randevu iş kurallarını yönetir.
 */
export class AppointmentService {
  constructor(repository, validator, eventBus = EventBus.getInstance()) {
    this.repository = repository;
    this.validator = validator;
    this.eventBus = eventBus;
  }

  async book(formData) {
    const validation = await this.validator.validate(formData);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const appointment = AppointmentFactory.createFromFormData(formData);

    try {
      await this.repository.save(appointment);
    } catch (error) {
      if (error.status === 409 || error.code === 'SLOT_TAKEN') {
        return { success: false, message: i18n.t('validation.slotTaken') };
      }
      throw error;
    }

    this.eventBus.publish(APP_EVENTS.APPOINTMENT_CREATED, appointment);
    this.eventBus.publish(APP_EVENTS.APPOINTMENTS_CHANGED, null);

    return { success: true, appointment };
  }

  async isSlotBooked(date, barberId, time) {
    return this.repository.isSlotBooked(date, barberId, time);
  }
}

/**
 * GRASP — Pure Fabrication
 * Randevu sorgulama iş kuralları.
 */
export class AppointmentLookupService {
  constructor(repository, validator, eventBus = EventBus.getInstance()) {
    this.repository = repository;
    this.validator = validator;
    this.eventBus = eventBus;
  }

  async findByCustomer(name, phone) {
    const validation = await this.validator.validate({ name, phone });
    if (!validation.valid) {
      return { success: false, message: validation.message, appointments: [] };
    }

    const appointments = await this.repository.findByCustomer(name, phone);
    return { success: true, appointments };
  }

  async cancel(id, name, phone) {
    const validation = await this.validator.validate({ name, phone });
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const appointment = await this.repository.findById(id);
    if (!appointment) {
      return { success: false, message: i18n.t('validation.appointmentNotFound') };
    }

    if (!appointment.matchesCustomer(name, phone)) {
      return { success: false, message: i18n.t('validation.cancelForbidden') };
    }

    await this.repository.deleteById(id);
    this.eventBus.publish(APP_EVENTS.APPOINTMENT_CANCELLED, appointment);
    this.eventBus.publish(APP_EVENTS.APPOINTMENTS_CHANGED, null);

    return { success: true, appointment };
  }
}

/**
 * GOF — Facade
 * UI katmanı için basitleştirilmiş randevu arayüzü.
 */
export class BookingFacade {
  constructor(appointmentService, availabilityService, lookupService = null) {
    this.appointmentService = appointmentService;
    this.availabilityService = availabilityService;
    this.lookupService = lookupService;
  }

  async createAppointment(formData) {
    return this.appointmentService.book(formData);
  }

  async getAvailableTimeSlots(date, barberId) {
    return this.availabilityService.getTimeSlots(date, barberId);
  }

  async getAvailableCount(date, barberId) {
    return this.availabilityService.getAvailableCount(date, barberId);
  }

  async getAvailabilityHint(date, barberId) {
    if (!date || !barberId) {
      return i18n.t('appointment.selectBarberDate');
    }

    const availableCount = await this.availabilityService.getAvailableCount(date, barberId);

    if (availableCount === 0) {
      return i18n.t('timeslot.noSlots');
    }

    return i18n.t('timeslot.available', { count: availableCount });
  }

  async lookupAppointments(name, phone) {
    if (!this.lookupService) {
      return { success: false, message: i18n.t('validation.lookupUnavailable'), appointments: [] };
    }
    return this.lookupService.findByCustomer(name, phone);
  }

  async cancelAppointment(id, name, phone) {
    if (!this.lookupService) {
      return { success: false, message: i18n.t('validation.cancelUnavailable') };
    }
    return this.lookupService.cancel(id, name, phone);
  }
}
