export class ToastView {
  constructor(element) {
    this.element = element;
  }

  show(message) {
    this.element.textContent = message;
    this.element.classList.add('show');
    setTimeout(() => this.element.classList.remove('show'), 4000);
  }
}
