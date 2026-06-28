import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import appointmentsRouter from './routes/appointments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use('/api/appointments', appointmentsRouter);
app.use(express.static(rootDir));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Berber app running at http://localhost:${PORT}`);
  console.log(`Barber panel: http://localhost:${PORT}/berber-panel.html`);
});
