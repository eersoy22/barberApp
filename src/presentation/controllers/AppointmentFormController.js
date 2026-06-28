import { APP_EVENTS } from '../../config/constants.js';
import { DateUtils } from '../../utils/DateUtils.js';
import { i18n } from '../../i18n/I18n.js';
import { withNetworkHandling } from '../../utils/NetworkUtils.js';

/**
 * GRASP — Controller
 * Sistem olaylarını (form gönderimi) koordine eder.
 */
export class AppointmentFormController {
  constructor(form, datePicker, timeSlotPresenter, bookingFacade, toastView, eventBus) {
    this.form = form;
    this.datePicker = datePicker;
    this.timeSlotPresenter = timeSlotPresenter;
    this.bookingFacade = bookingFacade;
    this.toastView = toastView;
    this.eventBus = eventBus;

    this.barberSelect = form.querySelector('#barber');
    this.bindEvents();
    this.refreshTimeSlots();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      void this.handleSubmit(e);
    });

    this.barberSelect.addEventListener('change', () => this.refreshTimeSlots());

    this.eventBus.subscribe(APP_EVENTS.APPOINTMENTS_CHANGED, () => {
      this.refreshTimeSlots();
    });

    this.eventBus.subscribe(APP_EVENTS.LANGUAGE_CHANGED, () => {
      this.datePicker.rerender();
      void this.timeSlotPresenter.rerender();
    });
  }

  refreshTimeSlots() {
    void this.timeSlotPresenter.refresh(
      this.datePicker.getValue(),
      this.barberSelect.value,
      this.timeSlotPresenter.getValue(),
    );
  }

  async handleSubmit(e) {
    const formData = {
      name: this.form.querySelector('#name').value,
      phone: this.form.querySelector('#phone').value,
      serviceId: this.form.querySelector('#service').value,
      barberId: this.barberSelect.value,
      date: this.datePicker.getValue(),
      time: this.timeSlotPresenter.getValue(),
      note: this.form.querySelector('#note').value,
    };

    if (!formData.date) {
      this.toastView.show(i18n.t('appointment.selectDateToast'));
      this.datePicker.open();
      return;
    }

    const result = await withNetworkHandling(
      () => this.bookingFacade.createAppointment(formData),
      this.toastView,
    );

    if (!result) return;

    if (!result.success) {
      this.toastView.show(result.message);
      this.refreshTimeSlots();
      return;
    }

    const selectedDate = this.datePicker.getSelectedDate();
    this.toastView.show(
      i18n.t('appointment.created', {
        date: DateUtils.formatDisplay(selectedDate),
        time: formData.time,
      }),
    );

    this.form.reset();
    this.datePicker.reset();
    this.refreshTimeSlots();
  }
}
