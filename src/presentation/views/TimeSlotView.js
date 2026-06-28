import { i18n } from '../../i18n/I18n.js';

/**
 * View — DOM rendering only; data comes from the application layer.
 */
export class TimeSlotView {
  constructor(selectElement, hintElement) {
    this.select = selectElement;
    this.hint = hintElement;
  }

  showPlaceholder(hint) {
    this.select.innerHTML = `<option value="">${i18n.t('appointment.selectTime')}</option>`;
    this.hint.textContent = hint;
    this.select.disabled = true;
  }

  showLoading() {
    this.select.innerHTML = `<option value="">${i18n.t('appointment.selectTime')}</option>`;
    this.hint.textContent = i18n.t('timeslot.loading');
    this.select.disabled = true;
  }

  showError(message) {
    this.select.innerHTML = `<option value="">${i18n.t('appointment.selectTime')}</option>`;
    this.hint.textContent = message;
    this.select.disabled = true;
  }

  render(slots, hint, previousTime = '') {
    const bookedLabel = i18n.t('timeslot.booked');

    this.select.innerHTML = `<option value="">${i18n.t('appointment.selectTime')}</option>`;
    this.select.disabled = false;

    slots.forEach((slot) => {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = slot.isBooked ? `${slot.time} ${bookedLabel}` : slot.time;
      option.disabled = slot.isBooked;
      this.select.appendChild(option);
    });

    this.hint.textContent = hint;

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
}
