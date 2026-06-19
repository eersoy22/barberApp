import { MONTHS } from '../config/constants.js';
import { DateUtils } from '../utils/DateUtils.js';

export class DatePickerView {
  constructor(elements, onDateChange) {
    this.trigger = elements.trigger;
    this.display = elements.display;
    this.input = elements.input;
    this.popup = elements.popup;
    this.title = elements.title;
    this.daysContainer = elements.daysContainer;
    this.prevBtn = elements.prevBtn;
    this.nextBtn = elements.nextBtn;
    this.onDateChange = onDateChange;

    this.viewDate = new Date();
    this.selectedDate = null;

    this.bindEvents();
    this.updateDisplay();
  }

  bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.popup.hidden) this.open();
      else this.close();
    });

    this.prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
      this.render();
    });

    this.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
      this.render();
    });

    this.popup.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
      if (!this.popup.hidden) this.close();
    });
  }

  getValue() {
    return this.input.value;
  }

  getSelectedDate() {
    return this.selectedDate;
  }

  updateDisplay() {
    if (this.selectedDate) {
      this.display.textContent = DateUtils.formatDisplay(this.selectedDate);
      this.display.classList.remove('placeholder');
      this.input.value = DateUtils.formatIso(this.selectedDate);
    } else {
      this.display.textContent = 'Tarih seçin';
      this.display.classList.add('placeholder');
      this.input.value = '';
    }

    this.onDateChange(this.input.value);
  }

  render() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const today = DateUtils.startOfDay(new Date());

    this.title.textContent = `${MONTHS[month]} ${year}`;
    this.daysContainer.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar-day empty';
      this.daysContainer.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';
      btn.textContent = day;

      if (DateUtils.isSameDay(date, today)) btn.classList.add('today');
      if (this.selectedDate && DateUtils.isSameDay(date, this.selectedDate)) {
        btn.classList.add('selected');
      }
      if (DateUtils.isDateDisabled(date)) btn.disabled = true;

      btn.addEventListener('click', () => {
        this.selectedDate = date;
        this.updateDisplay();
        this.render();
        this.close();
      });

      this.daysContainer.appendChild(btn);
    }
  }

  open() {
    if (this.selectedDate) {
      this.viewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    } else {
      this.viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    this.render();
    this.popup.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.popup.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  reset() {
    this.selectedDate = null;
    this.updateDisplay();
    this.close();
  }
}
