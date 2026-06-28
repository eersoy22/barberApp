import { Router } from 'express';
import { appointmentStore } from '../db.js';
import { normalizeName, normalizePhone } from '../appointmentUtils.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(appointmentStore.findAll());
});

router.get('/slot-booked', (req, res) => {
  const { date, barberId, time } = req.query;

  if (!date || !barberId || !time) {
    res.status(400).json({ message: 'date, barberId and time are required' });
    return;
  }

  res.json({ booked: appointmentStore.isSlotBooked(date, barberId, time) });
});

router.get('/by-customer', (req, res) => {
  const { name, phone } = req.query;

  if (!name || !phone) {
    res.status(400).json({ message: 'name and phone are required' });
    return;
  }

  const normalizedName = normalizeName(name);
  const normalizedPhone = normalizePhone(phone);

  const appointments = appointmentStore.findAll()
    .filter((appointment) => (
      normalizeName(appointment.name) === normalizedName
      && normalizePhone(appointment.phone) === normalizedPhone
    ));

  res.json(appointments);
});

router.get('/by-barber/:barberId', (req, res) => {
  res.json(appointmentStore.findByBarberId(req.params.barberId));
});

router.get('/:id', (req, res) => {
  const appointment = appointmentStore.findById(req.params.id);

  if (!appointment) {
    res.status(404).json({ message: 'Appointment not found' });
    return;
  }

  res.json(appointment);
});

router.post('/', (req, res) => {
  const appointment = req.body;

  if (!appointment?.id || !appointment?.name || !appointment?.barberId
    || !appointment?.date || !appointment?.time) {
    res.status(400).json({ message: 'Invalid appointment payload' });
    return;
  }

  try {
    appointmentStore.save(appointment);
    res.status(201).json(appointment);
  } catch (error) {
    if (error.code === 'SLOT_TAKEN') {
      res.status(409).json({ message: 'Slot already booked', code: 'SLOT_TAKEN' });
      return;
    }
    throw error;
  }
});

router.delete('/:id', (req, res) => {
  const appointment = appointmentStore.findById(req.params.id);

  if (!appointment) {
    res.status(404).json({ message: 'Appointment not found' });
    return;
  }

  appointmentStore.deleteById(req.params.id);
  res.status(204).send();
});

export default router;
