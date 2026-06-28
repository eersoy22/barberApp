import { LANG_KEY } from '../config/constants.js';
import {
  translations,
  SERVICE_I18N_KEYS,
  SERVICE_PRICES,
  SERVICE_IDS,
} from './translations.js';

/**
 * GOF — Singleton
 * Application-wide language management.
 */
export class I18n {
  static #instance = null;

  static getInstance() {
    if (!I18n.#instance) {
      I18n.#instance = new I18n();
    }
    return I18n.#instance;
  }

  #locale = 'tr';
  #listeners = [];

  constructor() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'tr') {
      this.#locale = stored;
    } else if (navigator.language?.startsWith('en')) {
      this.#locale = 'en';
    }
  }

  getLocale() {
    return this.#locale;
  }

  getLocaleTag() {
    return this.#locale === 'en' ? 'en-US' : 'tr-TR';
  }

  onChange(listener) {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter((item) => item !== listener);
    };
  }

  setLocale(locale) {
    if (locale !== 'tr' && locale !== 'en') return;
    if (this.#locale === locale) return;

    this.#locale = locale;
    localStorage.setItem(LANG_KEY, locale);
    document.documentElement.lang = locale;
    this.#listeners.forEach((listener) => listener(locale));
  }

  t(key, params = {}) {
    const value = key.split('.').reduce((obj, part) => obj?.[part], translations[this.#locale]);

    if (value == null) return key;
    if (typeof value !== 'string') return key;

    return Object.entries(params).reduce(
      (text, [param, replacement]) => text.replace(`{${param}}`, String(replacement)),
      value,
    );
  }

  getMonths() {
    return translations[this.#locale].calendar.months;
  }

  getWeekdays() {
    return translations[this.#locale].calendar.weekdays;
  }

  getServiceLabel(serviceId) {
    const key = SERVICE_I18N_KEYS[serviceId];
    return key ? this.t(key) : serviceId;
  }

  getServiceOptionLabel(serviceId) {
    const price = SERVICE_PRICES[serviceId];
    return `${this.getServiceLabel(serviceId)} — ₺${price}`;
  }

  applyPage(root = document) {
    document.title = this.t(document.body.dataset.pageTitleKey ?? 'meta.title');

    const description = document.querySelector('meta[name="description"]');
    if (description && document.body.dataset.pageDescKey) {
      description.content = this.t(document.body.dataset.pageDescKey);
    }

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });

    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = this.t(el.dataset.i18nHtml);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });

    root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      el.setAttribute('aria-label', this.t(el.dataset.i18nAriaLabel));
    });

    root.querySelectorAll('[data-i18n-value]').forEach((el) => {
      if (el.tagName === 'OPTION' && !el.value) {
        el.textContent = this.t(el.dataset.i18nValue);
      }
    });

    root.querySelectorAll('[data-i18n-option]').forEach((el) => {
      const serviceId = el.dataset.i18nOption;
      if (SERVICE_IDS.includes(serviceId)) {
        el.textContent = this.getServiceOptionLabel(serviceId);
      } else {
        el.textContent = this.t(el.dataset.i18nOption);
      }
    });

    root.querySelectorAll('[data-i18n-weekday]').forEach((el) => {
      const index = Number(el.dataset.i18nWeekday);
      const weekdays = this.getWeekdays();
      if (weekdays[index] != null) el.textContent = weekdays[index];
    });

    root.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === this.#locale);
    });
  }
}

export const i18n = I18n.getInstance();
