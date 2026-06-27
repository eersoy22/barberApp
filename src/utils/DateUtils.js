import { i18n } from '../i18n/I18n.js';

export class DateUtils {
  static startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static formatDisplay(date) {
    return date.toLocaleDateString(i18n.getLocaleTag(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  static formatIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  static formatDisplayFromIso(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    if (!y || !m || !d) return isoDate;
    return DateUtils.formatDisplay(new Date(y, m - 1, d));
  }

  static isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  static isDateDisabled(date) {
    const today = DateUtils.startOfDay(new Date());
    if (date < today) return true;
    if (date.getDay() === 0) return true;
    return false;
  }

  static isPastAppointment(isoDate, time) {
    if (!isoDate || !time) return false;

    const [year, month, day] = isoDate.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    if ([year, month, day, hour, minute].some(Number.isNaN)) return false;

    const appointmentDate = new Date(year, month - 1, day, hour, minute);
    return appointmentDate < new Date();
  }
}
