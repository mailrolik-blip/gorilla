'use client';

import { type FormEvent, useEffect, useState } from 'react';

import { WorkspaceDisclosure, WorkspaceScoreStrip } from '@/components/workspace-frame';
import {
  PROMO_COMPLIANCE_NOTICE,
  PROMO_SYMBOLS,
  WINNING_PROMO_SYMBOLS,
  evaluateTicketSymbols,
  formatPromoCombination,
  formatPromoOwnerLabel,
  formatPromoTicketStatus,
  getPromoPrizeFallback,
  promoSymbolMeta,
  type PromoPrizeSummary,
  type PromoSymbol,
  type PromoTicketAdminView,
  type PromoTicketStatus,
  type WinningPromoSymbol,
} from '@/lib/promo';

type FetchState = 'loading' | 'ready' | 'error';
type EditableSymbolTuple = [PromoSymbol, PromoSymbol, PromoSymbol];

type PublicUserOption = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  createdAt: string;
  updatedAt: string;
};

type PrizeEditorState = {
  title: string;
  description: string;
  isActive: boolean;
};

type TicketIssueState = {
  userId: string;
  campaignLabel: string;
  expiresAt: string;
  symbols: EditableSymbolTuple;
};

type TicketEditorState = {
  campaignLabel: string;
  expiresAt: string;
  status: PromoTicketStatus;
  symbols: EditableSymbolTuple;
};

type FetchResult<T> = {
  payload: T | { error?: string } | null;
  response: Response;
};

const ticketStatusToneMap: Record<PromoTicketStatus, string> = {
  NEW: 'border-sky-400/30 bg-sky-500/12 text-sky-100',
  OPENED: 'border-violet-400/30 bg-violet-500/12 text-violet-100',
  WIN: 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100',
  LOSE: 'border-white/10 bg-black/20 text-stone-200',
  EXPIRED: 'border-rose-400/30 bg-rose-500/12 text-rose-100',
};

const defaultTicketSymbols: EditableSymbolTuple = ['STICK', 'STICK', 'STICK'];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<FetchResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  let payload: T | { error?: string } | null = null;

  try {
    payload = (await response.json()) as T | { error?: string };
  } catch {
    payload = null;
  }

  return { response, payload };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const date = new Date(trimmedValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toPrizeEditorState(prize: PromoPrizeSummary | null): PrizeEditorState {
  if (!prize) {
    return {
      title: '',
      description: '',
      isActive: true,
    };
  }

  return {
    title: prize.title,
    description: prize.description ?? '',
    isActive: prize.isActive,
  };
}

function toTicketEditorState(ticket: PromoTicketAdminView | null): TicketEditorState {
  if (!ticket) {
    return {
      campaignLabel: '',
      expiresAt: '',
      status: 'NEW',
      symbols: [...defaultTicketSymbols],
    };
  }

  return {
    campaignLabel: ticket.campaignLabel ?? '',
    expiresAt: toDateTimeLocalValue(ticket.expiresAt),
    status: ticket.status,
    symbols: [...ticket.sealedSymbols],
  };
}

function buildUserOptionLabel(user: PublicUserOption) {
  if (user.email) {
    return `${user.email} (#${user.id})`;
  }

  if (user.telegramId) {
    return `${user.telegramId} (#${user.id})`;
  }

  if (user.phone) {
    return `${user.phone} (#${user.id})`;
  }

  return `Пользователь #${user.id}`;
}

function buildTicketResultLabel(ticket: PromoTicketAdminView) {
  if (!ticket.symbols) {
    return 'Билет ещё не открыт';
  }

  const evaluation = evaluateTicketSymbols(ticket.symbols);

  if (evaluation.status === 'WIN') {
    const prizeTitle =
      ticket.prize?.title ?? getPromoPrizeFallback(evaluation.prizeSymbol).title;

    return `Выигрыш: ${prizeTitle}`;
  }

  return 'Без приза';
}

function SymbolPreview({
  symbol,
  tone = 'light',
}: {
  symbol: PromoSymbol;
  tone?: 'light' | 'dark';
}) {
  const meta = promoSymbolMeta[symbol];

  return (
    <div
      className={`rounded-2xl border px-3 py-3 text-center ${
        tone === 'dark'
          ? 'border-white/10 bg-black/20 text-white'
          : 'border-white/8 bg-white/[0.04] text-white'
      }`}
    >
      <div className="text-2xl">{meta.emoji}</div>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em]">
        {meta.shortLabel}
      </div>
    </div>
  );
}

export function PromoAdminModule() {
  const [status, setStatus] = useState<FetchState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PublicUserOption[]>([]);
  const [prizes, setPrizes] = useState<PromoPrizeSummary[]>([]);
  const [tickets, setTickets] = useState<PromoTicketAdminView[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<number | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [prizeFeedback, setPrizeFeedback] = useState<string | null>(null);
  const [ticketFeedback, setTicketFeedback] = useState<string | null>(null);
  const [isCreatePrizeFormOpen, setIsCreatePrizeFormOpen] = useState(false);
  const [isIssueTicketFormOpen, setIsIssueTicketFormOpen] = useState(false);
  const [createPrizeForm, setCreatePrizeForm] = useState<{
    symbol: WinningPromoSymbol;
    title: string;
    description: string;
    isActive: boolean;
  }>({
    symbol: WINNING_PROMO_SYMBOLS[0],
    title: '',
    description: '',
    isActive: true,
  });
  const [prizeEditor, setPrizeEditor] = useState<PrizeEditorState>({
    ...toPrizeEditorState(null),
  });
  const [ticketIssueForm, setTicketIssueForm] = useState<TicketIssueState>({
    userId: '',
    campaignLabel: '',
    expiresAt: '',
    symbols: [...defaultTicketSymbols],
  });
  const [ticketEditor, setTicketEditor] = useState<TicketEditorState>({
    ...toTicketEditorState(null),
  });

  const selectedPrize =
    prizes.find((prize) => prize.id === selectedPrizeId) ?? null;
  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  const selectedTicketEvaluation = selectedTicket?.symbols
    ? evaluateTicketSymbols(selectedTicket.symbols)
    : evaluateTicketSymbols(selectedTicket?.sealedSymbols ?? defaultTicketSymbols);
  const newTicketCount = tickets.filter((ticket) => ticket.status === 'NEW').length;
  const winTicketCount = tickets.filter((ticket) => ticket.status === 'WIN').length;
  const loseTicketCount = tickets.filter((ticket) =>
    ['LOSE', 'EXPIRED'].includes(ticket.status)
  ).length;

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setStatus('loading');
      setError(null);

      const [usersResult, prizesResult, ticketsResult] = await Promise.all([
        fetchJson<PublicUserOption[]>('/api/users'),
        fetchJson<PromoPrizeSummary[]>('/api/admin/promo-prizes'),
        fetchJson<PromoTicketAdminView[]>('/api/admin/promo-tickets'),
      ]);

      const failedResult = [usersResult, prizesResult, ticketsResult].find(
        (result) => !result.response.ok
      );

      if (failedResult) {
        if (!isCancelled) {
          setError(
            (failedResult.payload as { error?: string } | null)?.error ||
              'Не удалось загрузить promo staff-модуль.'
          );
          setStatus('error');
        }
        return;
      }

      const nextUsers = usersResult.payload as PublicUserOption[];
      const nextPrizes = prizesResult.payload as PromoPrizeSummary[];
      const nextTickets = ticketsResult.payload as PromoTicketAdminView[];

      if (!isCancelled) {
        setUsers(nextUsers);
        setPrizes(nextPrizes);
        setTickets(nextTickets);
        setSelectedPrizeId(null);
        setPrizeEditor(toPrizeEditorState(null));
        setSelectedTicketId(null);
        setTicketEditor(toTicketEditorState(null));
        setTicketIssueForm((currentValue) => ({
          ...currentValue,
          userId: currentValue.userId || String(nextUsers[0]?.id ?? ''),
        }));
        setStatus('ready');
      }
    }

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleCreatePrize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrizeFeedback(null);

    const title = createPrizeForm.title.trim();

    if (!title) {
      setPrizeFeedback('Укажите название приза.');
      return;
    }

    setBusyKey('create-prize');

    const result = await fetchJson<PromoPrizeSummary>('/api/admin/promo-prizes', {
      method: 'POST',
      body: JSON.stringify({
        symbol: createPrizeForm.symbol,
        title,
        description: createPrizeForm.description.trim() || null,
        isActive: createPrizeForm.isActive,
      }),
    });

    if (!result.response.ok) {
      setPrizeFeedback(
        (result.payload as { error?: string } | null)?.error ||
          'Не удалось создать promo-приз.'
      );
      setBusyKey(null);
      return;
    }

    const createdPrize = result.payload as PromoPrizeSummary;

    setPrizes((currentValue) => [createdPrize, ...currentValue]);
    setSelectedPrizeId(createdPrize.id);
    setPrizeEditor(toPrizeEditorState(createdPrize));
    setCreatePrizeForm({
      symbol: WINNING_PROMO_SYMBOLS[0],
      title: '',
      description: '',
      isActive: true,
    });
    setIsCreatePrizeFormOpen(false);
    setPrizeFeedback('Приз создан.');
    setBusyKey(null);
  }

  async function handleUpdatePrize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrizeFeedback(null);

    if (!selectedPrize) {
      return;
    }

    const title = prizeEditor.title.trim();

    if (!title) {
      setPrizeFeedback('Название приза не может быть пустым.');
      return;
    }

    setBusyKey(`update-prize-${selectedPrize.id}`);

    const result = await fetchJson<PromoPrizeSummary>(
      `/api/admin/promo-prizes/${selectedPrize.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          description: prizeEditor.description.trim() || null,
          isActive: prizeEditor.isActive,
        }),
      }
    );

    if (!result.response.ok) {
      setPrizeFeedback(
        (result.payload as { error?: string } | null)?.error ||
          'Не удалось обновить promo-приз.'
      );
      setBusyKey(null);
      return;
    }

    const updatedPrize = result.payload as PromoPrizeSummary;

    setPrizes((currentValue) =>
      currentValue.map((prize) => (prize.id === updatedPrize.id ? updatedPrize : prize))
    );
    setPrizeEditor(toPrizeEditorState(updatedPrize));
    setPrizeFeedback('Приз обновлён.');
    setBusyKey(null);
  }

  async function handleIssueTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTicketFeedback(null);

    const userId = Number(ticketIssueForm.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      setTicketFeedback('Выберите пользователя для выдачи билета.');
      return;
    }

    setBusyKey('issue-ticket');

    const result = await fetchJson<PromoTicketAdminView>('/api/admin/promo-tickets', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        campaignLabel: ticketIssueForm.campaignLabel.trim() || null,
        expiresAt: toIsoOrNull(ticketIssueForm.expiresAt),
        sealedSymbols: ticketIssueForm.symbols,
      }),
    });

    if (!result.response.ok) {
      setTicketFeedback(
        (result.payload as { error?: string } | null)?.error ||
          'Не удалось выдать promo-билет.'
      );
      setBusyKey(null);
      return;
    }

    const createdTicket = result.payload as PromoTicketAdminView;

    setTickets((currentValue) => [createdTicket, ...currentValue]);
    setSelectedTicketId(createdTicket.id);
    setTicketEditor(toTicketEditorState(createdTicket));
    setTicketIssueForm((currentValue) => ({
      ...currentValue,
      campaignLabel: '',
      expiresAt: '',
      symbols: [...defaultTicketSymbols],
    }));
    setIsIssueTicketFormOpen(false);
    setTicketFeedback('Билет выдан пользователю.');
    setBusyKey(null);
  }

  async function handleUpdateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTicketFeedback(null);

    if (!selectedTicket) {
      return;
    }

    setBusyKey(`update-ticket-${selectedTicket.id}`);

    const payload: Record<string, unknown> = {
      campaignLabel: ticketEditor.campaignLabel.trim() || null,
      expiresAt: toIsoOrNull(ticketEditor.expiresAt),
    };

    if (!selectedTicket.openedAt) {
      payload.status = ticketEditor.status === 'EXPIRED' ? 'EXPIRED' : 'NEW';
      payload.sealedSymbols = ticketEditor.symbols;
    }

    const result = await fetchJson<PromoTicketAdminView>(
      `/api/admin/promo-tickets/${selectedTicket.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );

    if (!result.response.ok) {
      setTicketFeedback(
        (result.payload as { error?: string } | null)?.error ||
          'Не удалось обновить promo-билет.'
      );
      setBusyKey(null);
      return;
    }

    const updatedTicket = result.payload as PromoTicketAdminView;

    setTickets((currentValue) =>
      currentValue.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
    );
    setSelectedTicketId(updatedTicket.id);
    setTicketEditor(toTicketEditorState(updatedTicket));
    setTicketFeedback('Билет обновлён.');
    setBusyKey(null);
  }

  if (status === 'loading') {
    return (
      <div className="rounded-[1.75rem] bg-white/[0.035] p-6 text-sm text-stone-400 ring-1 ring-inset ring-white/8">
        Загружаем promo staff-модуль...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-[1.75rem] border border-rose-400/30 bg-rose-500/12 p-6 text-sm text-rose-100">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceScoreStrip
        items={[
          {
            label: 'Призы',
            value: String(prizes.length),
            detail: 'Активные и архивные prize-конфигурации.',
          },
          {
            label: 'Билеты',
            value: String(tickets.length),
            detail: 'Выданные promo-билеты в staff-модуле.',
          },
          {
            label: 'NEW',
            value: String(newTicketCount),
            detail: 'Ожидают пользовательского открытия.',
            accent: 'sky',
          },
          {
            label: 'WIN / LOSE',
            value: `${winTicketCount} / ${loseTicketCount}`,
            detail: 'Зафиксированные результаты без пересчёта.',
            accent: 'emerald',
          },
        ]}
        compact
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-6 rounded-[1.9rem] bg-white/[0.03] p-5 backdrop-blur ring-1 ring-inset ring-white/8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              Promo prizes
            </div>
            <h3 className="mt-2 text-2xl font-black text-white">Управление призами</h3>
          </div>
          <WorkspaceDisclosure label="Как работает приз">
            Приз определяется по тройному совпадению символов и не хранится как
            отдельный случайный выигрыш по умолчанию.
          </WorkspaceDisclosure>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsCreatePrizeFormOpen((currentValue) => !currentValue)}
              className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
            >
              {isCreatePrizeFormOpen ? 'Скрыть форму приза' : 'Создать приз'}
            </button>
          </div>

          {isCreatePrizeFormOpen ? (
            <form
              onSubmit={handleCreatePrize}
              className="space-y-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-4"
            >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-stone-300">
                Символ
                <select
                  value={createPrizeForm.symbol}
                  onChange={(event) =>
                    setCreatePrizeForm((currentValue) => ({
                      ...currentValue,
                      symbol: event.target.value as WinningPromoSymbol,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                >
                  {WINNING_PROMO_SYMBOLS.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-stone-300">
                Название приза
                <input
                  value={createPrizeForm.title}
                  onChange={(event) =>
                    setCreatePrizeForm((currentValue) => ({
                      ...currentValue,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                  placeholder="Например, Клюшка"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-stone-300">
              Описание
              <textarea
                value={createPrizeForm.description}
                onChange={(event) =>
                  setCreatePrizeForm((currentValue) => ({
                    ...currentValue,
                    description: event.target.value,
                  }))
                }
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                placeholder="Фиксированный промо-приз по условиям акции"
              />
            </label>

            <label className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-stone-300">
              <input
                type="checkbox"
                checked={createPrizeForm.isActive}
                onChange={(event) =>
                  setCreatePrizeForm((currentValue) => ({
                    ...currentValue,
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-stone-300"
              />
              Приз активен для выдачи
            </label>

            <button
              type="submit"
              disabled={busyKey !== null}
              className="inline-flex items-center justify-center rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-stone-500"
            >
              {busyKey === 'create-prize' ? 'Сохраняем...' : 'Создать приз'}
            </button>
            </form>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              {prizes.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-black/20 p-4 text-sm text-stone-400">
                  Пока нет созданных призов.
                </div>
              ) : (
                prizes.map((prize) => (
                  <button
                    key={prize.id}
                    type="button"
                    onClick={() => {
                      setSelectedPrizeId(prize.id);
                      setPrizeEditor(toPrizeEditorState(prize));
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedPrize?.id === prize.id
                        ? 'border-amber-300/60 bg-amber-300/10'
                        : 'border-white/8 bg-white/[0.035] hover:border-white/16 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">{prize.title}</div>
                        <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                          {prize.symbol}
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          prize.isActive
                            ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
                            : 'border-white/10 bg-black/20 text-stone-300'
                        }`}
                      >
                        {prize.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedPrize ? (
              <form onSubmit={handleUpdatePrize} className="space-y-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                <div className="rounded-[1.35rem] border border-white/8 bg-black/18 px-4 py-3 text-sm text-stone-300">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                    Символ
                  </div>
                  <div className="mt-2 text-lg font-black text-white">
                    {selectedPrize.symbol}
                  </div>
                </div>

                <label className="block text-sm font-medium text-stone-300">
                  Название
                  <input
                    value={prizeEditor.title}
                    onChange={(event) =>
                      setPrizeEditor((currentValue) => ({
                        ...currentValue,
                        title: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                  />
                </label>

                <label className="block text-sm font-medium text-stone-300">
                  Описание
                  <textarea
                    value={prizeEditor.description}
                    onChange={(event) =>
                      setPrizeEditor((currentValue) => ({
                        ...currentValue,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-stone-300">
                  <input
                    type="checkbox"
                    checked={prizeEditor.isActive}
                    onChange={(event) =>
                      setPrizeEditor((currentValue) => ({
                        ...currentValue,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-stone-300"
                  />
                  Приз активен
                </label>

                <button
                  type="submit"
                  disabled={busyKey !== null}
                  className="inline-flex items-center justify-center rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-stone-500"
                >
                  {busyKey === `update-prize-${selectedPrize.id}` ? 'Сохраняем...' : 'Сохранить приз'}
                </button>
              </form>
            ) : (
              <div className="rounded-[1.6rem] bg-white/[0.04] p-4 text-sm text-stone-400 ring-1 ring-dashed ring-black/10">
                Выберите приз слева, чтобы открыть его данные для просмотра или редактирования.
              </div>
            )}
          </div>

          {prizeFeedback ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-stone-300">
              {prizeFeedback}
            </div>
          ) : null}
        </section>

        <section className="space-y-6 rounded-[1.9rem] bg-white/[0.03] p-5 backdrop-blur ring-1 ring-inset ring-white/8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              Promo tickets
            </div>
            <h3 className="mt-2 text-2xl font-black text-white">Выдача и контроль билетов</h3>
          </div>
          <WorkspaceDisclosure label="Как работает билет">
            Билет открывается пользователем один раз. Результат задаётся серверными
            символами и не пересчитывается при повторном запросе.
          </WorkspaceDisclosure>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsIssueTicketFormOpen((currentValue) => !currentValue)}
              className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
            >
              {isIssueTicketFormOpen ? 'Скрыть выдачу' : 'Выдать билет'}
            </button>
          </div>

          {isIssueTicketFormOpen ? (
            <form
              onSubmit={handleIssueTicket}
              className="space-y-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-4"
            >
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="text-sm font-medium text-stone-300">
                Пользователь
                <select
                  value={ticketIssueForm.userId}
                  onChange={(event) =>
                    setTicketIssueForm((currentValue) => ({
                      ...currentValue,
                      userId: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                >
                  {users.length === 0 ? <option value="">Нет пользователей</option> : null}
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {buildUserOptionLabel(user)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-stone-300">
                Кампания / промо-условие
                <input
                  value={ticketIssueForm.campaignLabel}
                  onChange={(event) =>
                    setTicketIssueForm((currentValue) => ({
                      ...currentValue,
                      campaignLabel: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                  placeholder="Например, Майская акция"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-stone-300">
              Срок действия
              <input
                type="datetime-local"
                value={ticketIssueForm.expiresAt}
                onChange={(event) =>
                  setTicketIssueForm((currentValue) => ({
                    ...currentValue,
                    expiresAt: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
              />
            </label>

            <div>
              <div className="text-sm font-medium text-stone-300">Запечатанные символы</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <label
                    key={index}
                    className="rounded-2xl border border-white/8 bg-black/18 p-3 text-sm font-medium text-stone-300"
                  >
                    Слот {index + 1}
                    <select
                      value={ticketIssueForm.symbols[index]}
                      onChange={(event) =>
                        setTicketIssueForm((currentValue) => {
                          const nextSymbols = [...currentValue.symbols] as EditableSymbolTuple;
                          nextSymbols[index] = event.target.value as PromoSymbol;
                          return {
                            ...currentValue,
                            symbols: nextSymbols,
                          };
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                    >
                      {PROMO_SYMBOLS.map((symbol) => (
                        <option key={symbol} value={symbol}>
                          {symbol}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={busyKey !== null || users.length === 0}
              className="inline-flex items-center justify-center rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-stone-500"
            >
              {busyKey === 'issue-ticket' ? 'Выдаём билет...' : 'Выдать билет'}
            </button>
            </form>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-3 xl:max-h-[720px] xl:overflow-y-auto xl:pr-2">
              {tickets.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-black/20 p-4 text-sm text-stone-400">
                  Пока нет выданных promo-билетов.
                </div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setTicketEditor(toTicketEditorState(ticket));
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedTicket?.id === ticket.id
                        ? 'border-amber-300/60 bg-amber-300/10'
                        : 'border-white/8 bg-white/[0.035] hover:border-white/16 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">{ticket.code}</div>
                        <div className="mt-1 text-xs text-stone-500">
                          {formatPromoOwnerLabel(ticket.user)}
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${ticketStatusToneMap[ticket.status]}`}
                      >
                        {formatPromoTicketStatus(ticket.status)}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-stone-500">
                      {buildTicketResultLabel(ticket)}
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedTicket ? (
              <div className="space-y-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                      Выбранный билет
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {selectedTicket.code}
                    </div>
                    <div className="mt-2 text-sm text-stone-400">
                      Пользователь: {formatPromoOwnerLabel(selectedTicket.user)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${ticketStatusToneMap[selectedTicket.status]}`}
                  >
                    {formatPromoTicketStatus(selectedTicket.status)}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/18 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                      Запечатанный результат
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {selectedTicket.sealedSymbols.map((symbol, index) => (
                        <SymbolPreview key={`${symbol}-${index}`} symbol={symbol} />
                      ))}
                    </div>
                    <div className="mt-3 text-sm font-medium text-stone-300">
                      {formatPromoCombination(selectedTicket.sealedSymbols)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/18 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                      Пользователь видит
                    </div>
                    {selectedTicket.symbols ? (
                      <>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          {selectedTicket.symbols.map((symbol, index) => (
                            <SymbolPreview key={`${symbol}-${index}`} symbol={symbol} />
                          ))}
                        </div>
                        <div className="mt-3 text-sm font-medium text-stone-300">
                          {formatPromoCombination(selectedTicket.symbols)}
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 rounded-[1.4rem] border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-stone-400">
                        До открытия пользователем комбинация скрыта на клиенте.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.4rem] bg-black/18 p-4 ring-1 ring-white/10">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                    Итог
                  </div>
                  {selectedTicketEvaluation.status === 'WIN' ? (
                    <>
                      <div className="mt-3 text-lg font-black text-emerald-300">
                        Выигрыш:{' '}
                        {selectedTicket.prize?.title ??
                          getPromoPrizeFallback(selectedTicketEvaluation.prizeSymbol).title}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-stone-400">
                        {selectedTicket.prize?.description ??
                          getPromoPrizeFallback(selectedTicketEvaluation.prizeSymbol).description}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 text-lg font-black text-white">Без приза</div>
                      <p className="mt-2 text-sm leading-7 text-stone-400">
                        {selectedTicketEvaluation.reason === 'triple-no-win'
                          ? 'NO_WIN + NO_WIN + NO_WIN серверно фиксируется как результат без приза.'
                          : 'Несовпадающие символы также фиксируются как результат без приза.'}
                      </p>
                    </>
                  )}
                </div>

                <form onSubmit={handleUpdateTicket} className="space-y-4 rounded-[1.4rem] bg-black/18 p-4 ring-1 ring-white/10">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="text-sm font-medium text-stone-300">
                      Кампания / промо-условие
                      <input
                        value={ticketEditor.campaignLabel}
                        onChange={(event) =>
                          setTicketEditor((currentValue) => ({
                            ...currentValue,
                            campaignLabel: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                      />
                    </label>

                    <label className="text-sm font-medium text-stone-300">
                      Срок действия
                      <input
                        type="datetime-local"
                        value={ticketEditor.expiresAt}
                        onChange={(event) =>
                          setTicketEditor((currentValue) => ({
                            ...currentValue,
                            expiresAt: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-stone-300">
                    Статус staff
                    <select
                      value={selectedTicket.openedAt ? selectedTicket.status : ticketEditor.status}
                      disabled={Boolean(selectedTicket.openedAt)}
                      onChange={(event) =>
                        setTicketEditor((currentValue) => ({
                          ...currentValue,
                          status: event.target.value as PromoTicketStatus,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                    >
                      <option value="NEW">NEW</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </label>

                  <div>
                    <div className="text-sm font-medium text-stone-300">Sealed symbols</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {[0, 1, 2].map((index) => (
                        <label
                          key={index}
                          className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-sm font-medium text-stone-300"
                        >
                          Слот {index + 1}
                          <select
                            value={ticketEditor.symbols[index]}
                            disabled={Boolean(selectedTicket.openedAt)}
                            onChange={(event) =>
                              setTicketEditor((currentValue) => {
                                const nextSymbols = [...currentValue.symbols] as EditableSymbolTuple;
                                nextSymbols[index] = event.target.value as PromoSymbol;
                                return {
                                  ...currentValue,
                                  symbols: nextSymbols,
                                };
                              })
                            }
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b0f13] px-4 py-3 text-base text-stone-100 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.04] disabled:text-stone-500"
                          >
                            {PROMO_SYMBOLS.map((symbol) => (
                              <option key={symbol} value={symbol}>
                                {symbol}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                        Создан
                      </div>
                      <div className="mt-1 font-semibold text-white">
                        {formatDateTime(selectedTicket.createdAt)}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                        Opened at
                      </div>
                      <div className="mt-1 font-semibold text-white">
                        {formatDateTime(selectedTicket.openedAt)}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                        Обновлён
                      </div>
                      <div className="mt-1 font-semibold text-white">
                        {formatDateTime(selectedTicket.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {selectedTicket.openedAt ? (
                    <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                      Открытый билет остаётся фиксированным: повторное открытие не
                      пересчитывает результат, а sealed symbols и итоговый статус
                      выигрыша/проигрыша больше не меняются.
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busyKey !== null}
                    className="inline-flex items-center justify-center rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-stone-500"
                  >
                    {busyKey === `update-ticket-${selectedTicket.id}` ? 'Сохраняем...' : 'Сохранить билет'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-[1.6rem] bg-white/[0.04] p-4 text-sm text-stone-400 ring-1 ring-dashed ring-black/10">
                Выберите билет слева, чтобы посмотреть результат и изменить доступные поля.
              </div>
            )}
          </div>

          {ticketFeedback ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-stone-300">
              {ticketFeedback}
            </div>
          ) : null}
        </section>
      </div>

      <WorkspaceDisclosure label="Правила промо">
        {PROMO_COMPLIANCE_NOTICE}
      </WorkspaceDisclosure>
    </div>
  );
}
