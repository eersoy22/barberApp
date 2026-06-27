import { APP_EVENTS } from '../config/constants.js';
import { i18n } from '../i18n/I18n.js';

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

    this.loginForm = view.loginForm;
    this.logoutBtn = document.getElementById('logoutBtn');
    this.clearDayBtn = view.clearDayBtn;

    this.bindEvents();
    this.initSession();
  }

  bindEvents() {
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
    this.clearDayBtn.addEventListener('click', () => this.view.selectDate(null));

    this.eventBus.subscribe(APP_EVENTS.APPOINTMENTS_CHANGED, () => {
      if (this.facade.getSession()) this.loadAppointments();
    });

    this.eventBus.subscribe(APP_EVENTS.LANGUAGE_CHANGED, () => {
      this.view.refreshLanguage();
      this.manualAppointmentController?.onLanguageChange();
    });
  }

  initSession() {
    const session = this.facade.getSession();
    if (session) {
      this.view.showDashboard(session.barberName);
      this.loadAppointments();
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
    this.loadAppointments();
    this.manualAppointmentController?.refreshTimeSlots();
    this.toastView.show(i18n.t('panel.loginSuccess', { name: result.barberName }));
  }

  handleLogout() {
    this.facade.logout();
    this.view.showLogin();
    this.toastView.show(i18n.t('panel.logoutToast'));
  }

  loadAppointments() {
    const result = this.facade.getMyAppointments();

    if (!result.success) {
      this.view.showLogin();
      return;
    }

    this.view.renderAppointments(result.appointments, this.view.selectedDate);
  }
}
