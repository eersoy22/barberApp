import { i18n } from '../../i18n/I18n.js';

/**
 * GRASP — Controller
 */
export class ContactFormController {
  constructor(form, toastView) {
    this.form = form;
    this.toastView = toastView;
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.toastView.show(i18n.t('contact.sentToast'));
      this.form.reset();
    });
  }
}
