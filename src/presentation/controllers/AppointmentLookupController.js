import { DateUtils } from '../../utils/DateUtils.js';
import { APP_EVENTS } from '../../config/constants.js';
import { i18n } from '../../i18n/I18n.js';
import { withNetworkHandling } from '../../utils/NetworkUtils.js';

/**
 * GRASP — Controller
 */
export class AppointmentLookupController {
  constructor(form, lookupView, bookingFacade, toastView, eventBus) {
    this.form = form;
    this.lookupView = lookupView;
    this.bookingFacade = bookingFacade;
    this.toastView = toastView;
    this.eventBus = eventBus;
    this.lastSearch = { name: '', phone: '' };
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.eventBus.subscribe(APP_EVENTS.LANGUAGE_CHANGED, () => {
      this.lookupView.rerender();
    });
  }

  getSearchCredentials() {
    return {
      name: this.form.querySelector('#lookupName').value,
      phone: this.form.querySelector('#lookupPhone').value,
    };
  }

  refreshResults() {
    const result = this.bookingFacade.lookupAppointments(
      this.lastSearch.name,
      this.lastSearch.phone,
    );

    if (!result.success) {
      this.lookupView.clear();
      return;
    }

    this.lookupView.render(result.appointments, (id) => this.handleCancel(id));
  }

  handleSubmit(e) {
    e.preventDefault();

    const { name, phone } = this.getSearchCredentials();
    this.lastSearch = { name, phone };

    const result = this.bookingFacade.lookupAppointments(name, phone);

    if (!result.success) {
      this.toastView.show(result.message);
      this.lookupView.clear();
      return;
    }

    this.lookupView.render(result.appointments, (id) => this.handleCancel(id));

    if (result.appointments.length === 0) {
      this.toastView.show(i18n.t('lookup.notFoundToast'));
    } else {
      this.toastView.show(i18n.t('lookup.found', { count: result.appointments.length }));
    }
  }

  handleCancel(appointmentId) {
    const confirmed = window.confirm(i18n.t('lookup.cancelConfirm'));
    if (!confirmed) return;

    const result = this.bookingFacade.cancelAppointment(
      appointmentId,
      this.lastSearch.name,
      this.lastSearch.phone,
    );

    if (!result.success) {
      this.toastView.show(result.message);
      return;
    }

    const dateLabel = DateUtils.formatDisplayFromIso(result.appointment.date);
    this.toastView.show(i18n.t('lookup.cancelled', {
      date: dateLabel,
      time: result.appointment.time,
    }));
    this.refreshResults();
  }
}
