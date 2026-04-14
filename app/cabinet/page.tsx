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

const initialParticipantFormState: ParticipantFormState = {
  firstName: '',
  lastName: '',
  profileKind: 'SELF',
  birthDate: '',
};

function translateErrorMessage(message: string) {
  const errorMessages: Record<string, string> = {
    'Failed to load dashboard': 'Не удалось загрузить кабинет.',
    'Failed to save participant': 'Не удалось сохранить участника.',
    'Current user is not authenticated': 'Пользователь не авторизован.',
    'User not found': 'Пользователь не найден.',
    'Participant not found': 'Участник не найден.',
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

              <SectionCard eyebrow="Тренировки" title="Мои записи на тренировки">
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
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {booking.training.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {formatPersonName(booking.participant)} /{' '}
                              {booking.training.location}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {formatDateTime(booking.training.startTime)}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            {formatStatus(booking.status)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard eyebrow="Команда" title="Мои заявки в команду">
                {dashboard.teamApplications.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    У вас пока нет активных заявок в команду.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.teamApplications.map((application) => (
                      <article
                        key={application.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {application.team.name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {formatPersonName(application.participant)}
                            </p>
                            <p className="mt-2 text-sm text-stone-700">
                              {application.commentFromApplicant || 'Комментарий не указан.'}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            {formatStatus(application.status)}
                          </span>
                        </div>
                      </article>
                    ))}
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
