import { SERVICE_LABELS, BARBER_LABELS } from '../config/constants.js';
import { Appointment } from '../domain/Appointment.js';

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
      service: SERVICE_LABELS[formData.serviceId],
      barberId,
      barber: BARBER_LABELS[barberId],
      date: formData.date,
      time: formData.time,
      note: formData.note?.trim() ?? '',
      createdAt: new Date().toISOString(),
    });
  }
}
