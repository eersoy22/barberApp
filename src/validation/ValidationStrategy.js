/**
 * GOF — Strategy
 * Doğrulama algoritmalarını değiştirilebilir kılar.
 */
import { Appointment } from '../domain/Appointment.js';
import { i18n } from '../i18n/I18n.js';

export class ValidationStrategy {
  validate() {
    throw new Error('validate() implement edilmeli');
  }
}

export class RequiredFieldsValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.name?.trim()) {
      return { valid: false, message: i18n.t('validation.nameRequired') };
    }
    if (!formData.phone?.trim()) {
      return { valid: false, message: i18n.t('validation.phoneRequired') };
    }
    if (!formData.serviceId) {
      return { valid: false, message: i18n.t('validation.serviceRequired') };
    }
    if (!formData.barberId) {
      return { valid: false, message: i18n.t('validation.barberRequired') };
    }
    if (!formData.date) {
      return { valid: false, message: i18n.t('validation.dateRequired') };
    }
    if (!formData.time) {
      return { valid: false, message: i18n.t('validation.timeRequired') };
    }
    return { valid: true };
  }
}

export class PhoneValidation extends ValidationStrategy {
  validate(formData) {
    if (!Appointment.isValidPhone(formData.phone)) {
      return { valid: false, message: i18n.t('validation.phoneInvalid') };
    }
    return { valid: true };
  }
}

export class ManualRequiredFieldsValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.name?.trim()) {
      return { valid: false, message: i18n.t('validation.customerNameRequired') };
    }
    if (!formData.serviceId) {
      return { valid: false, message: i18n.t('validation.serviceRequired') };
    }
    if (!formData.barberId) {
      return { valid: false, message: i18n.t('validation.barberRequired') };
    }
    if (!formData.date) {
      return { valid: false, message: i18n.t('validation.dateRequired') };
    }
    if (!formData.time) {
      return { valid: false, message: i18n.t('validation.timeRequired') };
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
      return { valid: false, message: i18n.t('validation.phoneInvalid') };
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
      return { valid: false, message: i18n.t('validation.slotTaken') };
    }

    return { valid: true };
  }
}

export class LookupFieldsValidation extends ValidationStrategy {
  validate(formData) {
    if (!formData.name?.trim()) {
      return { valid: false, message: i18n.t('validation.nameRequired') };
    }
    if (!formData.phone?.trim()) {
      return { valid: false, message: i18n.t('validation.phoneRequired') };
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
