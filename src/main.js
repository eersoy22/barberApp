import { createAppointmentRepository } from './infrastructure/createAppointmentRepository.js';
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
import { APP_EVENTS } from './config/constants.js';
import { i18n } from './i18n/I18n.js';
import { ToastView } from './presentation/views/ToastView.js';
import { NavigationView } from './presentation/views/NavigationView.js';
import { DatePickerView } from './presentation/views/DatePickerView.js';
import { TimeSlotView } from './presentation/views/TimeSlotView.js';
import { TimeSlotPresenter } from './presentation/controllers/TimeSlotPresenter.js';
import { AppointmentFormController } from './presentation/controllers/AppointmentFormController.js';
import { AppointmentLookupView } from './presentation/views/AppointmentLookupView.js';
import { AppointmentLookupController } from './presentation/controllers/AppointmentLookupController.js';
import { I18nView } from './presentation/views/I18nView.js';

/**
 * Composition Root — bağımlılıkları bir araya getirir.
 */
function bootstrap() {
  const repository = createAppointmentRepository();
  const eventBus = EventBus.getInstance();

  new I18nView(document.getElementById('langSwitch'), () => {
    eventBus.publish(APP_EVENTS.LANGUAGE_CHANGED);
  });
  document.documentElement.lang = i18n.getLocale();
  i18n.applyPage();

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
    document.getElementById('header'),
  );

  const timeSlotView = new TimeSlotView(
    document.getElementById('time'),
    document.getElementById('timeHint'),
  );
  const timeSlotPresenter = new TimeSlotPresenter(timeSlotView, bookingFacade);

  let appointmentFormController;

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
    () => appointmentFormController?.refreshTimeSlots(),
  );

  appointmentFormController = new AppointmentFormController(
    document.getElementById('appointmentForm'),
    datePicker,
    timeSlotPresenter,
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
    eventBus,
  );

  i18n.onChange(() => {
    datePicker.rerender();
  });
}

function start() {
  try {
    bootstrap();
  } catch (error) {
    console.error('Uygulama başlatılamadı:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
