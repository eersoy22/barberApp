import { DateUtils } from '../../utils/DateUtils.js';
import { i18n } from '../../i18n/I18n.js';

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
    this.currentBarberName = '';
    this.onCancel = null;
  }

  showLogin() {
    this.loginSection.hidden = false;
    this.dashboardSection.hidden = true;
    this.loginForm.reset();
  }

  showDashboard(barberName) {
    this.currentBarberName = barberName;
    this.loginSection.hidden = true;
    this.dashboardSection.hidden = false;
    this.welcomeTitle.textContent = i18n.t('panel.welcome', { name: barberName });
  }

  renderAppointments(appointments, selectedDate = null, onCancel = null) {
    this.onCancel = onCancel ?? this.onCancel;
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
      this.selectedDayTitle.textContent = i18n.t('panel.dayAppointments', {
        date: DateUtils.formatDisplayFromIso(this.selectedDate),
      });
      this.clearDayBtn.hidden = false;
    } else {
      this.selectedDayTitle.textContent = i18n.t('panel.allAppointments');
      this.clearDayBtn.hidden = true;
    }
  }

  renderList(appointments) {
    this.appointmentsContainer.innerHTML = '';

    if (this.allAppointments.length === 0) {
      this.emptyMessage.hidden = false;
      this.emptyMessage.textContent = i18n.t('panel.emptyAll');
      return;
    }

    if (appointments.length === 0) {
      this.emptyMessage.hidden = false;
      this.emptyMessage.textContent = i18n.t('panel.emptyDay');
      return;
    }

    this.emptyMessage.hidden = true;

    appointments.forEach((appointment) => {
      const isPast = DateUtils.isPastAppointment(appointment.date, appointment.time);
      const card = document.createElement('article');
      card.className = `panel-card${isPast ? ' panel-card-past' : ''}`;

      const dateLabel = DateUtils.formatDisplayFromIso(appointment.date);
      const serviceLabel = appointment.serviceId
        ? i18n.getServiceLabel(appointment.serviceId)
        : appointment.service;

      card.innerHTML = `
        <div class="panel-card-header">
          <div>
            ${!this.selectedDate ? `<span class="panel-card-date">${dateLabel}</span>` : ''}
            <span class="panel-card-time">${appointment.time}</span>
          </div>
          <span class="panel-badge ${isPast ? 'panel-badge-past' : 'panel-badge-upcoming'}">
            ${isPast ? i18n.t('panel.past') : i18n.t('panel.upcoming')}
          </span>
        </div>
        <ul class="panel-card-details">
          <li><span>${i18n.t('panel.customer')}</span><strong>${this.escapeHtml(appointment.name)}</strong></li>
          <li><span>${i18n.t('panel.phone')}</span><strong>${this.escapeHtml(appointment.phone)}</strong></li>
          <li><span>${i18n.t('panel.service')}</span><strong>${this.escapeHtml(serviceLabel)}</strong></li>
        </ul>
        ${appointment.note ? `<p class="panel-card-note">${i18n.t('panel.note')}: ${this.escapeHtml(appointment.note)}</p>` : ''}
        ${!isPast ? `<button type="button" class="btn btn-cancel panel-cancel-btn">${i18n.t('lookup.cancelBtn')}</button>` : ''}
      `;

      if (!isPast) {
        card.querySelector('.panel-cancel-btn').addEventListener('click', () => {
          if (this.onCancel) this.onCancel(appointment.id);
        });
      }

      this.appointmentsContainer.appendChild(card);
    });
  }

  selectDate(isoDate) {
    this.selectedDate = isoDate;
    this.calendarView.setSelectedDate(isoDate);
    this.updateListTitle();
    this.renderList(this.getFilteredAppointments());
  }

  refreshLanguage() {
    if (this.currentBarberName) {
      this.welcomeTitle.textContent = i18n.t('panel.welcome', { name: this.currentBarberName });
    }
    if (this.allAppointments.length > 0) {
      this.renderAppointments(this.allAppointments, this.selectedDate, this.onCancel);
    } else {
      this.updateListTitle();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
  }
}
