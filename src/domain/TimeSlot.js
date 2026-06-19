/**
 * GRASP — Information Expert
 * Saat diliminin müsaitlik durumunu kendi bilir.
 */
export class TimeSlot {
  constructor(time, isBooked = false) {
    this.time = time;
    this.isBooked = isBooked;
  }

  get isAvailable() {
    return !this.isBooked;
  }

  get label() {
    return this.isBooked ? `${this.time} (Dolu)` : this.time;
  }
}
