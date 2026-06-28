export function rowToAppointment(data) {
  return {
    id: data.id,
    name: data.name,
    phone: data.phone ?? '',
    serviceId: data.service_id,
    service: data.service,
    barberId: data.barber_id,
    barber: data.barber,
    date: data.date,
    time: data.time,
    note: data.note ?? '',
    createdAt: data.created_at,
  };
}

export function appointmentToRow(appointment) {
  return {
    id: appointment.id,
    name: appointment.name,
    phone: appointment.phone ?? '',
    service_id: appointment.serviceId,
    service: appointment.service,
    barber_id: appointment.barberId,
    barber: appointment.barber,
    date: appointment.date,
    time: appointment.time,
    note: appointment.note ?? '',
    created_at: appointment.createdAt,
  };
}
