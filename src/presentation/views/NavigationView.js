export class NavigationView {
  constructor(toggleButton, linksContainer) {
    this.toggleButton = toggleButton;
    this.linksContainer = linksContainer;
    this.bindEvents();
  }

  bindEvents() {
    this.toggleButton.addEventListener('click', () => {
      this.linksContainer.classList.toggle('open');
    });

    this.linksContainer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => this.linksContainer.classList.remove('open'));
    });
  }
}
