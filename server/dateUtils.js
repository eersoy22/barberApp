export function isPastAppointment(isoDate, time) {
  if (!isoDate || !time) return false;

  const [year, month, day] = isoDate.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  if ([year, month, day, hour, minute].some(Number.isNaN)) return false;

  const appointmentDate = new Date(year, month - 1, day, hour, minute);
  return appointmentDate < new Date();
}
