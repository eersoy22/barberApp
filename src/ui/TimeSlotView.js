export class TimeSlotView {
  constructor(selectElement, hintElement, bookingFacade, options = {}) {
    this.select = selectElement;
    this.hint = hintElement;
    this.bookingFacade = bookingFacade;
    this.missingDateHint = options.missingDateHint ?? null;
  }

  refresh(date, barberId, previousTime = '') {
    this.select.innerHTML = '<option value="">Saat seçin</option>';

    if (!date || !barberId) {
      this.hint.textContent = !date && this.missingDateHint
        ? this.missingDateHint
        : 'Önce berber ve tarih seçin.';
      this.select.disabled = true;
      return;
    }

    this.select.disabled = false;
    const slots = this.bookingFacade.getAvailableTimeSlots(date, barberId);

    slots.forEach((slot) => {
      const option = document.createElement('option');
      option.value = slot.time;
      option.textContent = slot.label;
      option.disabled = slot.isBooked;
      this.select.appendChild(option);
    });

    this.hint.textContent = this.bookingFacade.getAvailabilityHint(date, barberId);

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
}
