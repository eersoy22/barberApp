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
      this.toastView.show('Mesajınız gönderildi! En kısa sürede dönüş yapacağız.');
      this.form.reset();
    });
  }
}
