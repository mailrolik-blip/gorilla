export type TelegramNewsItem = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  href: string;
  image: string | null;
  publishedAt: string;
  dateLabel: string;
};

type RemoteTelegramNewsItem = {
  id: string;
  title: string;
  excerpt: string;
  content?: string | null;
  href: string;
  image?: string | null;
  publishedAt: string;
};

const TELEGRAM_CHANNEL_URL = 'https://t.me/Gorillahockeyacademy';
const TELEGRAM_PUBLIC_FEED_URL = 'https://t.me/s/Gorillahockeyacademy';

const fallbackFeed: RemoteTelegramNewsItem[] = [
  {
    id: 'telegram-2026-05-24-enrollment',
    title: 'Открыт набор на сезон 2026/27',
    excerpt:
      'Новые окна по Москве и Нижнему Новгороду: первый лёд, family ice и игровые группы уже в расписании.',
    content:
      'Открываем набор на сезон 2026/27. Доступны группы для первого льда, family ice и игровых форматов в Москве и Нижнем Новгороде. Поможем выбрать уровень и время первой тренировки.',
    href: `${TELEGRAM_CHANNEL_URL}/210`,
    image: '/homepage-school/hero-ice-arena.svg',
    publishedAt: '2026-05-24T11:00:00+06:00',
  },
  {
    id: 'telegram-2026-05-18-lhl',
    title: 'Gorilla Hockey снова в числе призёров ЛХЛ',
    excerpt:
      'Разбор последнего тура, лучшие эпизоды и фокус следующей недели уже в ленте школы.',
    content:
      'Команда Gorilla Hockey провела сильный тур ЛХЛ. В посте собраны главные эпизоды, тренерские комментарии и фокус на следующую игровую неделю.',
    href: `${TELEGRAM_CHANNEL_URL}/208`,
    image: '/homepage-school/team-moscow.svg',
    publishedAt: '2026-05-18T18:30:00+06:00',
  },
  {
    id: 'telegram-2026-05-12-family-ice',
    title: 'Family ice: открыта запись на ближайшую субботу',
    excerpt:
      'Свободные места на совместный лёд для детей и родителей. Формат подойдёт тем, кто только начинает путь в школе.',
    content:
      'Family ice возвращается в субботнее расписание. Это мягкий формат для детей и родителей: меньше барьеров, больше поддержки и понятный ритм первых занятий.',
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
  const content = repairTelegramEncoding(item.content ?? item.excerpt);
  const title = repairTelegramEncoding(item.title);
  const excerpt = repairTelegramEncoding(item.excerpt);

  return {
    id: item.id,
    title,
    excerpt,
    content,
    href: item.href,
    image: item.image ?? null,
    publishedAt: item.publishedAt,
    dateLabel: formatTelegramDate(item.publishedAt),
  };
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: '&',
    gt: '>',
    lt: '<',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#(\d+)|#x([\da-fA-F]+)|[a-zA-Z]+);/g, (entity, body, decimal, hex) => {
    if (decimal) {
      return String.fromCodePoint(Number(decimal));
    }

    if (hex) {
      return String.fromCodePoint(Number.parseInt(hex, 16));
    }

    return namedEntities[body] ?? entity;
  });
}

function countReadableCyrillic(value: string) {
  return (value.match(/[А-Яа-яЁё]/g) ?? []).length;
}

function repairTelegramEncoding(value: string) {
  if (!/[ÐÑð]/.test(value)) {
    return value;
  }

  const bytes = new Uint8Array(Array.from(value, (character) => character.charCodeAt(0) & 255));
  const decoded = new TextDecoder('utf-8').decode(bytes);

  return countReadableCyrillic(decoded) > countReadableCyrillic(value) ? decoded : value;
}

function stripTelegramHtml(value: string) {
  return repairTelegramEncoding(
    decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    )
  );
}

function getTelegramTitle(text: string) {
  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return 'Новость Gorilla Hockey';
  }

  return firstLine.length > 88 ? `${firstLine.slice(0, 85)}...` : firstLine;
}

function getTelegramExcerpt(text: string) {
  const compactText = text.replace(/\s+/g, ' ').trim();

  if (compactText.length <= 160) {
    return compactText;
  }

  return `${compactText.slice(0, 157)}...`;
}

function extractAttribute(value: string, attribute: string) {
  const match = value.match(new RegExp(`${attribute}="([^"]+)"`));
  return match?.[1] ?? null;
}

function extractPublicTelegramFeed(html: string) {
  const blocks = html.match(/<div class="tgme_widget_message_wrap[\s\S]*?(?=<div class="tgme_widget_message_wrap|<\/section>)/g);

  if (!blocks) {
    return null;
  }

  const items = blocks
    .map((block): RemoteTelegramNewsItem | null => {
      const messageLink = block.match(/href="(https:\/\/t\.me\/Gorillahockeyacademy\/(\d+))"/);
      const messageId = messageLink?.[2];
      const href = messageLink?.[1];
      const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const timeMatch = block.match(/<time datetime="([^"]+)"/);
      const photoMatch = block.match(/<a class="tgme_widget_message_photo_wrap[^"]*"[^>]*>/);

      if (!messageId || !href || !textMatch || !timeMatch) {
        return null;
      }

      const content = stripTelegramHtml(textMatch[1]);

      if (!content) {
        return null;
      }

      const photoStyle = photoMatch ? extractAttribute(photoMatch[0], 'style') : null;
      const imageMatch = photoStyle?.match(/url\('([^']+)'\)/);

      return {
        id: `telegram-${messageId}`,
        title: getTelegramTitle(content),
        excerpt: getTelegramExcerpt(content),
        content,
        href,
        image: imageMatch?.[1] ?? null,
        publishedAt: timeMatch[1],
      };
    })
    .filter((item): item is RemoteTelegramNewsItem => Boolean(item));

  return items.length > 0 ? items : null;
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

  if (sourceUrl) {
    try {
      const response = await fetch(sourceUrl, {
        next: { revalidate: 60 },
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const feed = extractRemoteFeed(payload);

        if (feed) {
          return feed;
        }
      }
    } catch {
      // Fall through to public Telegram page sync.
    }
  }

  try {
    const response = await fetch(TELEGRAM_PUBLIC_FEED_URL, {
      next: { revalidate: 60 },
      headers: {
        Accept: 'text/html',
        'User-Agent': 'Mozilla/5.0 GorillaHockeyHomepage/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    return extractPublicTelegramFeed(await response.text());
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
    .slice(0, 6)
    .map(normalizeFeedItem);
}
