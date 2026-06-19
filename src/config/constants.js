export const STORAGE_KEY = 'appointments';

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export const SERVICE_LABELS = {
  'sac-kesimi': 'Saç Kesimi',
  'sakal-tirasi': 'Sakal Tıraşı',
  'sac-sakal': 'Saç + Sakal',
  'cilt-bakimi': 'Cilt Bakımı',
};

export const BARBER_LABELS = {
  ahmet: 'Ahmet Yılmaz',
  mehmet: 'Mehmet Kaya',
  can: 'Can Demir',
};

export const BARBER_PINS = {
  ahmet: '1111',
  mehmet: '2222',
  can: '3333',
};

export const SESSION_KEY = 'barberPanelSession';

export const APP_EVENTS = {
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_CANCELLED: 'appointment:cancelled',
  APPOINTMENTS_CHANGED: 'appointments:changed',
};
