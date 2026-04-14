'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const roleLabels: Record<string, string> = {
  USER: 'Пользователь',
  COACH: 'Тренер',
  MANAGER: 'Менеджер',
  ADMIN: 'Администратор',
};

const profileTypeLabels: Record<string, string> = {
  PLAYER: 'Игрок',
  CHILD: 'Ребенок',
  PARENT: 'Родитель',
  ADULT: 'Взрослый',
};

const participantProfileKindLabels: Record<ParticipantProfileKind, string> = {
  SELF: 'Свой профиль',
  CHILD: 'Ребенок',
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
    'Failed to fetch current user team applications':
      'Не удалось загрузить ваши заявки в команду.',
    'Failed to save participant': 'Не удалось сохранить участника.',
    'Failed to book training': 'Не удалось оформить запись на тренировку.',
    'Failed to cancel training booking': 'Не удалось отменить запись на тренировку.',
    'Failed to create team application': 'Не удалось отправить заявку в команду.',
    'Failed to cancel team application': 'Не удалось отменить заявку в команду.',
    'Current user is not authenticated': 'Пользователь не авторизован.',
    'User not found': 'Пользователь не найден.',
    'Participant not found': 'Участник не найден.',
    'Team not found': 'Команда не найдена.',
    'Training not found': 'Тренировка не найдена.',
    'Training is not active': 'Запись на эту тренировку сейчас недоступна.',
    'Training is full': 'Свободных мест на тренировку больше нет.',
    'Already booked': 'Участник уже записан на эту тренировку.',
    'Active team application already exists':
      'Для выбранного участника уже есть активная заявка в эту команду.',
    'Training booking not found': 'Запись на тренировку не найдена.',
    'Training booking is already cancelled': 'Запись на тренировку уже отменена.',
    'Team application not found': 'Заявка в команду не найдена.',
    'Team application is already cancelled': 'Заявка в команду уже отменена.',
    'Invalid team id': 'Некорректная команда.',
    'Invalid team application id': 'Некорректная заявка в команду.',
    'training id and participantId must be positive integers':
      'Некорректно указаны тренировка или участник.',
    'participantId must be a positive integer':
      'Выберите участника для заявки в команду.',
    'commentFromApplicant must be a string':
      'Комментарий к заявке указан некорректно.',
    'userId and profileType are required':
      'Не удалось создать участника: не хватает обязательных данных.',
    'profileType cannot be empty': 'Тип профиля не может быть пустым.',
    'birthDate must be a valid date': 'Укажите корректную дату рождения.',
    'No valid fields provided for update': 'Нет данных для обновления участника.',
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
    return 'Участник не указан';
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
      return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-700';
    case 'CANCELLED':
      return 'bg-stone-200 text-stone-700';
    case 'IN_REVIEW':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-amber-100 text-amber-700';
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

function getTrainingAvailability(training: AvailableTrainingSummary) {
  const placesLeft = Math.max(training.capacity - training._count.bookings, 0);

  if (!training.isActive) {
    return {
      canBook: false,
      label: 'Набор закрыт',
      detail: 'Тренировка временно недоступна для записи.',
      badgeClass: 'bg-stone-200 text-stone-700',
    };
  }

  if (new Date(training.endTime).getTime() < Date.now()) {
    return {
      canBook: false,
      label: 'Тренировка завершена',
      detail: 'Запись на прошедшие тренировки недоступна.',
      badgeClass: 'bg-stone-200 text-stone-700',
    };
  }

  if (placesLeft === 0) {
    return {
      canBook: false,
      label: 'Мест нет',
      detail: `Записано ${training._count.bookings} из ${training.capacity}.`,
      badgeClass: 'bg-rose-100 text-rose-700',
    };
  }

  return {
    canBook: true,
    label: `Свободно ${placesLeft} из ${training.capacity}`,
    detail: `Уже записано ${training._count.bookings} из ${training.capacity}.`,
    badgeClass: 'bg-emerald-100 text-emerald-700',
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
}) {
  return (
    <section className="rounded-[28px] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
        {props.eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-stone-950">{props.title}</h2>
      <div className="mt-5">{props.children}</div>
    </section>
  );
}

export default function CabinetPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
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

  function resetParticipantForm() {
    setParticipantForm(initialParticipantFormState);
    setParticipantFormMode('create');
    setEditingParticipantId(null);
    setEditingOriginalProfileType(null);
    setParticipantError(null);
    setParticipantSuccess(null);
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

  async function reloadDashboard(keepContent: boolean) {
    if (!keepContent) {
      setStatus('loading');
    }

    setError(null);

    const { response, payload } = await fetchJson('/api/me/dashboard');

    if (response.status === 401) {
      router.replace('/dev/login?next=/cabinet');
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
      router.replace('/dev/login?next=/cabinet');
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

  async function reloadTeamApplications(keepContent: boolean) {
    if (!keepContent) {
      setTeamApplicationsStatus('loading');
    }

    setTeamApplicationsError(null);

    const { response, payload } = await fetchJson('/api/my/team-applications');

    if (response.status === 401) {
      router.replace('/dev/login?next=/cabinet');
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

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      setStatus('loading');
      setError(null);

      try {
        const { response, payload } = await fetchJson('/api/me/dashboard');

        if (response.status === 401) {
          router.replace('/dev/login?next=/cabinet');
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
  }, [router]);

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
          router.replace('/dev/login?next=/cabinet');
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
  }, [router]);

  useEffect(() => {
    let isCancelled = false;

    async function loadTeamApplications() {
      setTeamApplicationsStatus('loading');
      setTeamApplicationsError(null);

      try {
        const { response, payload } = await fetchJson('/api/my/team-applications');

        if (response.status === 401) {
          router.replace('/dev/login?next=/cabinet');
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
  }, [router]);

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

  async function handleParticipantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dashboard) {
      setParticipantError('Кабинет еще не загружен.');
      return;
    }

    const firstName = participantForm.firstName.trim();
    const lastName = participantForm.lastName.trim();

    if (!firstName || !lastName) {
      setParticipantError('Укажите имя и фамилию участника.');
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
        throw new Error('Участник для редактирования не выбран.');
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
        router.replace('/dev/login?next=/cabinet');
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
        throw new Error('Не удалось обновить список участников.');
      }

      const successMessage =
        participantFormMode === 'create'
          ? 'Участник успешно добавлен.'
          : 'Данные участника сохранены.';

      resetParticipantForm();
      setParticipantSuccess(successMessage);
    } catch (saveError) {
      setParticipantError(
        saveError instanceof Error
          ? saveError.message
          : 'Не удалось сохранить участника.'
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
        message: 'Сначала добавьте участника в разделе «Мои участники».',
      });
      return;
    }

    const participantId = getSelectedParticipantIdForTraining(training.trainingId);

    if (!participantId) {
      setTrainingFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Выберите участника для записи на тренировку.',
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
        message: 'Выбранный участник уже записан на эту тренировку.',
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
        router.replace('/dev/login?next=/cabinet');
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
        router.replace('/dev/login?next=/cabinet');
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
        message: 'Сначала добавьте участника в разделе «Мои участники».',
      });
      return;
    }

    const participantId = getSelectedParticipantIdForTeam(team.id);

    if (!participantId) {
      setTeamFeedback({
        scope: 'catalog',
        tone: 'error',
        message: 'Выберите участника для заявки в команду.',
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
        router.replace('/dev/login?next=/cabinet');
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
        router.replace('/dev/login?next=/cabinet');
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#ede6d8_45%,#e4ddcf_100%)] px-4 py-8 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[30px] border border-stone-300/70 bg-[#171411] px-6 py-7 text-stone-100 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                Личный кабинет
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Ваш кабинет
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
                Единая точка входа для ваших участников, записей на тренировки,
                заявок в команду и бронирований.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dev/login?next=/cabinet"
                className="rounded-full border border-stone-600 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-300 hover:text-white"
              >
                Вход в режиме разработки
              </Link>
            </div>
          </div>
        </header>

        {status === 'loading' ? (
          <section className="rounded-[28px] border border-stone-300/70 bg-white/90 p-6 text-sm text-stone-600 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
            Загружаем кабинет...
          </section>
        ) : null}

        {status === 'error' ? (
          <section className="rounded-[28px] border border-rose-300 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)]">
            {error}
          </section>
        ) : null}

        {status === 'ready' && dashboard ? (
          <>
            <SectionCard
              eyebrow="Текущий пользователь"
              title={`Пользователь #${dashboard.currentUser.id}`}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-sm font-medium text-stone-500">Профиль</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">
                    {dashboard.currentUser.profile
                      ? formatPersonName(dashboard.currentUser.profile)
                      : 'Профиль не заполнен'}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Роли: {formatRoleList(dashboard.currentUser.roles)}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-sm font-medium text-stone-500">Контакты</p>
                  <p className="mt-2 text-sm text-stone-700">
                    Эл. почта: {dashboard.currentUser.email || 'Не указана'}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Телеграм: {dashboard.currentUser.telegramId || 'Не указан'}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Предпочитаемый город:{' '}
                    {dashboard.currentUser.preferredCity?.name || 'Не указан'}
                  </p>
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
              <SectionCard eyebrow="Участники" title="Мои участники">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-stone-600">
                        Добавляйте участников и редактируйте их данные прямо из кабинета.
                      </p>
                      <button
                        type="button"
                        onClick={resetParticipantForm}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                      >
                        Новый участник
                      </button>
                    </div>

                    {dashboard.participants.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                        У вас пока нет участников. Заполните форму справа, чтобы добавить первого.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dashboard.participants.map((participant) => (
                          <article
                            key={participant.id}
                            className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-stone-950">
                                    {formatPersonName(participant)}
                                  </p>
                                  <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-700">
                                    #{participant.id}
                                  </span>
                                </div>
                                <div className="mt-3 grid gap-1 text-sm text-stone-600">
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
                                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                              >
                                Редактировать
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-500">
                          {participantFormMode === 'create'
                            ? 'Новый участник'
                            : `Редактирование участника #${editingParticipantId}`}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-stone-950">
                          {participantFormMode === 'create'
                            ? 'Добавить участника'
                            : 'Изменить данные участника'}
                        </h3>
                        <p className="mt-1 text-sm text-stone-600">
                          {participantFormMode === 'create'
                            ? 'Заполните основные данные участника. После сохранения список обновится автоматически.'
                            : 'Измените поля и сохраните обновленные данные без перезагрузки страницы.'}
                        </p>
                      </div>

                      {participantFormMode === 'edit' ? (
                        <button
                          type="button"
                          onClick={resetParticipantForm}
                          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                        >
                          Отменить
                        </button>
                      ) : null}
                    </div>

                    <form className="mt-5 flex flex-col gap-4" onSubmit={handleParticipantSubmit}>
                      <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                        Имя
                        <input
                          value={participantForm.firstName}
                          onChange={(event) =>
                            handleParticipantInputChange('firstName', event.target.value)
                          }
                          className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
                          placeholder="Иван"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                        Фамилия
                        <input
                          value={participantForm.lastName}
                          onChange={(event) =>
                            handleParticipantInputChange('lastName', event.target.value)
                          }
                          className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
                          placeholder="Иванов"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                        Тип профиля
                        <select
                          value={participantForm.profileKind}
                          onChange={(event) =>
                            handleParticipantInputChange(
                              'profileKind',
                              event.target.value as ParticipantProfileKind
                            )
                          }
                          className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
                        >
                          <option value="SELF">Свой профиль</option>
                          <option value="CHILD">Ребенок</option>
                        </select>
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                        Дата рождения
                        <input
                          type="date"
                          value={participantForm.birthDate}
                          onChange={(event) =>
                            handleParticipantInputChange('birthDate', event.target.value)
                          }
                          className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500"
                        />
                      </label>

                      {participantError ? (
                        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {participantError}
                        </p>
                      ) : null}

                      {participantSuccess ? (
                        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          {participantSuccess}
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
                              ? 'Добавить участника'
                              : 'Сохранить изменения'}
                        </button>
                        <button
                          type="button"
                          onClick={resetParticipantForm}
                          disabled={participantStatus === 'saving'}
                          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Очистить форму
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Тренировки"
                title="Доступные тренировки"
              >
                <div className="space-y-4">
                  <p className="text-sm text-stone-600">
                    Выберите участника и оформите запись на подходящую тренировку.
                  </p>

                  {trainingFeedback?.scope === 'catalog' ? (
                    <p
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        trainingFeedback.tone === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {trainingFeedback.message}
                    </p>
                  ) : null}

                  {trainingsStatus === 'loading' ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                      Загружаем доступные тренировки...
                    </p>
                  ) : trainingsStatus === 'error' && availableTrainings.length === 0 ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                      {trainingsError}
                    </p>
                  ) : availableTrainings.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                      Сейчас нет доступных тренировок для записи.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {availableTrainings.map((training) => {
                        const availability = getTrainingAvailability(training);
                        const selectedParticipantId =
                          getSelectedParticipantIdForTraining(training.trainingId);
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
                        const isBookingInProgress =
                          bookingTrainingId === training.trainingId;
                        const isBookingDisabled =
                          !availability.canBook ||
                          dashboard.participants.length === 0 ||
                          selectedParticipantId === null ||
                          isSelectedParticipantAlreadyBooked ||
                          isBookingInProgress;

                        return (
                          <article
                            key={training.trainingId}
                            className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-stone-950">
                                    {training.name}
                                  </p>
                                  <p className="mt-1 text-sm text-stone-600">
                                    {training.city.name} / {training.location}
                                  </p>
                                  <p className="mt-2 text-sm text-stone-700">
                                    {formatDateTime(training.startTime)} —{' '}
                                    {formatTime(training.endTime)}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${availability.badgeClass}`}
                                >
                                  {availability.label}
                                </span>
                              </div>

                              <div className="grid gap-1 text-sm text-stone-600">
                                <p>Формат: {formatTrainingType(training.trainingType)}</p>
                                <p>Тренер: {formatTrainerName(training.trainer)}</p>
                                <p>{availability.detail}</p>
                                {bookedParticipants.length > 0 ? (
                                  <p>
                                    Уже записаны:{' '}
                                    {bookedParticipants
                                      .map((booking) =>
                                        formatPersonName(booking.participant)
                                      )
                                      .join(', ')}
                                  </p>
                                ) : null}
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                <label className="flex-1 text-sm font-medium text-stone-700">
                                  Участник
                                  <select
                                    value={
                                      selectedParticipantId
                                        ? String(selectedParticipantId)
                                        : ''
                                    }
                                    onChange={(event) =>
                                      handleTrainingParticipantChange(
                                        training.trainingId,
                                        event.target.value
                                      )
                                    }
                                    disabled={
                                      dashboard.participants.length === 0 ||
                                      isBookingInProgress
                                    }
                                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                                  >
                                    {dashboard.participants.length === 0 ? (
                                      <option value="">
                                        Сначала добавьте участника
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

                                <button
                                  type="button"
                                  onClick={() => handleTrainingBooking(training)}
                                  disabled={isBookingDisabled}
                                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                                >
                                  {isBookingInProgress
                                    ? 'Оформляем запись...'
                                    : 'Записать на тренировку'}
                                </button>
                              </div>

                              {dashboard.participants.length === 0 ? (
                                <p className="text-sm text-stone-600">
                                  Чтобы записаться на тренировку, сначала добавьте
                                  участника в разделе «Мои участники».
                                </p>
                              ) : null}

                              {isSelectedParticipantAlreadyBooked &&
                              selectedParticipant ? (
                                <p className="text-sm text-amber-700">
                                  {formatPersonName(selectedParticipant)} уже записан
                                  на эту тренировку.
                                </p>
                              ) : null}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard eyebrow="Тренировки" title="Мои записи на тренировки">
                {trainingFeedback?.scope === 'bookings' ? (
                  <p
                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                      trainingFeedback.tone === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {trainingFeedback.message}
                  </p>
                ) : null}

                {dashboard.trainingBookings.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет ближайших записей на тренировки.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.trainingBookings.map((booking) => (
                      <article
                        key={booking.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {booking.training.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {formatPersonName(booking.participant)} /{' '}
                              {booking.training.location}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {formatDateTime(booking.training.startTime)} —{' '}
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
                              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
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

              <SectionCard eyebrow="Команда" title="Доступные команды">
                <div className="space-y-4">
                  <p className="text-sm text-stone-600">
                    Выберите участника и отправьте заявку в подходящую команду прямо
                    из кабинета.
                  </p>

                  {teamFeedback?.scope === 'catalog' ? (
                    <p
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        teamFeedback.tone === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {teamFeedback.message}
                    </p>
                  ) : null}

                  {teamsStatus === 'loading' ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                      Загружаем список команд...
                    </p>
                  ) : teamsStatus === 'error' && availableTeams.length === 0 ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                      {teamsError}
                    </p>
                  ) : availableTeams.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
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

                        return (
                          <article
                            key={team.id}
                            className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                          >
                            <div className="flex flex-col gap-4">
                              <div>
                                <p className="font-semibold text-stone-950">{team.name}</p>
                                <p className="mt-1 text-sm text-stone-600">
                                  {team.city?.name || 'Город не указан'}
                                </p>
                                {team.description ? (
                                  <p className="mt-2 text-sm text-stone-700">
                                    {team.description}
                                  </p>
                                ) : null}
                              </div>

                              <div className="grid gap-3">
                                <label className="text-sm font-medium text-stone-700">
                                  Участник
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
                                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                                  >
                                    {dashboard.participants.length === 0 ? (
                                      <option value="">
                                        Сначала добавьте участника
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

                                <label className="text-sm font-medium text-stone-700">
                                  Комментарий к заявке
                                  <textarea
                                    value={teamComments[team.id] ?? ''}
                                    onChange={(event) =>
                                      handleTeamCommentChange(team.id, event.target.value)
                                    }
                                    rows={3}
                                    disabled={isSubmitting}
                                    placeholder="Необязательно"
                                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                                  />
                                </label>
                              </div>

                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-2">
                                  {dashboard.participants.length === 0 ? (
                                    <p className="text-sm text-stone-600">
                                      Чтобы отправить заявку, сначала добавьте участника
                                      в разделе «Мои участники».
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
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard eyebrow="Команда" title="Мои заявки в команду">
                {teamFeedback?.scope === 'applications' ? (
                  <p
                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                      teamFeedback.tone === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {teamFeedback.message}
                  </p>
                ) : null}

                {teamApplicationsStatus === 'loading' ? (
                  <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
                    Загружаем ваши заявки в команду...
                  </p>
                ) : teamApplicationsStatus === 'error' && teamApplications.length === 0 ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                    {teamApplicationsError}
                  </p>
                ) : teamApplications.length === 0 ? (
                  <p className="text-sm text-stone-600">
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
                          className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-stone-950">
                                {application.team.name}
                              </p>
                              <p className="mt-1 text-sm text-stone-600">
                                {formatPersonName(application.participant)} /{' '}
                                {application.team.city?.name || 'Город не указан'}
                              </p>
                              <p className="mt-2 text-sm text-stone-700">
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
                                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
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

              <SectionCard eyebrow="Аренда" title="Мои бронирования">
                {dashboard.rentalBookings.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет активных бронирований.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.rentalBookings.map((booking) => (
                      <article
                        key={booking.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {booking.resource.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {booking.facility.name} / {booking.city.name}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {formatDateTime(booking.slot.startsAt)}
                            </p>
                          </div>
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                            {formatStatus(booking.status)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
