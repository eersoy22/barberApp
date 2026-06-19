import { TIME_SLOTS, APP_EVENTS } from '../config/constants.js';
import { TimeSlot } from '../domain/TimeSlot.js';
import { AppointmentFactory } from '../patterns/AppointmentFactory.js';
import { EventBus } from '../patterns/EventBus.js';

/**
 * GRASP — Pure Fabrication
 * Müsaitlik hesaplama sorumluluğu.
 */
export class AvailabilityService {
  constructor(repository) {
    this.repository = repository;
  }

  getTimeSlots(date, barberId) {
    if (!date || !barberId) return [];

    return TIME_SLOTS.map((time) => {
      const isBooked = this.repository.isSlotBooked(date, barberId, time);
      return new TimeSlot(time, isBooked);
    });
  }

  getAvailableCount(date, barberId) {
    return this.getTimeSlots(date, barberId).filter((slot) => slot.isAvailable).length;
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

  book(formData) {
    const validation = this.validator.validate(formData);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const appointment = AppointmentFactory.createFromFormData(formData);
    this.repository.save(appointment);

    this.eventBus.publish(APP_EVENTS.APPOINTMENT_CREATED, appointment);
    this.eventBus.publish(APP_EVENTS.APPOINTMENTS_CHANGED, null);

    return { success: true, appointment };
  }

  isSlotBooked(date, barberId, time) {
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

  findByCustomer(name, phone) {
    const validation = this.validator.validate({ name, phone });
    if (!validation.valid) {
      return { success: false, message: validation.message, appointments: [] };
    }

    const appointments = this.repository.findByCustomer(name, phone);
    return { success: true, appointments };
  }

  cancel(id, name, phone) {
    const validation = this.validator.validate({ name, phone });
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const appointment = this.repository.findById(id);
    if (!appointment) {
      return { success: false, message: 'Randevu bulunamadı.' };
    }

    if (!appointment.matchesCustomer(name, phone)) {
      return { success: false, message: 'Bu randevuyu iptal etme yetkiniz yok.' };
    }

    this.repository.deleteById(id);
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

  createAppointment(formData) {
    return this.appointmentService.book(formData);
  }

  getAvailableTimeSlots(date, barberId) {
    return this.availabilityService.getTimeSlots(date, barberId);
  }

  getAvailabilityHint(date, barberId) {
    if (!date || !barberId) {
      return 'Önce berber ve tarih seçin.';
    }

    const availableCount = this.availabilityService.getAvailableCount(date, barberId);

    if (availableCount === 0) {
      return 'Bu berber için seçilen günde müsait saat kalmadı.';
    }

    return `${availableCount} müsait saat var. Dolu saatler seçilemez.`;
  }

  lookupAppointments(name, phone) {
    if (!this.lookupService) {
      return { success: false, message: 'Sorgulama servisi kullanılamıyor.', appointments: [] };
    }
    return this.lookupService.findByCustomer(name, phone);
  }

  cancelAppointment(id, name, phone) {
    if (!this.lookupService) {
      return { success: false, message: 'İptal servisi kullanılamıyor.' };
    }
    return this.lookupService.cancel(id, name, phone);
  }
}
