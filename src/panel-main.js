import { LocalStorageAppointmentRepository } from './infrastructure/LocalStorageAppointmentRepository.js';
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
import { ToastView } from './ui/ToastView.js';
import { DatePickerView } from './ui/DatePickerView.js';
import { TimeSlotView } from './ui/TimeSlotView.js';
import { BarberCalendarView } from './ui/BarberCalendarView.js';
import { BarberPanelView } from './ui/BarberPanelView.js';
import { BarberPanelController } from './ui/BarberPanelController.js';
import { BarberManualAppointmentController } from './ui/BarberManualAppointmentController.js';
import { I18nView } from './ui/I18nView.js';

const eventBus = EventBus.getInstance();

function initLanguage() {
  new I18nView(document.getElementById('langSwitch'), () => {
    eventBus.publish(APP_EVENTS.LANGUAGE_CHANGED);
  });
  document.documentElement.lang = i18n.getLocale();
  i18n.applyPage();
}

function bootstrap() {
  const repository = LocalStorageAppointmentRepository.getInstance();

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

  panelView.calendarView = new BarberCalendarView(
    {
      title: document.getElementById('panelCalendarTitle'),
      daysContainer: document.getElementById('panelCalendarDays'),
      prevBtn: document.getElementById('panelPrevMonth'),
      nextBtn: document.getElementById('panelNextMonth'),
    },
    (isoDate) => panelView.selectDate(isoDate),
  );

  const timeSlotView = new TimeSlotView(
    document.getElementById('manualTime'),
    document.getElementById('manualTimeHint'),
    bookingFacade,
  );

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
    () => timeSlotView.refresh(
      document.getElementById('manualDate').value,
      panelFacade.getSession()?.barberId ?? '',
      timeSlotView.getValue(),
    ),
  );

  let panelController;

  const manualController = new BarberManualAppointmentController(
    document.getElementById('manualAppointmentForm'),
    manualDatePicker,
    timeSlotView,
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

  i18n.onChange(() => {
    manualDatePicker.rerender();
    timeSlotView.rerender();
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
