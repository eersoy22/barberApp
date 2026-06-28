import { i18n } from '../../i18n/I18n.js';

/**
 * GRASP — Controller
 * TimeSlotView ile BookingFacade arasındaki koordinasyonu yönetir.
 */
export class TimeSlotPresenter {
  constructor(view, bookingFacade) {
    this.view = view;
    this.bookingFacade = bookingFacade;
    this.lastDate = '';
    this.lastBarberId = '';
    this.lastPreviousTime = '';
    this.missingDateHint = null;
  }

  setMissingDateHint(hint) {
    this.missingDateHint = hint;
  }

  getValue() {
    return this.view.getValue();
  }

  async refresh(date, barberId, previousTime = '') {
    this.lastDate = date;
    this.lastBarberId = barberId;
    this.lastPreviousTime = previousTime;

    if (!date || !barberId) {
      const hint = !date && this.missingDateHint
        ? this.missingDateHint
        : i18n.t('appointment.selectBarberDate');
      this.view.showPlaceholder(hint);
      return;
    }

    this.view.showLoading();

    try {
      const [slots, hint] = await Promise.all([
        this.bookingFacade.getAvailableTimeSlots(date, barberId),
        this.bookingFacade.getAvailabilityHint(date, barberId),
      ]);
      this.view.render(slots, hint, this.lastPreviousTime);
    } catch {
      this.view.showError(i18n.t('validation.networkError'));
    }
  }

  async rerender() {
    return this.refresh(this.lastDate, this.lastBarberId, this.lastPreviousTime);
  }

  reset() {
    void this.refresh('', '', '');
  }
}
