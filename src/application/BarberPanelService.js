import { BARBER_LABELS, BARBER_PINS, SESSION_KEY } from '../config/constants.js';
import { i18n } from '../i18n/I18n.js';

/**
 * GRASP — Pure Fabrication
 * Berber paneli iş kuralları.
 */
export class BarberPanelService {
  constructor(repository) {
    this.repository = repository;
  }

  login(barberId, pin) {
    if (!barberId || !BARBER_LABELS[barberId]) {
      return { success: false, message: i18n.t('validation.barberRequired') };
    }

    if (!pin?.trim()) {
      return { success: false, message: i18n.t('validation.pinRequired') };
    }

    if (BARBER_PINS[barberId] !== pin.trim()) {
      return { success: false, message: i18n.t('validation.pinInvalid') };
    }

    sessionStorage.setItem(SESSION_KEY, barberId);
    return { success: true, barberId, barberName: BARBER_LABELS[barberId] };
  }

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  getSession() {
    const barberId = sessionStorage.getItem(SESSION_KEY);
    if (!barberId || !BARBER_LABELS[barberId]) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return {
      barberId,
      barberName: BARBER_LABELS[barberId],
    };
  }

  getAppointments(barberId) {
    return this.repository.findByBarberId(barberId);
  }
}

/**
 * GOF — Facade
 */
export class BarberPanelFacade {
  constructor(panelService, bookingFacade) {
    this.panelService = panelService;
    this.bookingFacade = bookingFacade;
  }

  login(barberId, pin) {
    return this.panelService.login(barberId, pin);
  }

  logout() {
    this.panelService.logout();
  }

  getSession() {
    return this.panelService.getSession();
  }

  getMyAppointments() {
    const session = this.panelService.getSession();
    if (!session) {
      return { success: false, message: i18n.t('validation.sessionNotFound'), appointments: [] };
    }

    const appointments = this.panelService.getAppointments(session.barberId);
    return { success: true, appointments, barberName: session.barberName };
  }

  createManualAppointment(formData) {
    const session = this.panelService.getSession();
    if (!session) {
      return { success: false, message: i18n.t('validation.sessionNotFound') };
    }

    return this.bookingFacade.createAppointment({
      ...formData,
      barberId: session.barberId,
    });
  }
}
