import { DateUtils } from '../../utils/DateUtils.js';
import { i18n } from '../../i18n/I18n.js';

export class AppointmentLookupView {
  constructor(resultsContainer, emptyMessageElement) {
    this.resultsContainer = resultsContainer;
    this.emptyMessageElement = emptyMessageElement;
    this.onCancel = null;
    this.lastAppointments = [];
  }

  render(appointments, onCancel) {
    this.onCancel = onCancel;
    this.lastAppointments = appointments;
    this.resultsContainer.innerHTML = '';

    if (appointments.length === 0) {
      this.emptyMessageElement.hidden = false;
      this.emptyMessageElement.textContent = i18n.t('lookup.noMatch');
      return;
    }

    this.emptyMessageElement.hidden = true;

    appointments.forEach((appointment) => {
      const card = document.createElement('article');
      card.className = 'lookup-card';

      const dateLabel = DateUtils.formatDisplayFromIso(appointment.date);
      const serviceLabel = appointment.serviceId
        ? i18n.getServiceLabel(appointment.serviceId)
        : appointment.service;

      card.innerHTML = `
        <div class="lookup-card-header">
          <span class="lookup-date">${dateLabel}</span>
          <span class="lookup-time">${appointment.time}</span>
        </div>
        <ul class="lookup-details">
          <li><span>${i18n.t('lookup.service')}</span><strong>${this.escapeHtml(serviceLabel)}</strong></li>
          <li><span>${i18n.t('lookup.barber')}</span><strong>${this.escapeHtml(appointment.barber)}</strong></li>
          <li><span>${i18n.t('lookup.phone')}</span><strong>${this.escapeHtml(appointment.phone)}</strong></li>
        </ul>
        ${appointment.note ? `<p class="lookup-note">${i18n.t('lookup.note')}: ${this.escapeHtml(appointment.note)}</p>` : ''}
        <button type="button" class="btn btn-cancel" data-appointment-id="${appointment.id}">
          ${i18n.t('lookup.cancelBtn')}
        </button>
      `;

      card.querySelector('.btn-cancel').addEventListener('click', () => {
        if (this.onCancel) this.onCancel(appointment.id);
      });

      this.resultsContainer.appendChild(card);
    });
  }

  clear() {
    this.resultsContainer.innerHTML = '';
    this.emptyMessageElement.hidden = true;
    this.lastAppointments = [];
  }

  rerender() {
    if (this.lastAppointments.length > 0) {
      this.render(this.lastAppointments, this.onCancel);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
  }
}
