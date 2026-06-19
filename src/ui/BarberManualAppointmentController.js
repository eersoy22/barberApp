import { DateUtils } from '../utils/DateUtils.js';

/**
 * GRASP — Controller
 * Telefonla alınan randevuların manuel girilmesi.
 */
export class BarberManualAppointmentController {
  constructor(form, datePicker, timeSlotView, panelFacade, toastView, onCreated) {
    this.form = form;
    this.datePicker = datePicker;
    this.timeSlotView = timeSlotView;
    this.panelFacade = panelFacade;
    this.toastView = toastView;
    this.onCreated = onCreated;

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  getBarberId() {
    return this.panelFacade.getSession()?.barberId ?? '';
  }

  refreshTimeSlots() {
    this.timeSlotView.refresh(
      this.datePicker.getValue(),
      this.getBarberId(),
      this.timeSlotView.getValue(),
    );
  }

  resetForm() {
    this.form.reset();
    this.datePicker.reset();
    this.refreshTimeSlots();
  }

  handleSubmit(e) {
    e.preventDefault();

    const session = this.panelFacade.getSession();
    if (!session) {
      this.toastView.show('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    const date = this.datePicker.getValue();
    if (!date) {
      this.toastView.show('Lütfen bir tarih seçin.');
      this.datePicker.open();
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    if (DateUtils.isDateDisabled(new Date(year, month - 1, day))) {
      this.toastView.show('Geçmiş veya kapalı günler için randevu eklenemez.');
      return;
    }

    const formData = {
      name: this.form.querySelector('#manualName').value,
      phone: this.form.querySelector('#manualPhone').value,
      serviceId: this.form.querySelector('#manualService').value,
      barberId: session.barberId,
      date,
      time: this.timeSlotView.getValue(),
      note: this.form.querySelector('#manualNote').value,
    };

    const result = this.panelFacade.createManualAppointment(formData);

    if (!result.success) {
      this.toastView.show(result.message);
      this.refreshTimeSlots();
      return;
    }

    this.toastView.show(`Randevu eklendi: ${formData.name} — ${date} ${formData.time}`);
    this.resetForm();
    this.onCreated();
  }
}
