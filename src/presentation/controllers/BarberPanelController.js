import { APP_EVENTS } from '../../config/constants.js';
import { DateUtils } from '../../utils/DateUtils.js';
import { i18n } from '../../i18n/I18n.js';
import { withNetworkHandling } from '../../utils/NetworkUtils.js';
import { BarberPanelService } from '../../application/BarberPanelService.js';

/**
 * GRASP — Controller
 */
export class BarberPanelController {
  constructor(view, facade, toastView, eventBus, manualAppointmentController = null) {
    this.view = view;
    this.facade = facade;
    this.toastView = toastView;
    this.eventBus = eventBus;
    this.manualAppointmentController = manualAppointmentController;

    this.allAppointments = [];
    this.selectedDate = null;

    this.loginForm = view.loginForm;
    this.logoutBtn = document.getElementById('logoutBtn');
    this.clearDayBtn = view.clearDayBtn;

    this.bindEvents();
    this.initSession();
  }

  bindEvents() {
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
    this.clearDayBtn.addEventListener('click', () => this.handleDateSelect(null));

    this.eventBus.subscribe(APP_EVENTS.APPOINTMENTS_CHANGED, () => {
      if (this.facade.getSession()) void this.loadAppointments();
    });

    this.eventBus.subscribe(APP_EVENTS.LANGUAGE_CHANGED, () => {
      this.view.refreshLanguage();
      this.manualAppointmentController?.onLanguageChange();
    });
  }

  getVisibleAppointments() {
    return BarberPanelService.filterAppointmentsByDate(this.allAppointments, this.selectedDate);
  }

  renderCurrentAppointments() {
    this.view.renderAppointments(
      this.allAppointments,
      this.selectedDate,
      this.getVisibleAppointments(),
      (id) => this.handleCancel(id),
    );
  }

  handleDateSelect(isoDate) {
    this.selectedDate = isoDate;
    this.view.updateSelectedDate(isoDate, this.getVisibleAppointments());
  }

  initSession() {
    const session = this.facade.getSession();
    if (session) {
      this.view.showDashboard(session.barberName);
      void this.loadAppointments();
      this.manualAppointmentController?.refreshTimeSlots();
    } else {
      this.view.showLogin();
    }
  }

  handleLogin(e) {
    e.preventDefault();

    const barberId = this.loginForm.querySelector('#panelBarber').value;
    const pin = this.loginForm.querySelector('#panelPin').value;

    const result = this.facade.login(barberId, pin);

    if (!result.success) {
      this.toastView.show(result.message);
      return;
    }

    this.view.showDashboard(result.barberName);
    void this.loadAppointments();
    this.manualAppointmentController?.refreshTimeSlots();
    this.toastView.show(i18n.t('panel.loginSuccess', { name: result.barberName }));
  }

  handleLogout() {
    this.facade.logout();
    this.allAppointments = [];
    this.selectedDate = null;
    this.view.showLogin();
    this.toastView.show(i18n.t('panel.logoutToast'));
  }

  async loadAppointments() {
    const result = await withNetworkHandling(
      () => this.facade.getMyAppointments(),
      this.toastView,
    );

    if (!result) return;

    if (!result.success) {
      this.view.showLogin();
      return;
    }

    this.allAppointments = result.appointments;
    this.renderCurrentAppointments();
  }

  async handleCancel(appointmentId) {
    const confirmed = window.confirm(i18n.t('lookup.cancelConfirm'));
    if (!confirmed) return;

    const result = await withNetworkHandling(
      () => this.facade.cancelAppointment(appointmentId),
      this.toastView,
    );

    if (!result) return;

    if (!result.success) {
      this.toastView.show(result.message);
      return;
    }

    const dateLabel = DateUtils.formatDisplayFromIso(result.appointment.date);
    this.toastView.show(i18n.t('lookup.cancelled', {
      date: dateLabel,
      time: result.appointment.time,
    }));
    await this.loadAppointments();
    this.manualAppointmentController?.refreshTimeSlots();
  }
}
