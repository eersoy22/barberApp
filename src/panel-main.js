import { ApiAppointmentRepository } from './infrastructure/ApiAppointmentRepository.js';
import {
  AppointmentService,
  AvailabilityService,
  BookingFacade,
} from './application/BookingFacade.js';
import { BarberPanelService, BarberPanelFacade } from './application/BarberPanelService.js';
import {
  CompositeValidator,
  ManualRequiredFieldsValidation,
  OptionalPhoneValidation,
  SlotAvailabilityValidation,
} from './validation/ValidationStrategy.js';
import { EventBus } from './patterns/EventBus.js';
import { APP_EVENTS } from './config/constants.js';
import { i18n } from './i18n/I18n.js';
import { ToastView } from './presentation/views/ToastView.js';
import { DatePickerView } from './presentation/views/DatePickerView.js';
import { TimeSlotView } from './presentation/views/TimeSlotView.js';
import { TimeSlotPresenter } from './presentation/controllers/TimeSlotPresenter.js';
import { BarberCalendarView } from './presentation/views/BarberCalendarView.js';
import { BarberPanelView } from './presentation/views/BarberPanelView.js';
import { BarberPanelController } from './presentation/controllers/BarberPanelController.js';
import { BarberManualAppointmentController } from './presentation/controllers/BarberManualAppointmentController.js';
import { I18nView } from './presentation/views/I18nView.js';

const eventBus = EventBus.getInstance();

function initLanguage() {
  new I18nView(document.getElementById('langSwitch'), () => {
    eventBus.publish(APP_EVENTS.LANGUAGE_CHANGED);
  });
  document.documentElement.lang = i18n.getLocale();
  i18n.applyPage();
}

function bootstrap() {
  const repository = ApiAppointmentRepository.getInstance();

  const bookingValidator = new CompositeValidator([
    new ManualRequiredFieldsValidation(),
    new OptionalPhoneValidation(),
    new SlotAvailabilityValidation(repository),
  ]);

  const bookingFacade = new BookingFacade(
    new AppointmentService(repository, bookingValidator, eventBus),
    new AvailabilityService(repository),
  );

  const panelFacade = new BarberPanelFacade(
    new BarberPanelService(repository),
    bookingFacade,
  );

  const toastView = new ToastView(document.getElementById('toast'));

  const panelView = new BarberPanelView({
    loginSection: document.getElementById('loginSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    loginForm: document.getElementById('panelLoginForm'),
    welcomeTitle: document.getElementById('welcomeTitle'),
    appointmentsContainer: document.getElementById('panelAppointments'),
    emptyMessage: document.getElementById('panelEmpty'),
    statsTotal: document.getElementById('statsTotal'),
    selectedDayTitle: document.getElementById('selectedDayTitle'),
    clearDayBtn: document.getElementById('clearDayBtn'),
    calendarView: null,
  });

  const timeSlotView = new TimeSlotView(
    document.getElementById('manualTime'),
    document.getElementById('manualTimeHint'),
  );
  const timeSlotPresenter = new TimeSlotPresenter(timeSlotView, bookingFacade);
  timeSlotPresenter.setMissingDateHint(i18n.t('appointment.selectDateFirst'));

  let panelController;
  let manualController;

  const manualDatePicker = new DatePickerView(
    {
      trigger: document.getElementById('manualDateTrigger'),
      display: document.getElementById('manualDateDisplay'),
      input: document.getElementById('manualDate'),
      popup: document.getElementById('manualCalendarPopup'),
      title: document.getElementById('manualCalendarTitle'),
      daysContainer: document.getElementById('manualCalendarDays'),
      prevBtn: document.getElementById('manualPrevMonth'),
      nextBtn: document.getElementById('manualNextMonth'),
    },
    () => manualController?.refreshTimeSlots(),
  );

  manualController = new BarberManualAppointmentController(
    document.getElementById('manualAppointmentForm'),
    manualDatePicker,
    timeSlotPresenter,
    panelFacade,
    toastView,
    eventBus,
    () => panelController.loadAppointments(),
  );

  panelController = new BarberPanelController(
    panelView,
    panelFacade,
    toastView,
    eventBus,
    manualController,
  );

  panelView.calendarView = new BarberCalendarView(
    {
      title: document.getElementById('panelCalendarTitle'),
      daysContainer: document.getElementById('panelCalendarDays'),
      prevBtn: document.getElementById('panelPrevMonth'),
      nextBtn: document.getElementById('panelNextMonth'),
    },
    (isoDate) => panelController.handleDateSelect(isoDate),
  );

  i18n.onChange(() => {
    manualDatePicker.rerender();
    panelView.calendarView?.render();
  });
}

function start() {
  initLanguage();
  bootstrap();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}

