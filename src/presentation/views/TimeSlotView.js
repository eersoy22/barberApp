import { i18n } from '../../i18n/I18n.js';

const TR_LABELS = {
  selectTime: 'Saat seçin',
  selectBarberDate: 'Önce berber ve tarih seçin.',
  selectDateFirst: 'Önce tarih seçin.',
  booked: '(Dolu)',
  noSlots: 'Bu berber için seçilen günde müsait saat kalmadı.',
  available: (count) => `${count} müsait saat var. Dolu saatler seçilemez.`,
};

export class TimeSlotView {
  constructor(selectElement, hintElement, bookingFacade, options = {}) {
    this.select = selectElement;
    this.hint = hintElement;
    this.bookingFacade = bookingFacade;
    this.useI18n = options.useI18n !== false;
    this.missingDateHint = options.missingDateHint ?? null;
    this.lastDate = '';
    this.lastBarberId = '';
    this.lastPreviousTime = '';
  }

  t(key, params = {}) {
    if (!this.useI18n) {
      if (key === 'appointment.selectTime') return TR_LABELS.selectTime;
      if (key === 'appointment.selectBarberDate') return TR_LABELS.selectBarberDate;
      if (key === 'timeslot.booked') return TR_LABELS.booked;
      return TR_LABELS[key] ?? '';
    }
    return i18n.t(key, params);
  }

  getHint(date, barberId) {
    if (!this.useI18n) {
      if (!date || !barberId) return this.missingDateHint ?? TR_LABELS.selectBarberDate;
      const count = this.bookingFacade.getAvailableCount(date, barberId);
      if (count === 0) return TR_LABELS.noSlots;
      return TR_LABELS.available(count);
    }
    return this.bookingFacade.getAvailabilityHint(date, barberId);
  }

  refresh(date, barberId, previousTime = '') {
    this.lastDate = date;
    this.lastBarberId = barberId;
    this.lastPreviousTime = previousTime;

    this.select.innerHTML = `<option value="">${this.t('appointment.selectTime')}</option>`;

    if (!date || !barberId) {
      this.hint.textContent = !date && this.missingDateHint
        ? this.missingDateHint
        : this.t('appointment.selectBarberDate');
      this.select.disabled = true;
      return;
    }

    this.select.disabled = false;
    const slots = this.bookingFacade.getAvailableTimeSlots(date, barberId);
    const bookedLabel = this.t('timeslot.booked');

    slots.forEach((slot) => {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = slot.isBooked ? `${slot.time} ${bookedLabel}` : slot.time;
      option.disabled = slot.isBooked;
      this.select.appendChild(option);
    });

    this.hint.textContent = this.getHint(date, barberId);

    if (previousTime) {
      const stillAvailable = slots.some(
        (slot) => slot.time === previousTime && slot.isAvailable,
      );
      if (stillAvailable) this.select.value = previousTime;
    }
  }

  getValue() {
    return this.select.value;
  }

  reset() {
    this.refresh('', '');
  }

  rerender() {
    this.refresh(this.lastDate, this.lastBarberId, this.lastPreviousTime);
  }
}
