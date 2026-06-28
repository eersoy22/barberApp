import { DateUtils } from '../../utils/DateUtils.js';
import { APP_EVENTS } from '../../config/constants.js';
import { i18n } from '../../i18n/I18n.js';
import { withNetworkHandling } from '../../utils/NetworkUtils.js';

/**
 * GRASP — Controller
 * Telefonla alınan randevuların manuel girilmesi.
 */
export class BarberManualAppointmentController {
  constructor(form, datePicker, timeSlotPresenter, panelFacade, toastView, eventBus, onCreated) {
    this.form = form;
    this.datePicker = datePicker;
    this.timeSlotPresenter = timeSlotPresenter;
    this.panelFacade = panelFacade;
    this.toastView = toastView;
    this.eventBus = eventBus;
    this.onCreated = onCreated;

    this.timeSlotPresenter.setMissingDateHint(i18n.t('appointment.selectDateFirst'));
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.eventBus.subscribe(APP_EVENTS.LANGUAGE_CHANGED, () => {
      this.onLanguageChange();
    });
  }

  onLanguageChange() {
    this.timeSlotPresenter.setMissingDateHint(i18n.t('appointment.selectDateFirst'));
    this.datePicker.rerender();
    this.refreshTimeSlots();
  }

  getBarberId() {
    return this.panelFacade.getSession()?.barberId ?? '';
  }

  refreshTimeSlots() {
    void this.timeSlotPresenter.refresh(
      this.datePicker.getValue(),
      this.getBarberId(),
      this.timeSlotPresenter.getValue(),
    );
  }

  resetForm() {
    this.form.reset();
    this.datePicker.reset();
    this.refreshTimeSlots();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const session = this.panelFacade.getSession();
    if (!session) {
      this.toastView.show(i18n.t('panel.sessionLost'));
      return;
    }

    const date = this.datePicker.getValue();
    if (!date) {
      this.toastView.show(i18n.t('appointment.selectDateToast'));
      this.datePicker.open();
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    if (DateUtils.isDateDisabled(new Date(year, month - 1, day))) {
      this.toastView.show(i18n.t('panel.pastDayBlocked'));
      return;
    }

    const formData = {
      name: this.form.querySelector('#manualName').value,
      phone: this.form.querySelector('#manualPhone').value,
      serviceId: this.form.querySelector('#manualService').value,
      barberId: session.barberId,
      date,
      time: this.timeSlotPresenter.getValue(),
      note: this.form.querySelector('#manualNote').value,
    };

    const result = await withNetworkHandling(
      () => this.panelFacade.createManualAppointment(formData),
      this.toastView,
    );

    if (!result) return;

    if (!result.success) {
      this.toastView.show(result.message);
      this.refreshTimeSlots();
      return;
    }

    this.toastView.show(i18n.t('panel.added', {
      name: formData.name,
      date,
      time: formData.time,
    }));
    this.resetForm();
    this.onCreated();
  }
}
