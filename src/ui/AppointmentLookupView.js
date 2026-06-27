import { DateUtils } from '../utils/DateUtils.js';

export class AppointmentLookupView {
  constructor(resultsContainer, emptyMessageElement) {
    this.resultsContainer = resultsContainer;
    this.emptyMessageElement = emptyMessageElement;
    this.onCancel = null;
  }

  render(appointments, onCancel) {
    this.onCancel = onCancel;
    this.resultsContainer.innerHTML = '';

    if (appointments.length === 0) {
      this.emptyMessageElement.hidden = false;
      this.emptyMessageElement.textContent = 'Bu bilgilerle eşleşen randevu bulunamadı.';
      return;
    }

    this.emptyMessageElement.hidden = true;

    appointments.forEach((appointment) => {
      const card = document.createElement('article');
      card.className = 'lookup-card';

      const dateLabel = DateUtils.formatDisplayFromIso(appointment.date);

      card.innerHTML = `
        <div class="lookup-card-header">
          <span class="lookup-date">${dateLabel}</span>
          <span class="lookup-time">${appointment.time}</span>
        </div>
        <ul class="lookup-details">
          <li><span>Hizmet</span><strong>${this.escapeHtml(appointment.service)}</strong></li>
          <li><span>Berber</span><strong>${this.escapeHtml(appointment.barber)}</strong></li>
          <li><span>Telefon</span><strong>${this.escapeHtml(appointment.phone)}</strong></li>
        </ul>
        ${appointment.note ? `<p class="lookup-note">Not: ${this.escapeHtml(appointment.note)}</p>` : ''}
        <button type="button" class="btn btn-cancel" data-appointment-id="${appointment.id}">
          Randevuyu İptal Et
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
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
  }
}
