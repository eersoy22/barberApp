/**
 * GOF — Observer
 * GRASP — Pure Fabrication (event broadcasting)
 */
export class EventBus {
  static #instance = null;

  constructor() {
    this.listeners = new Map();
  }

  static getInstance() {
    if (!EventBus.#instance) {
      EventBus.#instance = new EventBus();
    }
    return EventBus.#instance;
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  publish(event, payload) {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    callbacks.forEach((callback) => callback(payload));
  }
}
