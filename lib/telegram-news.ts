export type TelegramNewsItem = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  image: string | null;
  publishedAt: string;
  dateLabel: string;
};

type RemoteTelegramNewsItem = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  image?: string | null;
  publishedAt: string;
};

const TELEGRAM_CHANNEL_URL = 'https://t.me/Gorillahockeyacademy';

const fallbackFeed: RemoteTelegramNewsItem[] = [
  {
    id: 'telegram-2026-05-24-enrollment',
    title: 'Открыт набор на сезон 2026/27',
    excerpt:
      'Собрали новые окна по Москве и Нижнему Новгороду: первый лёд, family ice и игровые группы уже в расписании.',
    href: `${TELEGRAM_CHANNEL_URL}/210`,
    image: '/homepage-school/hero-ice-arena.svg',
    publishedAt: '2026-05-24T11:00:00+06:00',
  },
  {
    id: 'telegram-2026-05-18-lhl',
    title: 'Команда Gorilla Hockey снова в числе призёров ЛХЛ',
    excerpt:
      'Разбор последнего тура, лучшие эпизоды и фокус следующей недели уже в ленте школы.',
    href: `${TELEGRAM_CHANNEL_URL}/208`,
    image: '/homepage-school/team-moscow.svg',
    publishedAt: '2026-05-18T18:30:00+06:00',
  },
  {
    id: 'telegram-2026-05-12-family-ice',
    title: 'Family ice: открыта запись на ближайшую субботу',
    excerpt:
      'Свободные места на совместный лёд для детей и родителей. Формат подойдёт тем, кто только начинает путь в школе.',
    href: `${TELEGRAM_CHANNEL_URL}/205`,
    image: '/homepage-school/training-family.svg',
    publishedAt: '2026-05-12T15:00:00+06:00',
  },
];

function formatTelegramDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
}

function normalizeFeedItem(item: RemoteTelegramNewsItem): TelegramNewsItem {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    href: item.href,
    image: item.image ?? null,
    publishedAt: item.publishedAt,
    dateLabel: formatTelegramDate(item.publishedAt),
  };
}

function isRemoteFeedItem(value: unknown): value is RemoteTelegramNewsItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.excerpt === 'string' &&
    typeof item.href === 'string' &&
    typeof item.publishedAt === 'string'
  );
}

function extractRemoteFeed(payload: unknown) {
  if (Array.isArray(payload) && payload.every(isRemoteFeedItem)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { items?: unknown[] }).items) &&
    (payload as { items: unknown[] }).items.every(isRemoteFeedItem)
  ) {
    return (payload as { items: RemoteTelegramNewsItem[] }).items;
  }

  return null;
}

async function fetchRemoteTelegramFeed() {
  const sourceUrl = process.env.GORILLA_TELEGRAM_FEED_URL;

  if (!sourceUrl) {
    return null;
  }

  try {
    const response = await fetch(sourceUrl, {
      next: { revalidate: 900 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    const feed = extractRemoteFeed(payload);
    return feed;
  } catch {
    return null;
  }
}

export async function getHomepageTelegramFeed() {
  const remoteFeed = await fetchRemoteTelegramFeed();
  const items = remoteFeed ?? fallbackFeed;

  return items
    .slice()
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
    )
    .slice(0, 3)
    .map(normalizeFeedItem);
}
