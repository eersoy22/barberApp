import { DateUtils } from '../utils/DateUtils.js';

export class BarberPanelView {
  constructor(elements) {
    this.loginSection = elements.loginSection;
    this.dashboardSection = elements.dashboardSection;
    this.loginForm = elements.loginForm;
    this.welcomeTitle = elements.welcomeTitle;
    this.appointmentsContainer = elements.appointmentsContainer;
    this.emptyMessage = elements.emptyMessage;
    this.statsTotal = elements.statsTotal;
    this.selectedDayTitle = elements.selectedDayTitle;
    this.clearDayBtn = elements.clearDayBtn;
    this.calendarView = elements.calendarView;

    this.allAppointments = [];
    this.selectedDate = null;
  }

  showLogin() {
    this.loginSection.hidden = false;
    this.dashboardSection.hidden = true;
    this.loginForm.reset();
  }

  showDashboard(barberName) {
    this.loginSection.hidden = true;
    this.dashboardSection.hidden = false;
    this.welcomeTitle.textContent = `Hoş geldin, ${barberName}`;
  }

  renderAppointments(appointments, selectedDate = null) {
    this.allAppointments = appointments;
    this.selectedDate = selectedDate;

    this.statsTotal.textContent = appointments.length;

    this.calendarView.setAppointments(appointments);
    this.calendarView.setSelectedDate(selectedDate);

    this.updateListTitle();
    this.renderList(this.getFilteredAppointments());
  }

  getFilteredAppointments() {
    if (!this.selectedDate) return this.allAppointments;
    return this.allAppointments.filter((a) => a.date === this.selectedDate);
  }

  updateListTitle() {
    if (this.selectedDate) {
      this.selectedDayTitle.textContent = `${DateUtils.formatDisplayFromIso(this.selectedDate)} Randevuları`;
      this.clearDayBtn.hidden = false;
    } else {
      this.selectedDayTitle.textContent = 'Tüm Randevular';
      this.clearDayBtn.hidden = true;
    }
  }

  renderList(appointments) {
    this.appointmentsContainer.innerHTML = '';

    if (this.allAppointments.length === 0) {
      this.emptyMessage.hidden = false;
      this.emptyMessage.textContent = 'Henüz randevunuz bulunmuyor.';
      return;
    }

    if (appointments.length === 0) {
      this.emptyMessage.hidden = false;
      this.emptyMessage.textContent = 'Bu gün için randevu bulunmuyor.';
      return;
    }

    this.emptyMessage.hidden = true;

    appointments.forEach((appointment) => {
      const isPast = DateUtils.isPastAppointment(appointment.date, appointment.time);
      const card = document.createElement('article');
      card.className = `panel-card${isPast ? ' panel-card-past' : ''}`;

      const dateLabel = DateUtils.formatDisplayFromIso(appointment.date);

      card.innerHTML = `
        <div class="panel-card-header">
          <div>
            ${!this.selectedDate ? `<span class="panel-card-date">${dateLabel}</span>` : ''}
            <span class="panel-card-time">${appointment.time}</span>
          </div>
          <span class="panel-badge ${isPast ? 'panel-badge-past' : 'panel-badge-upcoming'}">
            ${isPast ? 'Geçmiş' : 'Yaklaşan'}
          </span>
        </div>
        <ul class="panel-card-details">
          <li><span>Müşteri</span><strong>${this.escapeHtml(appointment.name)}</strong></li>
          <li><span>Telefon</span><strong>${this.escapeHtml(appointment.phone)}</strong></li>
          <li><span>Hizmet</span><strong>${this.escapeHtml(appointment.service)}</strong></li>
        </ul>
        ${appointment.note ? `<p class="panel-card-note">Not: ${this.escapeHtml(appointment.note)}</p>` : ''}
      `;

      this.appointmentsContainer.appendChild(card);
    });
  }

  selectDate(isoDate) {
    this.selectedDate = isoDate;
    this.calendarView.setSelectedDate(isoDate);
    this.updateListTitle();
    this.renderList(this.getFilteredAppointments());
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
  }
}
