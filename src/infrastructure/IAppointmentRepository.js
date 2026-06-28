/**
 * GRASP — Protected Variations
 * Abstracts storage details (Repository).
 */
export class IAppointmentRepository {
  findAll() {
    throw new Error('findAll() implement edilmeli');
  }

  save(appointment) {
    throw new Error('save() implement edilmeli');
  }

  isSlotBooked(date, barberId, time) {
    throw new Error('isSlotBooked() implement edilmeli');
  }

  findByCustomer(name, phone) {
    throw new Error('findByCustomer() implement edilmeli');
  }

  findById(id) {
    throw new Error('findById() implement edilmeli');
  }

  deleteById(id) {
    throw new Error('deleteById() implement edilmeli');
  }

  findByBarberId(barberId) {
    throw new Error('findByBarberId() implement edilmeli');
  }
}
