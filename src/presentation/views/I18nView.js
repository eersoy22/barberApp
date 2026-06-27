import { i18n } from '../../i18n/I18n.js';

export class I18nView {
  constructor(switchRoot, onLocaleChange) {
    this.switchRoot = switchRoot;
    this.onLocaleChange = onLocaleChange;
    this.bindEvents();
  }

  bindEvents() {
    if (!this.switchRoot) return;

    this.switchRoot.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        i18n.setLocale(btn.dataset.lang);
      });
    });

    i18n.onChange((locale) => {
      i18n.applyPage();
      if (this.onLocaleChange) this.onLocaleChange(locale);
    });
  }
}
