/**
 * GOF — Strategy
 * Doğrulama algoritmalarını değiştirilebilir kılar.
 */
import { Appointment } from '../domain/Appointment.js';

export class ValidationStrategy {
  validate() {
    throw new Error('validate() implement edilmeli');
  }
}

export class RequiredFieldsValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.name?.trim()) {
      return { valid: false, message: 'Lütfen ad soyad girin.' };
    }
    if (!formData.phone?.trim()) {
      return { valid: false, message: 'Lütfen telefon numarası girin.' };
    }
    if (!formData.serviceId) {
      return { valid: false, message: 'Lütfen bir hizmet seçin.' };
    }
    if (!formData.barberId) {
      return { valid: false, message: 'Lütfen bir berber seçin.' };
    }
    if (!formData.date) {
      return { valid: false, message: 'Lütfen bir tarih seçin.' };
    }
    if (!formData.time) {
      return { valid: false, message: 'Lütfen müsait bir saat seçin.' };
    }
    return { valid: true };
  }
}

export class PhoneValidation extends ValidationStrategy {
  validate(formData) {
    if (!Appointment.isValidPhone(formData.phone)) {
      return {
        valid: false,
        message: 'Geçerli bir cep telefonu numarası girin (örn: 05XX XXX XX XX).',
      };
    }
    return { valid: true };
  }
}

export class ManualRequiredFieldsValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.name?.trim()) {
      return { valid: false, message: 'Lütfen müşteri adı girin.' };
    }
    if (!formData.serviceId) {
      return { valid: false, message: 'Lütfen bir hizmet seçin.' };
    }
    if (!formData.barberId) {
      return { valid: false, message: 'Lütfen bir berber seçin.' };
    }
    if (!formData.date) {
      return { valid: false, message: 'Lütfen bir tarih seçin.' };
    }
    if (!formData.time) {
      return { valid: false, message: 'Lütfen müsait bir saat seçin.' };
    }
    return { valid: true };
  }
}

export class OptionalPhoneValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.phone?.trim()) {
      return { valid: true };
    }

    if (!Appointment.isValidPhone(formData.phone)) {
      return {
        valid: false,
        message: 'Geçerli bir cep telefonu numarası girin (örn: 05XX XXX XX XX).',
      };
    }

    return { valid: true };
  }
}

export class SlotAvailabilityValidation extends ValidationStrategy {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  validate(formData) {
    const isBooked = this.repository.isSlotBooked(
      formData.date,
      formData.barberId,
      formData.time,
    );

    if (isBooked) {
      return {
        valid: false,
        message: 'Bu saat az önce dolmuş. Lütfen başka bir saat seçin.',
      };
    }

    return { valid: true };
  }
}

export class LookupFieldsValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.name?.trim()) {
      return { valid: false, message: 'Lütfen ad soyad girin.' };
    }
    if (!formData.phone?.trim()) {
      return { valid: false, message: 'Lütfen telefon numarası girin.' };
    }
    return { valid: true };
  }
}

/**
 * GOF — Composite
 * Birden fazla doğrulama stratejisini tek arayüzde birleştirir.
 */
export class CompositeValidator extends ValidationStrategy {
  constructor(strategies = []) {
    super();
    this.strategies = strategies;
  }

  add(strategy) {
    this.strategies.push(strategy);
  }

  validate(formData) {
    for (const strategy of this.strategies) {
      const result = strategy.validate(formData);
      if (!result.valid) return result;
    }
    return { valid: true };
  }
}
