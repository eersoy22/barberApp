import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isPastAppointment } from './dateUtils.js';
import { rowToJson } from './appointmentUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'barber.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    service_id TEXT,
    service TEXT,
    barber_id TEXT NOT NULL,
    barber TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_appointment_slot
    ON appointments(date, barber_id, time);
`);

const selectAllStmt = db.prepare(`
  SELECT id, name, phone, service_id, service, barber_id, barber, date, time, note, created_at
  FROM appointments
  ORDER BY date ASC, time ASC
`);

const selectByIdStmt = db.prepare(`
  SELECT id, name, phone, service_id, service, barber_id, barber, date, time, note, created_at
  FROM appointments
  WHERE id = ?
`);

const selectByBarberStmt = db.prepare(`
  SELECT id, name, phone, service_id, service, barber_id, barber, date, time, note, created_at
  FROM appointments
  WHERE barber_id = ?
  ORDER BY date ASC, time ASC
`);

const selectSlotStmt = db.prepare(`
  SELECT 1 FROM appointments
  WHERE date = ? AND barber_id = ? AND time = ?
  LIMIT 1
`);

const insertStmt = db.prepare(`
  INSERT INTO appointments (
    id, name, phone, service_id, service, barber_id, barber, date, time, note, created_at
  ) VALUES (
    @id, @name, @phone, @serviceId, @service, @barberId, @barber, @date, @time, @note, @createdAt
  )
`);

const deleteByIdStmt = db.prepare('DELETE FROM appointments WHERE id = ?');
const deleteByIdsStmt = db.prepare('DELETE FROM appointments WHERE id = ?');

function purgePastAppointments() {
  const rows = selectAllStmt.all();
  const pastIds = rows
    .filter((row) => isPastAppointment(row.date, row.time))
    .map((row) => row.id);

  if (pastIds.length === 0) return;

  const purge = db.transaction((ids) => {
    for (const id of ids) {
      deleteByIdsStmt.run(id);
    }
  });

  purge(pastIds);
}

function getActiveRows() {
  purgePastAppointments();
  return selectAllStmt.all();
}

export const appointmentStore = {
  findAll() {
    return getActiveRows().map(rowToJson);
  },

  findById(id) {
    purgePastAppointments();
    const row = selectByIdStmt.get(id);
    if (!row) return null;
    if (isPastAppointment(row.date, row.time)) {
      deleteByIdStmt.run(id);
      return null;
    }
    return rowToJson(row);
  },

  findByBarberId(barberId) {
    purgePastAppointments();
    return selectByBarberStmt.all(barberId)
      .filter((row) => !isPastAppointment(row.date, row.time))
      .map(rowToJson);
  },

  isSlotBooked(date, barberId, time) {
    purgePastAppointments();
    return Boolean(selectSlotStmt.get(date, barberId, time));
  },

  save(appointment) {
    purgePastAppointments();

    try {
      insertStmt.run({
        id: appointment.id,
        name: appointment.name,
        phone: appointment.phone ?? '',
        serviceId: appointment.serviceId,
        service: appointment.service,
        barberId: appointment.barberId,
        barber: appointment.barber,
        date: appointment.date,
        time: appointment.time,
        note: appointment.note ?? '',
        createdAt: appointment.createdAt,
      });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const conflict = new Error('Slot already booked');
        conflict.code = 'SLOT_TAKEN';
        throw conflict;
      }
      throw error;
    }

    return appointment;
  },

  deleteById(id) {
    deleteByIdStmt.run(id);
  },
};

export default db;
