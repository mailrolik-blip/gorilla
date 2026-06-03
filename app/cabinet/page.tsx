'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import {
  WorkspaceCanvas,
  WorkspaceDisclosure,
  WorkspaceHero,
  WorkspaceInset,
  WorkspaceScoreStrip,
} from '@/components/workspace-frame';
import { useGorillaAccount } from '@/components/gorilla-account-provider';
import { PromoTicketWorkspace } from '@/components/promo-ticket-workspace';
import { WorkspaceSectionNav } from '@/components/workspace-section-nav';
import { homepageSchoolContent } from '@/content/homepage-school';
import { getRoleCapabilities } from '@/lib/app-access';

type CitySummary = {
  id: number;
  name: string;
};

type PersonSummary = {
  id: number;
  profileType: string;
  firstName: string | null;
  lastName: string | null;
};

type CurrentUserSummary = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  staffRole: string | null;
  roles: string[];
  preferredCity: CitySummary | null;
  profile: PersonSummary | null;
};

type ParticipantSummary = PersonSummary & {
  birthDate: string | null;
  city: CitySummary | null;
};

type TrainingBookingSummary = {
  id: number;
  status: string;
  participant: ParticipantSummary | null;
  training: {
    trainingId: number;
    name: string;
    trainingType: string;
    startTime: string;
    endTime: string;
    location: string;
    city: CitySummary;
  };
};

type AvailableTrainingSummary = {
  trainingId: number;
  name: string;
  description: string | null;
  trainingType: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  isActive: boolean;
  city: CitySummary;
  trainer: {
    id: number;
    email: string | null;
    phone: string | null;
    telegramId: string | null;
  } | null;
  _count: {
    bookings: number;
  };
};

type TeamApplicationSummary = {
  id: number;
  status: string;
  commentFromApplicant: string | null;
  participant: ParticipantSummary | null;
  team: {
    id: number;
    name: string;
    city: CitySummary | null;
  };
};

type AvailableTeamSummary = {
  id: number;
  name: string;
  city: CitySummary | null;
  description?: string | null;
};

type AvailableRentalSlotSummary = {
  id: number;
  startsAt: string;
  endsAt: string;
  status: string;
  availability: string;
  resource: {
    id: number;
    name: string;
    resourceType: string | null;
  };
  facility: {
    id: number;
    name: string;
  };
  city: CitySummary;
};

type RentalBookingSummary = {
  id: number;
  status: string;
  participant: ParticipantSummary | null;
  slot: {
    id: number;
    startsAt: string;
    endsAt: string;
    status: string;
  };
  resource: {
    id: number;
    name: string;
    resourceType: string | null;
  };
  facility: {
    id: number;
    name: string;
  };
  city: CitySummary;
};

type DashboardPayload = {
  currentUser: CurrentUserSummary;
  participants: ParticipantSummary[];
  trainingBookings: TrainingBookingSummary[];
  teamApplications: TeamApplicationSummary[];
  rentalBookings: RentalBookingSummary[];
};

type ParticipantProfileKind = 'SELF' | 'CHILD';

type ParticipantFormState = {
  firstName: string;
  lastName: string;
  profileKind: ParticipantProfileKind;
  birthDate: string;
};

type TrainingFeedback = {
  scope: 'catalog' | 'bookings';
  tone: 'success' | 'error';
  message: string;
};

type TeamFeedback = {
  scope: 'catalog' | 'applications';
  tone: 'success' | 'error';
  message: string;
};

type RentalFeedback = {
  scope: 'catalog' | 'bookings';
  tone: 'success' | 'error';
  message: string;
};

type CabinetSectionId =
  | 'overview'
  | 'participants'
  | 'trainings'
  | 'team'
  | 'rentals'
  | 'promo';

const roleLabels: Record<string, string> = {
  USER: 'Пользователь',
  COACH: 'Тренер',
  MANAGER: 'Менеджер',
  ADMIN: 'Администратор',
};

const profileTypeLabels: Record<string, string> = {
  PLAYER: 'Игрок',
  CHILD: 'Ребёнок',
  PARENT: 'Родитель',
  ADULT: 'Взрослый',
};

const participantProfileKindLabels: Record<ParticipantProfileKind, string> = {
  SELF: 'Свой профиль',
  CHILD: 'Ребёнок',
};

const trainingTypeLabels: Record<string, string> = {
  general: 'Общая',
  GENERAL: 'Общая',
  group: 'Групповая',
  GROUP: 'Групповая',
  private: 'Индивидуальная',
  PRIVATE: 'Индивидуальная',
  individual: 'Индивидуальная',
  INDIVIDUAL: 'Индивидуальная',
};

const statusLabels: Record<string, string> = {
  booked: 'Запись оформлена',
  cancelled: 'Отменено',
  PENDING: 'На рассмотрении',
  IN_REVIEW: 'В работе',
  ACCEPTED: 'Одобрено',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено',
  PENDING_CONFIRMATION: 'Ждет подтверждения',
  CONFIRMED: 'Подтверждено',
  AVAILABLE: 'Доступно',
  BOOKED: 'Забронировано',
  UNAVAILABLE: 'Недоступно',
};

const activeTeamApplicationStatuses = new Set(['PENDING', 'IN_REVIEW', 'ACCEPTED']);

const initialParticipantFormState: ParticipantFormState = {
  firstName: '',
  lastName: '',
  profileKind: 'SELF',
  birthDate: '',
};

function translateErrorMessage(message: string) {
  const errorMessages: Record<string, string> = {
    'Failed to load dashboard': 'Не удалось загрузить кабинет.',
    'Failed to fetch dashboard': 'Не удалось загрузить кабинет.',
    'Failed to load trainings': 'Не удалось загрузить список тренировок.',
    'Failed to load teams': 'Не удалось загрузить список команд.',
    'Failed to load team applications': 'Не удалось загрузить ваши заявки в команду.',
    'Failed to load rental slots': 'Не удалось загрузить список слотов аренды.',
    'Failed to load rental bookings': 'Не удалось загрузить ваши бронирования аренды.',
    'Failed to fetch current user team applications':
      'Не удалось загрузить ваши заявки в команду.',
    'Failed to fetch public rental slots': 'Не удалось загрузить список слотов аренды.',
    'Failed to fetch current user rental bookings':
      'Не удалось загрузить ваши бронирования аренды.',
    'Failed to save participant': 'Не удалось сохранить профиль.',
    'Failed to book training': 'Не удалось оформить запись на тренировку.',
    'Failed to cancel training booking': 'Не удалось отменить запись на тренировку.',
    'Failed to create team application': 'Не удалось отправить заявку в команду.',
    'Failed to cancel team application': 'Не удалось отменить заявку в команду.',
    'Failed to create rental booking': 'Не удалось оформить бронирование аренды.',
    'Failed to cancel rental booking': 'Не удалось отменить бронирование аренды.',
    'Current user is not authenticated': 'Пользователь не авторизован.',
    'User not found': 'Пользователь не найден.',
    'Participant not found': 'Профиль не найден.',
    'Team not found': 'Команда не найдена.',
    'Rental slot not found': 'Слот аренды не найден.',
    'Training not found': 'Тренировка не найдена.',
    'Training is not active': 'Запись на эту тренировку сейчас недоступна.',
    'Training is full': 'Свободных мест на тренировку больше нет.',
    'Rental slot is unavailable': 'Слот аренды сейчас недоступен.',
    'Rental slot is not available': 'Этот слот аренды сейчас недоступен для бронирования.',
    'Rental slot is already booked': 'Этот слот аренды уже забронирован.',
    'Already booked': 'Этот профиль уже записан на эту тренировку.',
    'Active team application already exists':
      'Для выбранного профиля уже есть активная заявка в эту команду.',
    'Training booking not found': 'Запись на тренировку не найдена.',
    'Training booking is already cancelled': 'Запись на тренировку уже отменена.',
    'Team application not found': 'Заявка в команду не найдена.',
    'Team application is already cancelled': 'Заявка в команду уже отменена.',
    'Rental booking not found': 'Бронирование аренды не найдено.',
    'Rental booking is already cancelled': 'Бронирование аренды уже отменено.',
    'Invalid team id': 'Некорректная команда.',
    'Invalid team application id': 'Некорректная заявка в команду.',
    'Invalid rental slot id': 'Некорректный слот аренды.',
    'Invalid rental booking id': 'Некорректное бронирование аренды.',
    'training id and participantId must be positive integers':
      'Некорректно указаны тренировка или профиль.',
    'participantId must be a positive integer':
      'Выберите корректный профиль.',
    'commentFromApplicant must be a string':
      'Комментарий к заявке указан некорректно.',
    'noteFromUser must be a string':
      'Комментарий к бронированию указан некорректно.',
    'userId and profileType are required':
      'Не удалось создать профиль: не хватает обязательных данных.',
    'profileType cannot be empty': 'Тип профиля не может быть пустым.',
    'birthDate must be a valid date': 'Укажите корректную дату рождения.',
    'No valid fields provided for update': 'Нет данных для обновления профиля.',
    'Invalid relation provided': 'Связанные данные указаны некорректно.',
    'Parent participant not found': 'Родительский профиль не найден.',
    'City not found': 'Город не найден.',
    'Method not allowed': 'Метод не поддерживается.',
    'Server error': 'Сервер временно недоступен.',
  };

  return errorMessages[message] ?? message;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatRoleList(roles: string[]) {
  if (roles.length === 0) {
    return 'Не указаны';
  }

  return roles.map((role) => roleLabels[role] ?? role).join(', ');
}

function formatProfileType(profileType: string | null) {
  if (!profileType) {
    return 'Профиль';
  }

  return profileTypeLabels[profileType] ?? profileType;
}

function formatPersonName(person: PersonSummary | null) {
  if (!person) {
    return 'Профиль не указан';
  }

  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ');

  return fullName || formatProfileType(person.profileType);
}

function formatStatus(status: string) {
  return statusLabels[status] ?? status;
}

function getTeamApplicationStatusBadgeClass(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-500/15 text-emerald-100';
    case 'REJECTED':
      return 'bg-rose-500/15 text-rose-100';
    case 'CANCELLED':
      return 'border border-white/10 bg-black/20 text-stone-300';
    case 'IN_REVIEW':
      return 'bg-sky-500/15 text-sky-100';
    default:
      return 'bg-amber-500/15 text-amber-100';
  }
}

function getRentalBookingStatusBadgeClass(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-500/15 text-emerald-100';
    case 'CANCELLED':
      return 'border border-white/10 bg-black/20 text-stone-300';
    default:
      return 'bg-sky-500/15 text-sky-100';
  }
}

function formatTrainingType(trainingType: string) {
  return trainingTypeLabels[trainingType] ?? trainingType;
}

function formatTrainerName(trainer: AvailableTrainingSummary['trainer']) {
  if (!trainer) {
    return 'Не указан';
  }

  if (trainer.email) {
    return trainer.email;
  }

  if (trainer.telegramId) {
    return `@${trainer.telegramId}`;
  }

  if (trainer.phone) {
    return trainer.phone;
  }

  return `Тренер #${trainer.id}`;
}

function sortAndFilterAvailableTrainings(trainings: AvailableTrainingSummary[]) {
  const now = Date.now();

  return [...trainings]
    .filter((training) => new Date(training.endTime).getTime() >= now)
    .sort(
      (left, right) =>
        new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
    );
}

function getTrainingDayKey(startTime: string) {
  return new Date(startTime).toISOString().split('T')[0]; // YYYY-MM-DD
}

function groupTrainingsByDay(trainings: AvailableTrainingSummary[]) {
  const grouped: Record<string, AvailableTrainingSummary[]> = {};
  
  for (const training of trainings) {
    const dayKey = getTrainingDayKey(training.startTime);
    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    grouped[dayKey].push(training);
  }
  
  return grouped;
}

function formatTrainingDay(dateString: string) {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Завтра';
  }
  
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function sortAndFilterAvailableRentalSlots(slots: AvailableRentalSlotSummary[]) {
  const now = Date.now();

  return [...slots]
    .filter((slot) => new Date(slot.endsAt).getTime() >= now)
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
    );
}

function getTrainingAvailability(training: AvailableTrainingSummary) {
  const placesLeft = Math.max(training.capacity - training._count.bookings, 0);

  if (!training.isActive) {
    return {
      canBook: false,
      label: 'Набор закрыт',
      detail: 'Тренировка временно недоступна для записи.',
      badgeClass: 'border border-white/10 bg-black/20 text-stone-300',
    };
  }

  if (new Date(training.endTime).getTime() < Date.now()) {
    return {
      canBook: false,
      label: 'Тренировка завершена',
      detail: 'Запись на прошедшие тренировки недоступна.',
      badgeClass: 'border border-white/10 bg-black/20 text-stone-300',
    };
  }

  if (placesLeft === 0) {
    return {
      canBook: false,
      label: 'Мест нет',
      detail: `Записано ${training._count.bookings} из ${training.capacity}.`,
      badgeClass: 'bg-rose-500/15 text-rose-100',
    };
  }

  return {
    canBook: true,
    label: `Свободно ${placesLeft} из ${training.capacity}`,
    detail: `Уже записано ${training._count.bookings} из ${training.capacity}.`,
    badgeClass: 'bg-emerald-500/15 text-emerald-100',
  };
}

function getRentalSlotAvailability(slot: AvailableRentalSlotSummary) {
  if (new Date(slot.endsAt).getTime() < Date.now()) {
    return {
      canBook: false,
      label: 'Слот завершен',
      detail: 'Бронирование этого слота уже недоступно.',
      badgeClass: 'border border-white/10 bg-black/20 text-stone-300',
    };
  }

  if (slot.status === 'BOOKED') {
    return {
      canBook: false,
      label: 'Забронировано',
      detail: 'Этот слот уже занят.',
      badgeClass: 'bg-amber-500/15 text-amber-100',
    };
  }

  if (slot.status === 'UNAVAILABLE') {
    return {
      canBook: false,
      label: 'Недоступно',
      detail: 'Этот слот сейчас недоступен для бронирования.',
      badgeClass: 'border border-white/10 bg-black/20 text-stone-300',
    };
  }

  return {
    canBook: true,
    label: 'Доступно',
    detail: 'Слот открыт для бронирования.',
    badgeClass: 'bg-emerald-500/15 text-emerald-100',
  };
}

function getParticipantProfileKind(profileType: string): ParticipantProfileKind {
  return profileType === 'CHILD' ? 'CHILD' : 'SELF';
}

function toParticipantFormState(
  participant: ParticipantSummary
): ParticipantFormState {
  return {
    firstName: participant.firstName ?? '',
    lastName: participant.lastName ?? '',
    profileKind: getParticipantProfileKind(participant.profileType),
    birthDate: participant.birthDate ? participant.birthDate.slice(0, 10) : '',
  };
}

function resolveProfileTypeForSubmit(
  profileKind: ParticipantProfileKind,
  originalProfileType: string | null
) {
  if (profileKind === 'CHILD') {
    return 'CHILD';
  }

  if (originalProfileType && originalProfileType !== 'CHILD') {
    return originalProfileType;
  }

  return 'PLAYER';
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });
  const payload = await response.json().catch(() => null);

  return { response, payload };
}

function SectionCard(props: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-6 ${props.className ?? ''}`}>
      <div className="max-w-3xl border-b border-white/8 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
          {props.eyebrow}
        </p>
        <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-white">
          {props.title}
        </h2>
      </div>
      <div>{props.children}</div>
    </section>
  );
}

export default function CabinetPage() {
  const { pointsBalance, nextReward, unlockedRewards } = useGorillaAccount();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [activeCabinetSection, setActiveCabinetSection] =
    useState<CabinetSectionId>('overview');
  const [isParticipantFormOpen, setIsParticipantFormOpen] = useState(false);
  const [participantForm, setParticipantForm] = useState<ParticipantFormState>(
    initialParticipantFormState
  );
  const [participantFormMode, setParticipantFormMode] = useState<'create' | 'edit'>(
    'create'
  );
  const [editingParticipantId, setEditingParticipantId] = useState<number | null>(
    null
  );
  const [editingOriginalProfileType, setEditingOriginalProfileType] = useState<
    string | null
  >(null);
  const [participantStatus, setParticipantStatus] = useState<'idle' | 'saving'>(
    'idle'
  );
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [participantSuccess, setParticipantSuccess] = useState<string | null>(null);
  const [availableTrainings, setAvailableTrainings] = useState<
    AvailableTrainingSummary[]
  >([]);
  const [trainingsStatus, setTrainingsStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [trainingsError, setTrainingsError] = useState<string | null>(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    Record<number, string>
  >({});
  const [bookingTrainingId, setBookingTrainingId] = useState<number | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null
  );
  const [trainingFeedback, setTrainingFeedback] = useState<TrainingFeedback | null>(
    null
  );
  const [selectedTrainingDay, setSelectedTrainingDay] = useState<string | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [availableTeams, setAvailableTeams] = useState<AvailableTeamSummary[]>([]);
  const [teamsStatus, setTeamsStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [teamApplications, setTeamApplications] = useState<TeamApplicationSummary[]>(
    []
  );
  const [teamApplicationsStatus, setTeamApplicationsStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [teamApplicationsError, setTeamApplicationsError] = useState<string | null>(
    null
  );
  const [selectedTeamParticipantIds, setSelectedTeamParticipantIds] = useState<
    Record<number, string>
  >({});
  const [teamComments, setTeamComments] = useState<Record<number, string>>({});
  const [submittingTeamId, setSubmittingTeamId] = useState<number | null>(null);
  const [cancellingTeamApplicationId, setCancellingTeamApplicationId] = useState<
    number | null
  >(null);
  const [teamFeedback, setTeamFeedback] = useState<TeamFeedback | null>(null);
  const [activeTeamCatalogId, setActiveTeamCatalogId] = useState<number | null>(null);
  const [publicRentalSlots, setPublicRentalSlots] = useState<
    AvailableRentalSlotSummary[]
  >([]);
  const [rentalSlotsStatus, setRentalSlotsStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [rentalSlotsError, setRentalSlotsError] = useState<string | null>(null);
  const [rentalBookings, setRentalBookings] = useState<RentalBookingSummary[]>([]);
  const [rentalBookingsStatus, setRentalBookingsStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [rentalBookingsError, setRentalBookingsError] = useState<string | null>(
    null
  );
  const [selectedRentalParticipantValues, setSelectedRentalParticipantValues] =
    useState<Record<number, string>>({});
  const [rentalNotes, setRentalNotes] = useState<Record<number, string>>({});
  const [bookingRentalSlotId, setBookingRentalSlotId] = useState<number | null>(
    null
  );
  const [cancellingRentalBookingId, setCancellingRentalBookingId] = useState<
    number | null
  >(null);
  const [rentalFeedback, setRentalFeedback] = useState<RentalFeedback | null>(null);
  const [activeRentalCatalogSlotId, setActiveRentalCatalogSlotId] = useState<
    number | null
  >(null);

  const handleUnauthorized = useCallback(() => {
    setDashboard(null);
    setStatus('error');
    setError(
      'Личный кабинет доступен для аккаунтов, которые уже подключены администратором Gorilla Hockey. Автоматический dev-вход в публичном контуре отключен.'
    );
  }, []);

  function resetParticipantForm(options?: { preserveSuccess?: boolean }) {
    setParticipantForm(initialParticipantFormState);
    setParticipantFormMode('create');
    setEditingParticipantId(null);
    setEditingOriginalProfileType(null);
    setParticipantError(null);
    if (!options?.preserveSuccess) {
      setParticipantSuccess(null);
    }
  }

  function openParticipantCreateForm() {
    resetParticipantForm();
    setIsParticipantFormOpen(true);
  }

  function closeParticipantForm() {
    resetParticipantForm();
    setIsParticipantFormOpen(false);
  }

  function handleParticipantInputChange<Field extends keyof ParticipantFormState>(
    field: Field,
    value: ParticipantFormState[Field]
  ) {
    setParticipantForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setParticipantError(null);
    setParticipantSuccess(null);
  }

  function beginParticipantEdit(participant: ParticipantSummary) {
    setParticipantForm(toParticipantFormState(participant));
    setParticipantFormMode('edit');
    setEditingParticipantId(participant.id);
    setEditingOriginalProfileType(participant.profileType);
    setParticipantError(null);
    setParticipantSuccess(null);
    setIsParticipantFormOpen(true);
  }

  function handleTrainingParticipantChange(trainingId: number, participantId: string) {
    setSelectedParticipantIds((currentSelections) => ({
      ...currentSelections,
      [trainingId]: participantId,
    }));
    setTrainingFeedback((currentFeedback) =>
      currentFeedback?.scope === 'catalog' ? null : currentFeedback
    );
  }

  function getSelectedParticipantIdForTraining(trainingId: number) {
    if (!dashboard || dashboard.participants.length === 0) {
      return null;
    }

    const storedValue = selectedParticipantIds[trainingId];
    const parsedValue = storedValue ? Number(storedValue) : NaN;

    if (
      Number.isInteger(parsedValue) &&
      dashboard.participants.some((participant) => participant.id === parsedValue)
    ) {
      return parsedValue;
    }

    return dashboard.participants[0].id;
  }

  function handleTeamParticipantChange(teamId: number, participantId: string) {
    setSelectedTeamParticipantIds((currentSelections) => ({
      ...currentSelections,
      [teamId]: participantId,
    }));
    setTeamFeedback((currentFeedback) =>
      currentFeedback?.scope === 'catalog' ? null : currentFeedback
    );
  }

  function handleTeamCommentChange(teamId: number, comment: string) {
    setTeamComments((currentComments) => ({
      ...currentComments,
      [teamId]: comment,
    }));
    setTeamFeedback((currentFeedback) =>
      currentFeedback?.scope === 'catalog' ? null : currentFeedback
    );
  }

  function getSelectedParticipantIdForTeam(teamId: number) {
    if (!dashboard || dashboard.participants.length === 0) {
      return null;
    }

    const storedValue = selectedTeamParticipantIds[teamId];
    const parsedValue = storedValue ? Number(storedValue) : NaN;

    if (
      Number.isInteger(parsedValue) &&
      dashboard.participants.some((participant) => participant.id === parsedValue)
    ) {
      return parsedValue;
    }

    return dashboard.participants[0].id;
  }

  function getActiveTeamApplication(teamId: number, participantId: number | null) {
    if (participantId === null) {
      return null;
    }

    return (
      teamApplications.find(
        (application) =>
          application.team.id === teamId &&
          application.participant?.id === participantId &&
          activeTeamApplicationStatuses.has(application.status)
      ) ?? null
    );
  }

  function handleRentalParticipantChange(slotId: number, participantValue: string) {
    setSelectedRentalParticipantValues((currentSelections) => ({
      ...currentSelections,
      [slotId]: participantValue,
    }));
    setRentalFeedback((currentFeedback) =>
      currentFeedback?.scope === 'catalog' ? null : currentFeedback
    );
  }

  function handleRentalNoteChange(slotId: number, note: string) {
    setRentalNotes((currentNotes) => ({
      ...currentNotes,
      [slotId]: note,
    }));
    setRentalFeedback((currentFeedback) =>
      currentFeedback?.scope === 'catalog' ? null : currentFeedback
    );
  }

  function getSelectedRentalParticipantValue(slotId: number) {
    if (!dashboard) {
      return 'self';
    }

    const storedValue = selectedRentalParticipantValues[slotId];

    if (storedValue === 'self') {
      return storedValue;
    }

    const parsedValue = storedValue ? Number(storedValue) : NaN;

    if (
      Number.isInteger(parsedValue) &&
      dashboard.participants.some((participant) => participant.id === parsedValue)
    ) {
      return storedValue;
    }

    return 'self';
  }

  function getSelectedParticipantIdForRental(slotId: number) {
    if (!dashboard) {
      return null;
    }

    const selectedValue = getSelectedRentalParticipantValue(slotId);

    if (selectedValue === 'self') {
      return null;
    }

    const parsedValue = Number(selectedValue);

    return Number.isInteger(parsedValue) ? parsedValue : null;
  }

  async function reloadDashboard(keepContent: boolean) {
    if (!keepContent) {
      setStatus('loading');
    }

    setError(null);

    const { response, payload } = await fetchJson('/api/me/dashboard');

    if (response.status === 401) {
      handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      const message = translateErrorMessage(
        (payload as { error?: string } | null)?.error || 'Failed to load dashboard'
      );
      setError(message);

      if (!keepContent || dashboard === null) {
        setStatus('error');
      }

      return false;
    }

    setDashboard(payload as DashboardPayload);
    setStatus('ready');
    return true;
  }

  async function reloadAvailableTrainings(keepContent: boolean) {
    if (!keepContent) {
      setTrainingsStatus('loading');
    }

    setTrainingsError(null);

    const { response, payload } = await fetchJson('/api/trainings?isActive=true');

    if (!response.ok) {
      const message = translateErrorMessage(
        (payload as { error?: string } | null)?.error || 'Failed to load trainings'
      );
      setTrainingsError(message);

      if (!keepContent || availableTrainings.length === 0) {
        setTrainingsStatus('error');
      }

      return false;
    }

    setAvailableTrainings(
      sortAndFilterAvailableTrainings(payload as AvailableTrainingSummary[])
    );
    setTrainingsStatus('ready');
    return true;
  }

  async function reloadAvailableTeams(keepContent: boolean) {
    if (!keepContent) {
      setTeamsStatus('loading');
    }

    setTeamsError(null);

    const { response, payload } = await fetchJson('/api/teams');

    if (response.status === 401) {
      handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      const message = translateErrorMessage(
        (payload as { error?: string } | null)?.error || 'Failed to load teams'
      );
      setTeamsError(message);

      if (!keepContent || availableTeams.length === 0) {
        setTeamsStatus('error');
      }

      return false;
    }

    setAvailableTeams(payload as AvailableTeamSummary[]);
    setTeamsStatus('ready');
    return true;
  }

  async function reloadPublicRentalSlots(keepContent: boolean) {
    if (!keepContent) {
      setRentalSlotsStatus('loading');
    }

    setRentalSlotsError(null);

    const { response, payload } = await fetchJson('/api/public/rental-slots');

    if (!response.ok) {
      const message = translateErrorMessage(
        (payload as { error?: string } | null)?.error ||
          'Failed to load rental slots'
      );
      setRentalSlotsError(message);

      if (!keepContent || publicRentalSlots.length === 0) {
        setRentalSlotsStatus('error');
      }

      return false;
    }

    setPublicRentalSlots(
      sortAndFilterAvailableRentalSlots(payload as AvailableRentalSlotSummary[])
    );
    setRentalSlotsStatus('ready');
    return true;
  }

  async function reloadTeamApplications(keepContent: boolean) {
    if (!keepContent) {
      setTeamApplicationsStatus('loading');
    }

    setTeamApplicationsError(null);

    const { response, payload } = await fetchJson('/api/my/team-applications');

    if (response.status === 401) {
      handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      const message = translateErrorMessage(
        (payload as { error?: string } | null)?.error ||
          'Failed to load team applications'
      );
      setTeamApplicationsError(message);

      if (!keepContent || teamApplications.length === 0) {
        setTeamApplicationsStatus('error');
      }

      return false;
    }

    setTeamApplications(payload as TeamApplicationSummary[]);
    setTeamApplicationsStatus('ready');
    return true;
  }

  async function reloadRentalBookings(keepContent: boolean) {
    if (!keepContent) {
      setRentalBookingsStatus('loading');
    }

    setRentalBookingsError(null);

    const { response, payload } = await fetchJson('/api/my/rental-bookings');

    if (response.status === 401) {
      handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      const message = translateErrorMessage(
        (payload as { error?: string } | null)?.error ||
          'Failed to load rental bookings'
      );
      setRentalBookingsError(message);

      if (!keepContent || rentalBookings.length === 0) {
        setRentalBookingsStatus('error');
      }

      return false;
    }

    setRentalBookings(payload as RentalBookingSummary[]);
    setRentalBookingsStatus('ready');
    return true;
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      setStatus('loading');
      setError(null);

      try {
        const { response, payload } = await fetchJson('/api/me/dashboard');

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(
              (payload as { error?: string } | null)?.error ||
                'Failed to load dashboard'
            )
          );
        }

        if (!isCancelled) {
          setDashboard(payload as DashboardPayload);
          setStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить кабинет.'
          );
          setStatus('error');
        }
      }
    }

    void loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    let isCancelled = false;

    async function loadAvailableTrainings() {
      setTrainingsStatus('loading');
      setTrainingsError(null);

      try {
        const { response, payload } = await fetchJson('/api/trainings?isActive=true');

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(
              (payload as { error?: string } | null)?.error ||
                'Failed to load trainings'
            )
          );
        }

        if (!isCancelled) {
          setAvailableTrainings(
            sortAndFilterAvailableTrainings(payload as AvailableTrainingSummary[])
          );
          setTrainingsStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setTrainingsError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить список тренировок.'
          );
          setTrainingsStatus('error');
        }
      }
    }

    void loadAvailableTrainings();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadAvailableTeams() {
      setTeamsStatus('loading');
      setTeamsError(null);

      try {
        const { response, payload } = await fetchJson('/api/teams');

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(
              (payload as { error?: string } | null)?.error || 'Failed to load teams'
            )
          );
        }

        if (!isCancelled) {
          setAvailableTeams(payload as AvailableTeamSummary[]);
          setTeamsStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setTeamsError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить список команд.'
          );
          setTeamsStatus('error');
        }
      }
    }

    void loadAvailableTeams();

    return () => {
      isCancelled = true;
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    let isCancelled = false;

    async function loadPublicRentalSlots() {
      setRentalSlotsStatus('loading');
      setRentalSlotsError(null);

      try {
        const { response, payload } = await fetchJson('/api/public/rental-slots');

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(
              (payload as { error?: string } | null)?.error ||
                'Failed to load rental slots'
            )
          );
        }

        if (!isCancelled) {
          setPublicRentalSlots(
            sortAndFilterAvailableRentalSlots(
              payload as AvailableRentalSlotSummary[]
            )
          );
          setRentalSlotsStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setRentalSlotsError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить список слотов аренды.'
          );
          setRentalSlotsStatus('error');
        }
      }
    }

    void loadPublicRentalSlots();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadTeamApplications() {
      setTeamApplicationsStatus('loading');
      setTeamApplicationsError(null);

      try {
        const { response, payload } = await fetchJson('/api/my/team-applications');

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(
              (payload as { error?: string } | null)?.error ||
                'Failed to load team applications'
            )
          );
        }

        if (!isCancelled) {
          setTeamApplications(payload as TeamApplicationSummary[]);
          setTeamApplicationsStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setTeamApplicationsError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить ваши заявки в команду.'
          );
          setTeamApplicationsStatus('error');
        }
      }
    }

    void loadTeamApplications();

    return () => {
      isCancelled = true;
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    let isCancelled = false;

    async function loadRentalBookings() {
      setRentalBookingsStatus('loading');
      setRentalBookingsError(null);

      try {
        const { response, payload } = await fetchJson('/api/my/rental-bookings');

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            translateErrorMessage(
              (payload as { error?: string } | null)?.error ||
                'Failed to load rental bookings'
            )
          );
        }

        if (!isCancelled) {
          setRentalBookings(payload as RentalBookingSummary[]);
          setRentalBookingsStatus('ready');
        }
      } catch (loadError) {
        if (!isCancelled) {
          setRentalBookingsError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить ваши бронирования аренды.'
          );
          setRentalBookingsStatus('error');
        }
      }
    }

    void loadRentalBookings();

    return () => {
      isCancelled = true;
    };
  }, [handleUnauthorized]);

  async function refreshTrainingSections() {
    const [dashboardWasReloaded, trainingsWereReloaded] = await Promise.all([
      reloadDashboard(true),
      reloadAvailableTrainings(true),
    ]);

    return dashboardWasReloaded && trainingsWereReloaded;
  }

  async function refreshTeamApplicationsSection() {
    const [teamApplicationsWereReloaded] = await Promise.all([
      reloadTeamApplications(true),
      reloadAvailableTeams(true),
    ]);

    return teamApplicationsWereReloaded;
  }

  async function refreshRentalSections() {
    const [
      dashboardWasReloaded,
      rentalSlotsWereReloaded,
      rentalBookingsWereReloaded,
    ] = await Promise.all([
      reloadDashboard(true),
      reloadPublicRentalSlots(true),
      reloadRentalBookings(true),
    ]);

    return (
      dashboardWasReloaded &&
      rentalSlotsWereReloaded &&
      rentalBookingsWereReloaded
    );
  }

  async function handleParticipantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dashboard) {
      setParticipantError('Кабинет еще не загружен.');
      return;
    }

    const firstName = participantForm.firstName.trim();
    const lastName = participantForm.lastName.trim();

    if (!firstName || !lastName) {
      setParticipantError('Укажите имя и фамилию.');
      setParticipantSuccess(null);
      return;
    }

    const profileType = resolveProfileTypeForSubmit(
      participantForm.profileKind,
      participantFormMode === 'edit' ? editingOriginalProfileType : null
    );

    const requestBody = {
      profileType,
      firstName,
      lastName,
      birthDate: participantForm.birthDate || null,
    };

    setParticipantStatus('saving');
    setParticipantError(null);
    setParticipantSuccess(null);

    try {
      if (participantFormMode === 'edit' && !editingParticipantId) {
        throw new Error('Профиль для редактирования не выбран.');
      }

      const request =
        participantFormMode === 'create'
          ? {
              url: '/api/participants',
              method: 'POST',
              body: JSON.stringify({
                userId: dashboard.currentUser.id,
                ...requestBody,
              }),
            }
          : {
              url: `/api/participants/${editingParticipantId}`,
              method: 'PATCH',
              body: JSON.stringify(requestBody),
            };

      const { response, payload } = await fetchJson(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: request.body,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to save participant'
          )
        );
      }

      const reloadWasSuccessful = await reloadDashboard(true);

      if (!reloadWasSuccessful) {
        throw new Error('Не удалось обновить список детей.');
      }

      const successMessage =
        participantFormMode === 'create'
          ? 'Профиль добавлен.'
          : 'Данные профиля сохранены.';

      resetParticipantForm({ preserveSuccess: true });
      setIsParticipantFormOpen(false);
      setParticipantSuccess(successMessage);
    } catch (saveError) {
      setParticipantError(
        saveError instanceof Error
          ? saveError.message
          : 'Не удалось сохранить профиль.'
      );
    } finally {
      setParticipantStatus('idle');
    }
  }

  async function handleTrainingBooking(training: AvailableTrainingSummary) {
    if (!dashboard) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Кабинет еще не загружен.',
      });
      return;
    }

    const availability = getTrainingAvailability(training);

    if (!availability.canBook) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Эта тренировка сейчас недоступна для записи.',
      });
      return;
    }

    if (dashboard.participants.length === 0) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Сначала добавьте профиль в разделе «Дети».',
      });
      return;
    }

    const participantId = getSelectedParticipantIdForTraining(training.trainingId);

    if (!participantId) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Выберите профиль для записи на тренировку.',
      });
      return;
    }

    const hasActiveBooking = dashboard.trainingBookings.some(
      (booking) =>
        booking.training.trainingId === training.trainingId &&
        booking.participant?.id === participantId
    );

    if (hasActiveBooking) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Этот профиль уже записан на эту тренировку.',
      });
      return;
    }

    setBookingTrainingId(training.trainingId);
    setTrainingFeedback(null);

    try {
      const { response, payload } = await fetchJson(
        `/api/trainings/${training.trainingId}/book`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ participantId }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to book training'
          )
        );
      }

      const refreshedSuccessfully = await refreshTrainingSections();

      if (!refreshedSuccessfully) {
        throw new Error('Не удалось обновить кабинет после записи на тренировку.');
      }

      setTrainingFeedback({
        scope: 'catalog',
        tone: 'success',
        message: `Запись на тренировку «${training.name}» оформлена.`,
      });
    } catch (bookingError) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message:
          bookingError instanceof Error
            ? bookingError.message
            : 'Не удалось оформить запись на тренировку.',
      });
    } finally {
      setBookingTrainingId(null);
    }
  }

  async function handleTrainingBookingCancel(booking: TrainingBookingSummary) {
    setCancellingBookingId(booking.id);
    setTrainingFeedback(null);

    try {
      const { response, payload } = await fetchJson(
        `/api/training-bookings/${booking.id}/cancel`,
        {
          method: 'POST',
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to cancel training booking'
          )
        );
      }

      const refreshedSuccessfully = await refreshTrainingSections();

      if (!refreshedSuccessfully) {
        throw new Error('Не удалось обновить кабинет после отмены записи.');
      }

      setTrainingFeedback({
        scope: 'bookings',
        tone: 'success',
        message: `Запись на тренировку «${booking.training.name}» отменена.`,
      });
    } catch (cancelError) {
      setTrainingFeedback({
        scope: 'bookings',
        tone: 'error',
        message:
          cancelError instanceof Error
            ? cancelError.message
            : 'Не удалось отменить запись на тренировку.',
      });
    } finally {
      setCancellingBookingId(null);
    }
  }

  async function handleTeamApplicationSubmit(team: AvailableTeamSummary) {
    if (!dashboard) {
      setTeamFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Кабинет еще не загружен.',
      });
      return;
    }

    if (dashboard.participants.length === 0) {
      setTeamFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Сначала добавьте профиль в разделе «Дети».',
      });
      return;
    }

    const participantId = getSelectedParticipantIdForTeam(team.id);

    if (!participantId) {
      setTeamFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Выберите профиль для заявки в команду.',
      });
      return;
    }

    const existingActiveApplication = getActiveTeamApplication(team.id, participantId);

    if (existingActiveApplication) {
      setTeamFeedback({
        scope: 'catalog',
        tone: 'error',
        message: `${formatPersonName(existingActiveApplication.participant)} уже имеет активную заявку в команду «${team.name}».`,
      });
      return;
    }

    setSubmittingTeamId(team.id);
    setTeamFeedback(null);

    try {
      const commentFromApplicant = teamComments[team.id]?.trim() || null;
      const { response, payload } = await fetchJson(`/api/teams/${team.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          commentFromApplicant,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to create team application'
          )
        );
      }

      const refreshedSuccessfully = await refreshTeamApplicationsSection();

      if (!refreshedSuccessfully) {
        throw new Error('Не удалось обновить список заявок в команду.');
      }

      setTeamComments((currentComments) => ({
        ...currentComments,
        [team.id]: '',
      }));
      setActiveTeamCatalogId(null);
      setTeamFeedback({
        scope: 'catalog',
        tone: 'success',
        message: `Заявка в команду «${team.name}» отправлена.`,
      });
    } catch (submitError) {
      setTeamFeedback({
        scope: 'catalog',
        tone: 'error',
        message:
          submitError instanceof Error
            ? submitError.message
            : 'Не удалось отправить заявку в команду.',
      });
    } finally {
      setSubmittingTeamId(null);
    }
  }

  async function handleTeamApplicationCancel(application: TeamApplicationSummary) {
    setCancellingTeamApplicationId(application.id);
    setTeamFeedback(null);

    try {
      const { response, payload } = await fetchJson(
        `/api/team-applications/${application.id}/cancel`,
        {
          method: 'POST',
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to cancel team application'
          )
        );
      }

      const refreshedSuccessfully = await refreshTeamApplicationsSection();

      if (!refreshedSuccessfully) {
        throw new Error('Не удалось обновить список заявок в команду.');
      }

      setTeamFeedback({
        scope: 'applications',
        tone: 'success',
        message: `Заявка в команду «${application.team.name}» отменена.`,
      });
    } catch (cancelError) {
      setTeamFeedback({
        scope: 'applications',
        tone: 'error',
        message:
          cancelError instanceof Error
            ? cancelError.message
            : 'Не удалось отменить заявку в команду.',
      });
    } finally {
      setCancellingTeamApplicationId(null);
    }
  }

  async function handleRentalBooking(slot: AvailableRentalSlotSummary) {
    if (!dashboard) {
      setRentalFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Кабинет еще не загружен.',
      });
      return;
    }

    const availability = getRentalSlotAvailability(slot);

    if (!availability.canBook) {
      setRentalFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Этот слот аренды сейчас недоступен для бронирования.',
      });
      return;
    }

    setBookingRentalSlotId(slot.id);
    setRentalFeedback(null);

    try {
      const participantId = getSelectedParticipantIdForRental(slot.id);
      const noteFromUser = rentalNotes[slot.id]?.trim() || null;
      const { response, payload } = await fetchJson(`/api/rental-slots/${slot.id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          noteFromUser,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to create rental booking'
          )
        );
      }

      const refreshedSuccessfully = await refreshRentalSections();

      if (!refreshedSuccessfully) {
        throw new Error('Не удалось обновить кабинет после бронирования аренды.');
      }

      setRentalNotes((currentNotes) => ({
        ...currentNotes,
        [slot.id]: '',
      }));
      setActiveRentalCatalogSlotId(null);
      setRentalFeedback({
        scope: 'catalog',
        tone: 'success',
        message: `Бронирование ресурса «${slot.resource.name}» оформлено.`,
      });
    } catch (bookingError) {
      setRentalFeedback({
        scope: 'catalog',
        tone: 'error',
        message:
          bookingError instanceof Error
            ? bookingError.message
            : 'Не удалось оформить бронирование аренды.',
      });
    } finally {
      setBookingRentalSlotId(null);
    }
  }

  async function handleRentalBookingCancel(booking: RentalBookingSummary) {
    setCancellingRentalBookingId(booking.id);
    setRentalFeedback(null);

    try {
      const { response, payload } = await fetchJson(
        `/api/rental-bookings/${booking.id}/cancel`,
        {
          method: 'POST',
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          translateErrorMessage(
            (payload as { error?: string } | null)?.error ||
              'Failed to cancel rental booking'
          )
        );
      }

      const refreshedSuccessfully = await refreshRentalSections();

      if (!refreshedSuccessfully) {
        throw new Error('Не удалось обновить кабинет после отмены бронирования.');
      }

      setRentalFeedback({
        scope: 'bookings',
        tone: 'success',
        message: `Бронирование ресурса «${booking.resource.name}» отменено.`,
      });
    } catch (cancelError) {
      setRentalFeedback({
        scope: 'bookings',
        tone: 'error',
        message:
          cancelError instanceof Error
            ? cancelError.message
            : 'Не удалось отменить бронирование аренды.',
      });
    } finally {
      setCancellingRentalBookingId(null);
    }
  }

  const currentUserCapabilities = dashboard
    ? getRoleCapabilities(dashboard.currentUser)
    : null;
  const isStaffSecondaryView =
    currentUserCapabilities?.cabinetViewMode === 'secondary';
  const cabinetDescription =
    currentUserCapabilities?.cabinetDescription ??
    'Единая точка входа для ваших детей, записей на тренировки, заявок в команду и бронирований.';
  const cabinetNavItems = [
    {
      id: 'overview' as const,
      label: 'Обзор',
      description: 'Профиль и короткая сводка.',
      badge: dashboard ? dashboard.participants.length : null,
    },
    {
      id: 'participants' as const,
      label: 'Дети',
      description: 'Список и редактирование по запросу.',
      badge: dashboard ? dashboard.participants.length : null,
    },
    {
      id: 'trainings' as const,
      label: 'Тренировки',
      description: 'Календарь, запись и мои бронирования.',
      badge: dashboard ? dashboard.trainingBookings.length : null,
    },
    {
      id: 'team' as const,
      label: 'Команда',
      description: 'Доступные команды и мои заявки.',
      badge: teamApplications.length,
    },
    {
      id: 'rentals' as const,
      label: 'Аренда',
      description: 'Публичные слоты и мои бронирования.',
      badge: rentalBookings.length,
    },
    {
      id: 'promo' as const,
      label: 'Промо',
      description: 'Билеты и результаты акции.',
      badge: null,
    },
  ];
  const cabinetMetrics = dashboard
    ? [
        {
          label: 'Дети',
          value: String(dashboard.participants.length),
          detail: 'Профили игроков и детей, привязанные к вашему кабинету.',
        },
        {
          label: 'Тренировки',
          value: String(dashboard.trainingBookings.length),
          detail: 'Ваши текущие записи и быстрый доступ к календарю.',
        },
        {
          label: 'Команда',
          value: String(teamApplications.length),
          detail: 'Поданные заявки и статусы их рассмотрения.',
        },
        {
          label: 'Аренда',
          value: String(rentalBookings.length),
          detail: 'Брони по публичным слотам и их текущее состояние.',
        },
      ]
    : [];
  const activeCabinetItem =
    cabinetNavItems.find((item) => item.id === activeCabinetSection) ?? cabinetNavItems[0];
  const activeCabinetPrimaryAction =
    activeCabinetSection === 'participants' || activeCabinetSection === 'overview' ? (
      <button
        type="button"
        onClick={openParticipantCreateForm}
        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black transition hover:bg-amber-300"
      >
        Добавить ребенка
      </button>
    ) : activeCabinetSection === 'promo' ? (
      <Link
        href="/promo-tickets"
        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black transition hover:bg-amber-300"
      >
        Открыть promo
      </Link>
    ) : null;
  const currentUserMeta = dashboard ? (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100">
        {formatRoleList(dashboard.currentUser.roles)}
      </span>
      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-stone-200">
        Город: {dashboard.currentUser.preferredCity?.name || 'не указан'}
      </span>
      <span className="rounded-full border border-amber-300/24 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
        Gorilla Points: {pointsBalance} GP
      </span>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2633_0%,#0d1218_38%,#06080b_100%)] px-4 py-8 text-stone-100">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <WorkspaceHero
          eyebrow={isStaffSecondaryView ? 'Пользовательский контур' : 'Личный кабинет'}
          title={isStaffSecondaryView ? 'Пользовательский кабинет' : 'Ваш кабинет Gorilla'}
          description={cabinetDescription}
          asideLabel="Режим"
          meta={currentUserMeta}
          actions={
            <>
              {isStaffSecondaryView ? (
                <Link
                  href="/admin"
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-stone-100 transition hover:bg-white/10 hover:text-white"
                >
                  Открыть staff workspace
                </Link>
              ) : null}
            </>
          }
          aside={
            isStaffSecondaryView ? (
              <>
                <p className="mt-2">Основной staff-вход находится в <code>/admin</code>.</p>
              </>
            ) : (
              <>
                <p className="mt-2">Формы и действия открываются только внутри нужного сценария.</p>
              </>
            )
          }
        />

        {status === 'loading' ? (
          <section className="rounded-[1.9rem] border border-white/7 bg-white/[0.04] p-6 text-sm text-stone-300 shadow-[0_28px_70px_-46px_rgba(0,0,0,0.62)]">
            Загружаем кабинет...
          </section>
        ) : null}

        {status === 'error' ? (
          <section className="rounded-[1.9rem] border border-amber-300/24 bg-amber-400/10 p-6 text-sm text-amber-50 shadow-[0_28px_70px_-46px_rgba(15,23,42,0.34)]">
            <h2 className="text-2xl font-black text-white">Нужен доступ к кабинету</h2>
            <p className="mt-3 max-w-2xl leading-7 text-amber-50/78">{error}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={homepageSchoolContent.site.telegramHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-amber-300 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-amber-200"
              >
                Подключить доступ
              </a>
              <Link
                href="/"
                className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/12"
              >
                На главную
              </Link>
            </div>
          </section>
        ) : null}

        {status === 'ready' && dashboard ? (
          <WorkspaceCanvas className="space-y-10">
            {cabinetMetrics.length > 0 ? (
              <WorkspaceScoreStrip
                items={cabinetMetrics.map((metric, index) => ({
                  ...metric,
                  accent:
                    index === 1 ? 'amber' : index === 3 ? 'sky' : 'default',
                }))}
                compact
              />
            ) : null}

            <div className="space-y-8">
              <section className="space-y-5 border-b border-white/8 pb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-300">
                      Active workspace
                    </p>
                    <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">
                      {activeCabinetItem.label}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {activeCabinetPrimaryAction}
                    <WorkspaceDisclosure label="Подсказка" className="min-w-[180px]">
                      {activeCabinetItem.description}
                    </WorkspaceDisclosure>
                  </div>
                </div>
                <WorkspaceSectionNav
                  items={cabinetNavItems}
                  activeId={activeCabinetSection}
                  onChange={setActiveCabinetSection}
                />
              </section>

              <div className="min-w-0 space-y-10">
                <SectionCard
                  className={activeCabinetSection === 'overview' ? '' : 'hidden'}
                  eyebrow="Текущий пользователь"
                  title={`Пользователь #${dashboard.currentUser.id}`}
                >
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.04fr)_340px]">
                    <WorkspaceInset className="p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Overview
                      </p>
                      <p className="mt-4 text-[1.9rem] font-semibold tracking-[-0.04em] text-white">
                        {dashboard.currentUser.profile
                          ? formatPersonName(dashboard.currentUser.profile)
                          : 'Профиль не заполнен'}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={openParticipantCreateForm}
                          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black transition hover:bg-amber-300"
                        >
                          Добавить ребенка
                        </button>
                        <Link
                          href="/promo-tickets"
                          className="rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-stone-100 ring-1 ring-white/12 transition hover:bg-white/12 hover:text-white"
                        >
                          Promo-билеты
                        </Link>
                      </div>
                    </WorkspaceInset>
                    <div className="space-y-4">
                      <WorkspaceInset tone="muted" className="p-4">
                        <p className="text-sm font-medium text-stone-400">Профиль</p>
                        <p className="mt-2 text-sm text-stone-300">
                          Роли: {formatRoleList(dashboard.currentUser.roles)}
                        </p>
                        <p className="mt-1 text-sm text-stone-300">
                          Город:{' '}
                          {dashboard.currentUser.preferredCity?.name || 'Не указан'}
                        </p>
                      </WorkspaceInset>
                      <WorkspaceInset tone="muted" className="p-4">
                        <p className="text-sm font-medium text-stone-400">Контакты</p>
                        <p className="mt-2 text-sm text-stone-300">
                          Эл. почта: {dashboard.currentUser.email || 'Не указана'}
                        </p>
                        <p className="mt-1 text-sm text-stone-300">
                          Телеграм: {dashboard.currentUser.telegramId || 'Не указан'}
                        </p>
                      </WorkspaceInset>
                      <WorkspaceInset tone="accent" className="p-4">
                        <p className="text-sm font-medium text-amber-100">Gorilla Points</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                          {pointsBalance} GP
                        </p>
                        <p className="mt-2 text-sm text-stone-300">
                          {nextReward
                            ? `Следующая фиксированная награда откроется на ${nextReward.cost} GP.`
                            : 'Базовые награды уже открыты. Можно переходить к обмену через школу.'}
                        </p>
                        {nextReward ? (
                          <p className="mt-3 text-sm text-amber-100">{nextReward.title}</p>
                        ) : null}
                        {unlockedRewards.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {unlockedRewards.slice(-2).map((reward) => (
                              <a
                                key={reward.id}
                                href={homepageSchoolContent.site.telegramHref}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-amber-300/24 bg-black/18 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-black/28"
                              >
                                {reward.title}
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </WorkspaceInset>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  className={activeCabinetSection === 'promo' ? '' : 'hidden'}
                  eyebrow="Gorilla Promo"
                  title="Промо-билеты"
                >
                  <PromoTicketWorkspace variant="cabinet" />
                </SectionCard>

                <div
                  className={`space-y-8 ${
                    activeCabinetSection === 'overview' ||
                    activeCabinetSection === 'promo'
                      ? 'hidden'
                      : ''
                  }`}
                >
              <SectionCard
                className={activeCabinetSection === 'participants' ? '' : 'hidden'}
                eyebrow="Дети"
                title="Мои дети"
              >
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        {dashboard.participants.length} в списке
                      </p>
                      <button
                        type="button"
                        onClick={openParticipantCreateForm}
                        className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                      >
                        Добавить ребенка
                      </button>
                    </div>

                    {participantSuccess ? (
                      <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">
                        {participantSuccess}
                      </p>
                    ) : null}

                    {participantError && !isParticipantFormOpen ? (
                      <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
                        {participantError}
                      </p>
                    ) : null}

                    {dashboard.participants.length === 0 ? (
                      <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                        У вас пока нет добавленных детей. Откройте форму по кнопке «Добавить ребенка», чтобы создать первый профиль.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dashboard.participants.map((participant) => (
                          <article
                            key={participant.id}
                            className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-white">
                                    {formatPersonName(participant)}
                                  </p>
                                  <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-300">
                                    #{participant.id}
                                  </span>
                                </div>
                                <div className="mt-3 grid gap-1 text-sm text-stone-400">
                                  <p>
                                    Тип профиля:{' '}
                                    {
                                      participantProfileKindLabels[
                                        getParticipantProfileKind(participant.profileType)
                                      ]
                                    }
                                  </p>
                                  <p>Дата рождения: {formatDate(participant.birthDate)}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => beginParticipantEdit(participant)}
                                className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                              >
                                Редактировать
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  {isParticipantFormOpen ? (
                    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-500">
                            {participantFormMode === 'create'
                              ? 'Новый профиль'
                              : `Редактирование профиля #${editingParticipantId}`}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {participantFormMode === 'create'
                              ? 'Добавить профиль'
                              : 'Изменить данные профиля'}
                          </h3>
                          <p className="mt-1 text-sm text-stone-400">
                            {participantFormMode === 'create'
                              ? 'Заполните основные данные профиля. После сохранения список обновится автоматически.'
                              : 'Измените поля и сохраните обновленные данные без перезагрузки страницы.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={closeParticipantForm}
                          className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                        >
                          Закрыть
                        </button>
                      </div>

                      <form
                        className="mt-5 flex flex-col gap-4"
                        onSubmit={handleParticipantSubmit}
                      >
                        <label className="flex flex-col gap-2 text-sm font-medium text-stone-300">
                          Имя
                          <input
                            value={participantForm.firstName}
                            onChange={(event) =>
                              handleParticipantInputChange('firstName', event.target.value)
                            }
                            className="rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                            placeholder="Иван"
                          />
                        </label>

                        <label className="flex flex-col gap-2 text-sm font-medium text-stone-300">
                          Фамилия
                          <input
                            value={participantForm.lastName}
                            onChange={(event) =>
                              handleParticipantInputChange('lastName', event.target.value)
                            }
                            className="rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                            placeholder="Иванов"
                          />
                        </label>

                        <label className="flex flex-col gap-2 text-sm font-medium text-stone-300">
                          Тип профиля
                          <select
                            value={participantForm.profileKind}
                            onChange={(event) =>
                              handleParticipantInputChange(
                                'profileKind',
                                event.target.value as ParticipantProfileKind
                              )
                            }
                            className="rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                          >
                            <option value="SELF">Свой профиль</option>
                            <option value="CHILD">Ребёнок</option>
                          </select>
                        </label>

                        <label className="flex flex-col gap-2 text-sm font-medium text-stone-300">
                          Дата рождения
                          <input
                            type="date"
                            value={participantForm.birthDate}
                            onChange={(event) =>
                              handleParticipantInputChange('birthDate', event.target.value)
                            }
                            className="rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                          />
                        </label>

                        {participantError ? (
                          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
                            {participantError}
                          </p>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            disabled={participantStatus === 'saving'}
                            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                          >
                            {participantStatus === 'saving'
                              ? 'Сохраняем...'
                              : participantFormMode === 'create'
                                ? 'Добавить профиль'
                                : 'Сохранить изменения'}
                          </button>
                          <button
                            type="button"
                            onClick={closeParticipantForm}
                            disabled={participantStatus === 'saving'}
                            className="rounded-full border border-white/12 bg-black/20 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Закрыть форму
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                      <p className="text-sm font-medium text-stone-300">
                        Форма скрыта. Откройте её по действию, когда нужно добавить или изменить профиль.
                      </p>
                      <p className="mt-2 text-sm text-stone-400">
                        Для нового профиля используйте кнопку «Добавить ребенка». Для изменения уже созданного профиля выберите «Редактировать» в списке.
                      </p>
                      <button
                        type="button"
                        onClick={openParticipantCreateForm}
                        className="mt-4 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                      >
                        Открыть форму
                      </button>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                className={activeCabinetSection === 'trainings' ? '' : 'hidden'}
                eyebrow="Тренировки"
                title="Расписание тренировок"
              >
                <div className="space-y-4">
                  <WorkspaceDisclosure label="Как записаться">
                    Выберите день, откройте тренировку и подтвердите запись для себя или
                    ребенка.
                  </WorkspaceDisclosure>

                  {trainingFeedback?.scope === 'catalog' ? (
                    <p
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        trainingFeedback.tone === 'success'
                          ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                          : 'border-rose-400/30 bg-rose-500/12 text-rose-100'
                      }`}
                    >
                      {trainingFeedback.message}
                    </p>
                  ) : null}

                  {trainingsStatus === 'loading' ? (
                    <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                      Загружаем доступные тренировки...
                    </p>
                  ) : trainingsStatus === 'error' && availableTrainings.length === 0 ? (
                    <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-5 text-sm text-rose-100">
                      {trainingsError}
                    </p>
                  ) : availableTrainings.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-8 text-center">
                      <p className="text-3xl">🏋️</p>
                      <p className="mt-3 text-sm font-medium text-stone-300">
                        Нет доступных тренировок
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        На данный момент нет активных тренировок для записи
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Days overview */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-stone-300">
                          Выберите день
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(groupTrainingsByDay(availableTrainings))
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([dayKey, trainings]) => (
                              <button
                                key={dayKey}
                                type="button"
                                onClick={() => {
                                  setSelectedTrainingDay(dayKey);
                                  setSelectedTrainingId(null);
                                }}
                                className={`rounded-2xl border p-4 text-left transition ${
                                  selectedTrainingDay === dayKey
                                    ? 'border-amber-300/60 bg-white/[0.08]'
                                    : 'border-white/10 bg-black/20 hover:border-white/18 hover:bg-white/6'
                                }`}
                              >
                                <p className="font-medium text-white">
                                  {formatTrainingDay(dayKey)}
                                </p>
                                <p className="mt-1 text-sm text-stone-400">
                                  {trainings.length}{' '}
                                  {trainings.length === 1
                                    ? 'тренировка'
                                    : trainings.length < 5
                                      ? 'тренировки'
                                      : 'тренировок'}
                                </p>
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Selected day trainings */}
                      {selectedTrainingDay && (
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-stone-300">
                              Тренировки на {formatTrainingDay(selectedTrainingDay)}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTrainingDay(null);
                                setSelectedTrainingId(null);
                              }}
                              className="text-xs text-stone-500 hover:text-stone-300"
                            >
                              Сбросить выбор
                            </button>
                          </div>
                          
                          {(() => {
                            const dayTrainings = groupTrainingsByDay(availableTrainings)[selectedTrainingDay] || [];
                            return dayTrainings.length === 0 ? (
                              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-8 text-center">
                                <p className="text-3xl">📅</p>
                                <p className="mt-3 text-sm font-medium text-stone-300">
                                  Нет тренировок на этот день
                                </p>
                                <p className="mt-1 text-xs text-stone-500">
                                  Выберите другой день
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {dayTrainings.map((training) => {
                                  const availability = getTrainingAvailability(training);
                                  const isSelected = selectedTrainingId === training.trainingId;
                                  
                                  return (
                                    <article
                                      key={training.trainingId}
                                      className={`rounded-2xl border p-4 transition cursor-pointer ${
                                        isSelected
                                          ? 'border-amber-300/60 bg-white/[0.08]'
                                          : 'border-white/10 bg-black/18 hover:border-white/18 hover:bg-white/6'
                                      }`}
                                      onClick={() => setSelectedTrainingId(isSelected ? null : training.trainingId)}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="font-semibold text-white">
                                            {training.name}
                                          </p>
                                          <p className="mt-1 text-sm text-stone-400">
                                            {formatTime(training.startTime)} вЂ” {formatTime(training.endTime)}
                                          </p>
                                          <p className="mt-1 text-sm text-stone-400">
                                            {training.city.name} / {training.location}
                                          </p>
                                        </div>
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-medium ${availability.badgeClass}`}
                                        >
                                          {availability.label}
                                        </span>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Selected training details */}
                      {selectedTrainingId && selectedTrainingDay && (() => {
                        const training = availableTrainings.find(t => t.trainingId === selectedTrainingId);
                        if (!training) return null;
                        
                        const availability = getTrainingAvailability(training);
                        const selectedParticipantId = getSelectedParticipantIdForTraining(training.trainingId);
                        const selectedParticipant = dashboard.participants.find(
                          (participant) => participant.id === selectedParticipantId
                        );
                        const isSelectedParticipantAlreadyBooked =
                          selectedParticipantId !== null &&
                          dashboard.trainingBookings.some(
                            (booking) =>
                              booking.training.trainingId === training.trainingId &&
                              booking.participant?.id === selectedParticipantId
                          );
                        const bookedParticipants = dashboard.trainingBookings.filter(
                          (booking) =>
                            booking.training.trainingId === training.trainingId
                        );
                        const isBookingInProgress = bookingTrainingId === training.trainingId;
                        const isBookingDisabled =
                          !availability.canBook ||
                          dashboard.participants.length === 0 ||
                          selectedParticipantId === null ||
                          isSelectedParticipantAlreadyBooked ||
                          isBookingInProgress;

                        return (
                          <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-6">
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-white">
                                {training.name}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setSelectedTrainingId(null)}
                                className="text-sm text-stone-500 hover:text-stone-300"
                              >
                                Закрыть
                              </button>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-stone-300">Время и место</p>
                                  <p className="mt-1 text-sm text-stone-400">
                                    {formatDateTime(training.startTime)} вЂ” {formatTime(training.endTime)}
                                  </p>
                                  <p className="mt-1 text-sm text-stone-400">
                                    {training.city.name} / {training.location}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-stone-300">Формат и тренер</p>
                                  <p className="mt-1 text-sm text-stone-400">
                                    Формат: {formatTrainingType(training.trainingType)}
                                  </p>
                                  <p className="mt-1 text-sm text-stone-400">
                                    Тренер: {formatTrainerName(training.trainer)}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-stone-300">Доступность</p>
                                  <p className="mt-1 text-sm text-stone-400">{availability.detail}</p>
                                  {bookedParticipants.length > 0 && (
                                    <p className="mt-1 text-sm text-stone-400">
                                      Уже записаны: {bookedParticipants.map(b => formatPersonName(b.participant)).join(', ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <label className="block text-sm font-medium text-stone-300">
                                  Выберите профиль
                                  <select
                                    value={selectedParticipantId ? String(selectedParticipantId) : ''}
                                    onChange={(event) =>
                                      handleTrainingParticipantChange(training.trainingId, event.target.value)
                                    }
                                    disabled={dashboard.participants.length === 0 || isBookingInProgress}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                                  >
                                    {dashboard.participants.length === 0 ? (
                                      <option value="">Сначала добавьте профиль</option>
                                    ) : (
                                      dashboard.participants.map((participant) => (
                                        <option key={participant.id} value={participant.id}>
                                          {formatPersonName(participant)}
                                        </option>
                                      ))
                                    )}
                                  </select>
                                </label>

                                {dashboard.participants.length === 0 && (
                                  <p className="text-sm text-stone-400">
                                    Чтобы записаться на тренировку, сначала добавьте профиль в разделе «Дети».
                                  </p>
                                )}

                                {isSelectedParticipantAlreadyBooked && selectedParticipant && (
                                  <p className="text-sm text-amber-700">
                                    {formatPersonName(selectedParticipant)} уже записан на эту тренировку.
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleTrainingBooking(training)}
                                  disabled={isBookingDisabled}
                                  className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                                >
                                  {isBookingInProgress ? 'Оформляем запись...' : 'Записать на тренировку'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                className={activeCabinetSection === 'trainings' ? '' : 'hidden'}
                eyebrow="Тренировки"
                title="Мои записи на тренировки"
              >
                {trainingFeedback?.scope === 'bookings' ? (
                  <p
                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                      trainingFeedback.tone === 'success'
                        ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                        : 'border-rose-400/30 bg-rose-500/12 text-rose-100'
                    }`}
                  >
                    {trainingFeedback.message}
                  </p>
                ) : null}

                {dashboard.trainingBookings.length === 0 ? (
                  <p className="text-sm text-stone-400">
                    У вас пока нет ближайших записей на тренировки.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.trainingBookings.map((booking) => (
                      <article
                        key={booking.id}
                        className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">
                              {booking.training.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-400">
                              {formatPersonName(booking.participant)} /{' '}
                              {booking.training.location}
                            </p>
                            <p className="mt-2 text-sm text-stone-300">
                              {formatDateTime(booking.training.startTime)} вЂ”{' '}
                              {formatTime(booking.training.endTime)}
                            </p>
                          </div>
                          <div className="flex flex-col items-start gap-3 sm:items-end">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                              {formatStatus(booking.status)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTrainingBookingCancel(booking)}
                              disabled={cancellingBookingId === booking.id}
                              className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {cancellingBookingId === booking.id
                                ? 'Отменяем...'
                                : 'Отменить запись'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                className={activeCabinetSection === 'team' ? '' : 'hidden'}
                eyebrow="Команда"
                title="Доступные команды"
              >
                <div className="space-y-4">
                  <WorkspaceDisclosure label="Как подать заявку">
                    Откройте нужную команду, выберите профиль и отправьте заявку.
                  </WorkspaceDisclosure>

                  {teamFeedback?.scope === 'catalog' ? (
                    <p
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        teamFeedback.tone === 'success'
                          ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                          : 'border-rose-400/30 bg-rose-500/12 text-rose-100'
                      }`}
                    >
                      {teamFeedback.message}
                    </p>
                  ) : null}

                  {teamsStatus === 'loading' ? (
                    <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                      Загружаем список команд...
                    </p>
                  ) : teamsStatus === 'error' && availableTeams.length === 0 ? (
                    <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-5 text-sm text-rose-100">
                      {teamsError}
                    </p>
                  ) : availableTeams.length === 0 ? (
                    <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                      Сейчас нет доступных команд для подачи заявки.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {availableTeams.map((team) => {
                        const selectedParticipantId = getSelectedParticipantIdForTeam(
                          team.id
                        );
                        const selectedParticipant =
                          selectedParticipantId === null
                            ? null
                            : dashboard.participants.find(
                                (participant) => participant.id === selectedParticipantId
                              ) ?? null;
                        const existingActiveApplication = getActiveTeamApplication(
                          team.id,
                          selectedParticipantId
                        );
                        const isSubmitting = submittingTeamId === team.id;
                        const isSubmitDisabled =
                          dashboard.participants.length === 0 ||
                          selectedParticipantId === null ||
                          existingActiveApplication !== null ||
                          isSubmitting;
                        const isExpanded = activeTeamCatalogId === team.id;

                        return (
                          <article
                            key={team.id}
                            className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-white">{team.name}</p>
                                  <p className="mt-1 text-sm text-stone-400">
                                    {team.city?.name || 'Город не указан'}
                                  </p>
                                  {team.description ? (
                                    <p className="mt-2 text-sm text-stone-300">
                                      {team.description}
                                    </p>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveTeamCatalogId((currentValue) =>
                                      currentValue === team.id ? null : team.id
                                    )
                                  }
                                  className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                                >
                                  {isExpanded ? 'Скрыть форму' : 'Открыть заявку'}
                                </button>
                              </div>

                              {isExpanded ? (
                                <>
                                  <div className="grid gap-3">
                                <label className="text-sm font-medium text-stone-300">
                                  Профиль
                                  <select
                                    value={
                                      selectedParticipantId
                                        ? String(selectedParticipantId)
                                        : ''
                                    }
                                    onChange={(event) =>
                                      handleTeamParticipantChange(
                                        team.id,
                                        event.target.value
                                      )
                                    }
                                    disabled={
                                      dashboard.participants.length === 0 || isSubmitting
                                    }
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                                  >
                                    {dashboard.participants.length === 0 ? (
                                      <option value="">
                                        Сначала добавьте профиль
                                      </option>
                                    ) : (
                                      dashboard.participants.map((participant) => (
                                        <option
                                          key={participant.id}
                                          value={participant.id}
                                        >
                                          {formatPersonName(participant)}
                                        </option>
                                      ))
                                    )}
                                  </select>
                                </label>

                                <label className="text-sm font-medium text-stone-300">
                                  Комментарий к заявке
                                  <textarea
                                    value={teamComments[team.id] ?? ''}
                                    onChange={(event) =>
                                      handleTeamCommentChange(team.id, event.target.value)
                                    }
                                    rows={3}
                                    disabled={isSubmitting}
                                    placeholder="Необязательно"
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                                  />
                                </label>
                                  </div>

                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-2">
                                      {dashboard.participants.length === 0 ? (
                                        <p className="text-sm text-stone-400">
                                          Чтобы отправить заявку, сначала добавьте профиль
                                          в разделе «Дети».
                                        </p>
                                      ) : null}
                                      {existingActiveApplication && selectedParticipant ? (
                                        <p className="text-sm text-amber-700">
                                          У {formatPersonName(selectedParticipant)} уже есть
                                          заявка со статусом{' '}
                                          {formatStatus(existingActiveApplication.status)}.
                                        </p>
                                      ) : null}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleTeamApplicationSubmit(team)}
                                      disabled={isSubmitDisabled}
                                      className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                                    >
                                      {isSubmitting
                                        ? 'Отправляем заявку...'
                                        : 'Подать заявку'}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-stone-500">Откройте заявку</p>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                className={activeCabinetSection === 'team' ? '' : 'hidden'}
                eyebrow="Команда"
                title="Мои заявки в команду"
              >
                {teamFeedback?.scope === 'applications' ? (
                  <p
                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                      teamFeedback.tone === 'success'
                        ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                        : 'border-rose-400/30 bg-rose-500/12 text-rose-100'
                    }`}
                  >
                    {teamFeedback.message}
                  </p>
                ) : null}

                {teamApplicationsStatus === 'loading' ? (
                  <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                    Загружаем ваши заявки в команду...
                  </p>
                ) : teamApplicationsStatus === 'error' && teamApplications.length === 0 ? (
                  <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-5 text-sm text-rose-100">
                    {teamApplicationsError}
                  </p>
                ) : teamApplications.length === 0 ? (
                  <p className="text-sm text-stone-400">
                    У вас пока нет заявок в команду.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {teamApplications.map((application) => {
                      const isCancelling =
                        cancellingTeamApplicationId === application.id;
                      const canCancel = application.status !== 'CANCELLED';

                      return (
                        <article
                          key={application.id}
                          className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-white">
                                {application.team.name}
                              </p>
                              <p className="mt-1 text-sm text-stone-400">
                                {formatPersonName(application.participant)} /{' '}
                                {application.team.city?.name || 'Город не указан'}
                              </p>
                              <p className="mt-2 text-sm text-stone-300">
                                {application.commentFromApplicant ||
                                  'Комментарий не указан.'}
                              </p>
                            </div>
                            <div className="flex flex-col items-start gap-3 sm:items-end">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getTeamApplicationStatusBadgeClass(application.status)}`}
                              >
                                {formatStatus(application.status)}
                              </span>
                              {canCancel ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTeamApplicationCancel(application)
                                  }
                                  disabled={isCancelling}
                                  className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isCancelling
                                    ? 'Отменяем заявку...'
                                    : 'Отменить заявку'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                className={activeCabinetSection === 'rentals' ? '' : 'hidden'}
                eyebrow="Аренда"
                title="Доступная аренда"
              >
                <div className="space-y-4">
                  <WorkspaceDisclosure label="Как оформить бронь">
                    Откройте слот, выберите профиль при необходимости и подтвердите
                    бронирование.
                  </WorkspaceDisclosure>

                  {rentalFeedback?.scope === 'catalog' ? (
                    <p
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        rentalFeedback.tone === 'success'
                          ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                          : 'border-rose-400/30 bg-rose-500/12 text-rose-100'
                      }`}
                    >
                      {rentalFeedback.message}
                    </p>
                  ) : null}

                  {rentalSlotsStatus === 'loading' ? (
                    <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                      Загружаем слоты аренды...
                    </p>
                  ) : rentalSlotsStatus === 'error' && publicRentalSlots.length === 0 ? (
                    <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-5 text-sm text-rose-100">
                      {rentalSlotsError}
                    </p>
                  ) : publicRentalSlots.length === 0 ? (
                    <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                      Сейчас нет слотов аренды для бронирования.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {publicRentalSlots.map((slot) => {
                        const availability = getRentalSlotAvailability(slot);
                        const selectedParticipantValue =
                          getSelectedRentalParticipantValue(slot.id);
                        const selectedParticipantId =
                          getSelectedParticipantIdForRental(slot.id);
                        const selectedParticipant =
                          selectedParticipantId === null
                            ? null
                            : dashboard.participants.find(
                                (participant) => participant.id === selectedParticipantId
                              ) ?? null;
                        const isBookingInProgress = bookingRentalSlotId === slot.id;
                        const isBookingDisabled =
                          !availability.canBook || isBookingInProgress;
                        const isExpanded = activeRentalCatalogSlotId === slot.id;

                        return (
                          <article
                            key={slot.id}
                            className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-white">
                                    {slot.resource.name}
                                  </p>
                                  <p className="mt-1 text-sm text-stone-400">
                                    {slot.facility.name} / {slot.city.name}
                                  </p>
                                  <p className="mt-2 text-sm text-stone-300">
                                    {formatDateTime(slot.startsAt)} вЂ”{' '}
                                    {formatTime(slot.endsAt)}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${availability.badgeClass}`}
                                >
                                  {availability.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveRentalCatalogSlotId((currentValue) =>
                                      currentValue === slot.id ? null : slot.id
                                    )
                                  }
                                  className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
                                >
                                  {isExpanded ? 'Скрыть форму' : 'Открыть бронь'}
                                </button>
                              </div>

                              <div className="grid gap-1 text-sm text-stone-400">
                                <p>
                                  Ресурс:{' '}
                                  {slot.resource.resourceType
                                    ? `${slot.resource.name} (${slot.resource.resourceType})`
                                    : slot.resource.name}
                                </p>
                                <p>Статус слота: {formatStatus(slot.status)}</p>
                                <p>{availability.detail}</p>
                              </div>

                              {isExpanded ? (
                                <>
                                  <div className="grid gap-3">
                                    <label className="text-sm font-medium text-stone-300">
                                      Кого бронируем
                                      <select
                                        value={selectedParticipantValue}
                                        onChange={(event) =>
                                          handleRentalParticipantChange(
                                            slot.id,
                                            event.target.value
                                          )
                                        }
                                        disabled={isBookingDisabled}
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                                      >
                                        <option value="self">На себя</option>
                                        {dashboard.participants.map((participant) => (
                                          <option key={participant.id} value={participant.id}>
                                            {formatPersonName(participant)}
                                          </option>
                                        ))}
                                      </select>
                                    </label>

                                    <label className="text-sm font-medium text-stone-300">
                                      Комментарий к бронированию
                                      <textarea
                                        value={rentalNotes[slot.id] ?? ''}
                                        onChange={(event) =>
                                          handleRentalNoteChange(slot.id, event.target.value)
                                        }
                                        rows={3}
                                        disabled={isBookingDisabled}
                                        placeholder="Необязательно"
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                                      />
                                    </label>
                                  </div>

                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <p className="text-sm text-stone-400">
                                      {selectedParticipant
                                        ? `Бронь будет оформлена на ${formatPersonName(selectedParticipant)}.`
                                        : 'Бронь будет оформлена на ваш аккаунт.'}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => handleRentalBooking(slot)}
                                      disabled={isBookingDisabled}
                                      className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                                    >
                                      {isBookingInProgress
                                        ? 'Оформляем бронь...'
                                        : 'Забронировать'}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-stone-500">Откройте бронь</p>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                className={activeCabinetSection === 'rentals' ? '' : 'hidden'}
                eyebrow="Аренда"
                title="Мои бронирования аренды"
              >
                {rentalFeedback?.scope === 'bookings' ? (
                  <p
                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                      rentalFeedback.tone === 'success'
                        ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                        : 'border-rose-400/30 bg-rose-500/12 text-rose-100'
                    }`}
                  >
                    {rentalFeedback.message}
                  </p>
                ) : null}

                {rentalBookingsStatus === 'loading' ? (
                  <p className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-5 text-sm text-stone-400">
                    Загружаем ваши бронирования аренды...
                  </p>
                ) : rentalBookingsStatus === 'error' && rentalBookings.length === 0 ? (
                  <p className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-5 text-sm text-rose-100">
                    {rentalBookingsError}
                  </p>
                ) : rentalBookings.length === 0 ? (
                  <p className="text-sm text-stone-400">
                    У вас пока нет бронирований аренды.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {rentalBookings.map((booking) => {
                      const isCancelling =
                        cancellingRentalBookingId === booking.id;
                      const canCancel = booking.status !== 'CANCELLED';

                      return (
                        <article
                          key={booking.id}
                          className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-white">
                                {booking.resource.name}
                              </p>
                              <p className="mt-1 text-sm text-stone-400">
                                {booking.facility.name} / {booking.city.name}
                              </p>
                              <p className="mt-2 text-sm text-stone-300">
                                {formatDateTime(booking.slot.startsAt)} вЂ”{' '}
                                {formatTime(booking.slot.endsAt)}
                              </p>
                              <p className="mt-2 text-sm text-stone-400">
                                Бронь оформлена:{' '}
                                {booking.participant
                                  ? formatPersonName(booking.participant)
                                  : 'На себя'}
                              </p>
                            </div>
                            <div className="flex flex-col items-start gap-3 sm:items-end">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getRentalBookingStatusBadgeClass(booking.status)}`}
                              >
                                {formatStatus(booking.status)}
                              </span>
                              {canCancel ? (
                                <button
                                  type="button"
                                  onClick={() => handleRentalBookingCancel(booking)}
                                  disabled={isCancelling}
                                  className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isCancelling
                                    ? 'Отменяем бронь...'
                                    : 'Отменить бронь'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
              </div>
              </div>
            </div>
          </WorkspaceCanvas>
        ) : null}
      </div>
    </main>
  );
}




