export function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
}

export function normalizePhone(phone) {
  if (!phone) return '';

  let digits = String(phone).replace(/\D/g, '');

  if (digits.startsWith('90') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (digits.length >= 10) {
    return digits.slice(-10);
  }

  return digits;
}

export function rowToJson(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? '',
    serviceId: row.service_id,
    service: row.service,
    barberId: row.barber_id,
    barber: row.barber,
    date: row.date,
    time: row.time,
    note: row.note ?? '',
    createdAt: row.created_at,
  };
}
