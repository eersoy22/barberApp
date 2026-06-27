import { LocalStorageAppointmentRepository } from './infrastructure/LocalStorageAppointmentRepository.js';
import {
  AppointmentService,
  AvailabilityService,
  AppointmentLookupService,
  BookingFacade,
} from './application/BookingFacade.js';
import {
  CompositeValidator,
  RequiredFieldsValidation,
  PhoneValidation,
  SlotAvailabilityValidation,
  LookupFieldsValidation,
} from './validation/ValidationStrategy.js';
import { EventBus } from './patterns/EventBus.js';
import { ToastView } from './ui/ToastView.js';
import { NavigationView } from './ui/NavigationView.js';
import { DatePickerView } from './ui/DatePickerView.js';
import { TimeSlotView } from './ui/TimeSlotView.js';
import { AppointmentFormController } from './ui/AppointmentFormController.js';
import { AppointmentLookupView } from './ui/AppointmentLookupView.js';
import { AppointmentLookupController } from './ui/AppointmentLookupController.js';

/**
 * Composition Root — bağımlılıkları bir araya getirir.
 */
function bootstrap() {
  const repository = LocalStorageAppointmentRepository.getInstance();
  const eventBus = EventBus.getInstance();

  const validator = new CompositeValidator([
    new RequiredFieldsValidation(),
    new PhoneValidation(),
    new SlotAvailabilityValidation(repository),
  ]);

  const appointmentService = new AppointmentService(repository, validator, eventBus);
  const availabilityService = new AvailabilityService(repository);
  const lookupService = new AppointmentLookupService(
    repository,
    new CompositeValidator([
      new LookupFieldsValidation(),
      new PhoneValidation(),
    ]),
    eventBus,
  );
  const bookingFacade = new BookingFacade(
    appointmentService,
    availabilityService,
    lookupService,
  );

  const toastView = new ToastView(document.getElementById('toast'));

  new NavigationView(
    document.getElementById('navToggle'),
    document.getElementById('navLinks'),
  );

  const timeSlotView = new TimeSlotView(
    document.getElementById('time'),
    document.getElementById('timeHint'),
    bookingFacade,
  );

  const datePicker = new DatePickerView(
    {
      trigger: document.getElementById('dateTrigger'),
      display: document.getElementById('dateDisplay'),
      input: document.getElementById('date'),
      popup: document.getElementById('calendarPopup'),
      title: document.getElementById('calendarTitle'),
      daysContainer: document.getElementById('calendarDays'),
      prevBtn: document.getElementById('prevMonth'),
      nextBtn: document.getElementById('nextMonth'),
    },
    () => timeSlotView.refresh(
      document.getElementById('date').value,
      document.getElementById('barber').value,
      timeSlotView.getValue(),
    ),
  );

  new AppointmentFormController(
    document.getElementById('appointmentForm'),
    datePicker,
    timeSlotView,
    bookingFacade,
    toastView,
    eventBus,
  );

  new AppointmentLookupController(
    document.getElementById('lookupForm'),
    new AppointmentLookupView(
      document.getElementById('lookupResults'),
      document.getElementById('lookupEmpty'),
    ),
    bookingFacade,
    toastView,
  );

  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    header.style.boxShadow = window.scrollY > 50
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : 'none';
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
