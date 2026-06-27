import { BARBER_LABELS } from '../config/constants.js';
import { Appointment } from '../domain/Appointment.js';
import { i18n } from '../i18n/I18n.js';

/**
 * GOF — Factory Method
 * GRASP — Creator (Appointment nesnesini oluşturma sorumluluğu)
 */
export class AppointmentFactory {
  static createFromFormData(formData) {
    const barberId = formData.barberId;

    return new Appointment({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: formData.name.trim(),
      phone: formData.phone?.trim() ?? '',
      serviceId: formData.serviceId,
      service: i18n.getServiceLabel(formData.serviceId),
      barberId,
      barber: BARBER_LABELS[barberId],
      date: formData.date,
      time: formData.time,
      note: formData.note?.trim() ?? '',
      createdAt: new Date().toISOString(),
    });
  }
}
