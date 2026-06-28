export class NavigationView {
  constructor(toggleButton, linksContainer, headerElement = null) {
    this.toggleButton = toggleButton;
    this.linksContainer = linksContainer;
    this.headerElement = headerElement;
    this.bindEvents();
  }

  bindEvents() {
    this.toggleButton.addEventListener('click', () => {
      this.linksContainer.classList.toggle('open');
    });

    this.linksContainer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => this.linksContainer.classList.remove('open'));
    });

    if (this.headerElement) {
      window.addEventListener('scroll', () => {
        this.headerElement.style.boxShadow = window.scrollY > 50
          ? '0 4px 20px rgba(0,0,0,0.4)'
          : 'none';
      });
    }
  }
}
