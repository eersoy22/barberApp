import { DateUtils } from '../utils/DateUtils.js';

/**
 * GRASP — Controller
 */
export class AppointmentLookupController {
  constructor(form, lookupView, bookingFacade, toastView) {
    this.form = form;
    this.lookupView = lookupView;
    this.bookingFacade = bookingFacade;
    this.toastView = toastView;
    this.lastSearch = { name: '', phone: '' };
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
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
      this.toastView.show('Randevu bulunamadı.');
    } else {
      this.toastView.show(`${result.appointments.length} randevu bulundu.`);
    }
  }

  handleCancel(appointmentId) {
    const confirmed = window.confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?');
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
    this.toastView.show(`Randevu iptal edildi: ${dateLabel} — ${result.appointment.time}`);
    this.refreshResults();
  }
}
