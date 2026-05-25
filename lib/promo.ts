export const PROMO_TICKET_STATUSES = [
  'NEW',
  'OPENED',
  'WIN',
  'LOSE',
  'EXPIRED',
] as const;

export const PROMO_SYMBOLS = [
  'STICK',
  'HELMET',
  'PUCK',
  'GOAL',
  'TRIP',
  'DISCOUNT',
  'NO_WIN',
] as const;

export const WINNING_PROMO_SYMBOLS = [
  'STICK',
  'HELMET',
  'PUCK',
  'GOAL',
  'TRIP',
  'DISCOUNT',
] as const;

export type PromoTicketStatus = (typeof PROMO_TICKET_STATUSES)[number];
export type PromoSymbol = (typeof PROMO_SYMBOLS)[number];
export type WinningPromoSymbol = (typeof WINNING_PROMO_SYMBOLS)[number];
export type PromoSymbolTuple = readonly [PromoSymbol, PromoSymbol, PromoSymbol];

export type PromoPrizeSummary = {
  id: number;
  symbol: WinningPromoSymbol;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromoTicketUserView = {
  id: number;
  code: string;
  campaignLabel: string | null;
  status: PromoTicketStatus;
  symbols: PromoSymbolTuple | null;
  prize: PromoPrizeSummary | null;
  openedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PromoAdminUserSummary = {
  id: number;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  profileLabel: string;
};

export type PromoTicketAdminView = PromoTicketUserView & {
  sealedSymbols: PromoSymbolTuple;
  user: PromoAdminUserSummary;
};

export type PromoEvaluation =
  | {
      status: 'WIN';
      reason: 'triple-match';
      prizeSymbol: WinningPromoSymbol;
    }
  | {
      status: 'LOSE';
      reason: 'triple-no-win' | 'mismatch';
      prizeSymbol: null;
    };

export const PROMO_COMPLIANCE_NOTICE =
  'Модуль является промо-механикой и не предназначен для запуска платных лотерей, азартных игр, ставок или продажи шанса на выигрыш без отдельной юридической проверки.';

export const promoSymbolMeta: Record<
  PromoSymbol,
  { emoji: string; label: string; shortLabel: string }
> = {
  STICK: {
    emoji: '🏒',
    label: 'Клюшка',
    shortLabel: 'STICK',
  },
  HELMET: {
    emoji: '⛑️',
    label: 'Шлем',
    shortLabel: 'HELMET',
  },
  PUCK: {
    emoji: '🥅',
    label: 'Шайба',
    shortLabel: 'PUCK',
  },
  GOAL: {
    emoji: '🦍',
    label: 'Тематический приз Gorilla',
    shortLabel: 'GOAL',
  },
  TRIP: {
    emoji: '✈️',
    label: 'Путёвка',
    shortLabel: 'TRIP',
  },
  DISCOUNT: {
    emoji: '🎟️',
    label: 'Скидка',
    shortLabel: 'DISCOUNT',
  },
  NO_WIN: {
    emoji: '❌',
    label: 'Без приза',
    shortLabel: 'NO_WIN',
  },
};

export const defaultPrizeContentBySymbol: Record<
  WinningPromoSymbol,
  { title: string; description: string }
> = {
  STICK: {
    title: 'Клюшка',
    description: 'Фиксированный промо-приз: хоккейная клюшка.',
  },
  HELMET: {
    title: 'Шлем',
    description: 'Фиксированный промо-приз: хоккейный шлем.',
  },
  PUCK: {
    title: 'Шайба',
    description: 'Фиксированный промо-приз: брендированная шайба.',
  },
  GOAL: {
    title: 'Тематический приз Gorilla',
    description: 'Фиксированный промо-приз: тематический подарок Gorilla.',
  },
  TRIP: {
    title: 'Путёвка',
    description: 'Фиксированный промо-приз: путёвка по условиям акции.',
  },
  DISCOUNT: {
    title: 'Скидка',
    description: 'Фиксированный промо-приз: скидка на продукт или сервис Gorilla.',
  },
};

export function isPromoSymbol(value: string): value is PromoSymbol {
  return PROMO_SYMBOLS.includes(value as PromoSymbol);
}

export function isWinningPromoSymbol(
  symbol: PromoSymbol
): symbol is WinningPromoSymbol {
  return symbol !== 'NO_WIN';
}

export function toPromoSymbolTuple(
  symbols: readonly PromoSymbol[]
): PromoSymbolTuple | null {
  if (symbols.length !== 3) {
    return null;
  }

  return [symbols[0], symbols[1], symbols[2]];
}

export function formatPromoTicketStatus(status: PromoTicketStatus) {
  switch (status) {
    case 'NEW':
      return 'NEW';
    case 'OPENED':
      return 'OPENED';
    case 'WIN':
      return 'WIN';
    case 'LOSE':
      return 'LOSE';
    case 'EXPIRED':
      return 'EXPIRED';
    default:
      return status;
  }
}

export function evaluateTicketSymbols(symbols: PromoSymbolTuple): PromoEvaluation {
  const [first, second, third] = symbols;
  const isTripleMatch = first === second && second === third;

  if (isTripleMatch && first === 'NO_WIN') {
    return {
      status: 'LOSE',
      reason: 'triple-no-win',
      prizeSymbol: null,
    };
  }

  if (isTripleMatch && isWinningPromoSymbol(first)) {
    return {
      status: 'WIN',
      reason: 'triple-match',
      prizeSymbol: first,
    };
  }

  return {
    status: 'LOSE',
    reason: 'mismatch',
    prizeSymbol: null,
  };
}

export function formatPromoCombination(symbols: PromoSymbolTuple) {
  return symbols.join(' + ');
}

export function getPromoPrizeFallback(symbol: WinningPromoSymbol) {
  return defaultPrizeContentBySymbol[symbol];
}

export function formatPromoOwnerLabel(user: PromoAdminUserSummary) {
  if (user.profileLabel) {
    return user.profileLabel;
  }

  if (user.email) {
    return user.email;
  }

  if (user.telegramId) {
    return `@${user.telegramId}`;
  }

  if (user.phone) {
    return user.phone;
  }

  return `Пользователь #${user.id}`;
}
