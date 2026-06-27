import { DateUtils } from '../utils/DateUtils.js';
import { i18n } from '../i18n/I18n.js';

/**
 * Berber paneli için aylık takvim görünümü.
 */
export class BarberCalendarView {
  constructor(elements, onDaySelect) {
    this.title = elements.title;
    this.daysContainer = elements.daysContainer;
    this.prevBtn = elements.prevBtn;
    this.nextBtn = elements.nextBtn;
    this.onDaySelect = onDaySelect;

    this.viewDate = new Date();
    this.selectedDate = null;
    this.appointmentsByDate = new Map();

    this.bindEvents();
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
      this.render();
    });

    this.nextBtn.addEventListener('click', () => {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
      this.render();
    });
  }

  setAppointments(appointments) {
    this.appointmentsByDate = new Map();

    appointments.forEach((appointment) => {
      if (!this.appointmentsByDate.has(appointment.date)) {
        this.appointmentsByDate.set(appointment.date, []);
      }
      this.appointmentsByDate.get(appointment.date).push(appointment);
    });

    this.render();
  }

  setSelectedDate(isoDate) {
    this.selectedDate = isoDate;

    if (isoDate) {
      const [year, month] = isoDate.split('-').map(Number);
      this.viewDate = new Date(year, month - 1, 1);
    }

    this.render();
  }

  render() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const today = DateUtils.startOfDay(new Date());
    const months = i18n.getMonths();

    this.title.textContent = `${months[month]} ${year}`;
    this.daysContainer.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'panel-calendar-day empty';
      this.daysContainer.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isoDate = DateUtils.formatIso(date);
      const dayAppointments = this.appointmentsByDate.get(isoDate) || [];
      const hasAppointments = dayAppointments.length > 0;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'panel-calendar-day';

      if (DateUtils.isSameDay(date, today)) btn.classList.add('today');
      if (this.selectedDate === isoDate) btn.classList.add('selected');
      if (hasAppointments) btn.classList.add('has-appointments');

      btn.innerHTML = `
        <span class="panel-calendar-day-num">${day}</span>
        ${hasAppointments ? `<span class="panel-calendar-day-count">${dayAppointments.length}</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        const newSelection = this.selectedDate === isoDate ? null : isoDate;
        this.onDaySelect(newSelection);
      });

      this.daysContainer.appendChild(btn);
    }
  }
}
