export type TelegramNewsItem = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  href: string;
  sourceHref: string | null;
  image: string | null;
  video: string | null;
  duration: string | null;
  mediaType: 'image' | 'video' | 'text';
  publishedAt: string;
  dateLabel: string;
};

type RemoteTelegramNewsItem = {
  id: string;
  messageId?: number;
  title: string;
  excerpt: string;
  content?: string | null;
  href: string;
  sourceHref?: string | null;
  image?: string | null;
  video?: string | null;
  duration?: string | null;
  mediaType?: 'image' | 'video' | 'text';
  publishedAt: string;
};

const TELEGRAM_CHANNEL_URL = 'https://t.me/Gorillahockeyacademy';
const TELEGRAM_PUBLIC_FEED_URL = 'https://t.me/s/Gorillahockeyacademy';
const TELEGRAM_FETCH_TIMEOUT_MS = 3500;
const TELEGRAM_VIDEO_PAGE_LIMIT = 4;

const fallbackFeed: RemoteTelegramNewsItem[] = [
  {
    id: 'telegram-2026-05-24-enrollment',
    title: 'Открыт набор на сезон 2026/27',
    excerpt:
      'Новые окна по Москве и Нижнему Новгороду: первый лёд, family ice и игровые группы уже в расписании.',
    content:
      'Открываем набор на сезон 2026/27. Доступны группы для первого льда, family ice и игровых форматов в Москве и Нижнем Новгороде. Поможем выбрать уровень и время первой тренировки.',
    href: `${TELEGRAM_CHANNEL_URL}/210`,
    sourceHref: null,
    image: '/homepage-school/hero-ice-arena.svg',
    video: null,
    duration: null,
    mediaType: 'image',
    publishedAt: '2026-05-24T11:00:00+06:00',
  },
  {
    id: 'telegram-2026-05-18-team-training',
    title: 'Gorilla Hockey готовит игровые группы',
    excerpt:
      'Тренерский разбор недели, игровые упражнения и фокус на развитие игроков уже в ленте школы.',
    content:
      'Хоккейный проект Gorilla Hockey развивает игровые группы без публикации неподтверждённых составов, матчей и статистики на главной.',
    href: `${TELEGRAM_CHANNEL_URL}/208`,
    sourceHref: null,
    image: '/homepage-school/team-moscow.svg',
    video: null,
    duration: null,
    mediaType: 'image',
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
    sourceHref: null,
    image: '/homepage-school/training-family.svg',
    video: null,
    duration: null,
    mediaType: 'image',
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
    sourceHref: item.sourceHref ?? null,
    image: item.image ?? null,
    video: item.video ?? null,
    duration: item.duration ?? null,
    mediaType: item.mediaType ?? (item.video ? 'video' : item.image ? 'image' : 'text'),
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
  return (value.match(/[\u0400-\u04ff]/g) ?? []).length;
}

function repairTelegramEncoding(value: string) {
  if (!/[\u00c3\u00d0\u00d1\u00f0\u00c2]/.test(value)) {
    return value;
  }

  const bytes = new Uint8Array(Array.from(value, (character) => character.charCodeAt(0) & 255));
  const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

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

function extractStyleUrl(value: string | null) {
  const src = value?.match(/url\((?:'|")?([^'")]+)(?:'|")?\)/)?.[1] ?? null;

  if (src?.startsWith('//')) {
    return `https:${src}`;
  }

  return src;
}

function normalizeTelegramUrl(src: string | null) {
  if (!src) {
    return null;
  }

  if (src.startsWith('//')) {
    return `https:${src}`;
  }

  return src;
}

function extractHrefValues(value: string) {
  return Array.from(value.matchAll(/href="([^"]+)"/g), (match) =>
    decodeHtmlEntities(match[1])
  );
}

function isBroadcastSourceUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    return (
      host.includes('youtube.com') ||
      host.includes('youtu.be') ||
      host.includes('rutube.ru') ||
      host.includes('vk.com') ||
      host.includes('vkvideo.ru') ||
      host.includes('twitch.tv') ||
      path.includes('live') ||
      path.includes('stream') ||
      path.includes('broadcast') ||
      path.includes('video')
    );
  } catch {
    return false;
  }
}

function isGiveshareCoverUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.hostname.toLowerCase() === 'giveshare.ru' &&
      /\.(avif|gif|jpe?g|png|webp)$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function extractGiveshareCoverUrl(value: string) {
  const urls = [
    ...extractHrefValues(value),
    ...Array.from(value.matchAll(/https:\/\/giveshare\.ru\/[^\s"'<>]+/gi), (match) =>
      decodeHtmlEntities(match[0])
    ),
  ]
    .map(normalizeTelegramUrl)
    .filter((url): url is string => Boolean(url));

  return urls.find(isGiveshareCoverUrl) ?? null;
}

function extractPublicTelegramFeed(html: string) {
  const blocks = html.match(/<div class="tgme_widget_message_wrap[\s\S]*?(?=<div class="tgme_widget_message_wrap|<\/section>)/g);

  if (!blocks) {
    return null;
  }

  const items = blocks
    .map((block): RemoteTelegramNewsItem | null => {
      const messageLink = block.match(/href="(https:\/\/t\.me\/Gorillahockeyacademy\/(\d+))"/i);
      const messageId = messageLink?.[2];
      const href = messageLink?.[1];
      const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const timeMatch = block.match(/<time datetime="([^"]+)"/);
      const photoMatch = block.match(/<a class="tgme_widget_message_photo_wrap[^"]*"[^>]*>/);
      const videoMatch = block.match(/<video[^>]+src="([^"]+)"/);
      const videoPreviewMatch = block.match(/<a class="tgme_widget_message_video_wrap[^"]*"[^>]*>/);
      const durationMatch = block.match(/tgme_widget_message_video_duration[^>]*>([^<]+)</);

      if (!messageId || !href || !timeMatch) {
        return null;
      }

      const content = textMatch ? stripTelegramHtml(textMatch[1]) : '';

      const photoStyle = photoMatch ? extractAttribute(photoMatch[0], 'style') : null;
      const videoPreviewStyle = videoPreviewMatch ? extractAttribute(videoPreviewMatch[0], 'style') : null;
      const video = videoMatch?.[1] ?? null;
      const giveshareCover = extractGiveshareCoverUrl(block);
      const image = giveshareCover ?? extractStyleUrl(photoStyle) ?? extractStyleUrl(videoPreviewStyle);
      const sourceHref =
        extractHrefValues(block)
          .map(normalizeTelegramUrl)
          .find((url): url is string => {
            if (!url) {
              return false;
            }

            return isBroadcastSourceUrl(url);
          }) ?? null;
      const duration = durationMatch?.[1]?.trim() ?? null;
      const hasVideoPreview = Boolean(video || videoPreviewMatch || sourceHref);
      const titleSource = content || (hasVideoPreview ? 'Видео Gorilla Hockey' : 'Новость Gorilla Hockey');
      const excerptSource = content || (hasVideoPreview ? 'Видео из Telegram-канала Gorilla Hockey.' : 'Пост из Telegram-канала Gorilla Hockey.');

      return {
        id: `telegram-${messageId}`,
        messageId: Number(messageId),
        title: getTelegramTitle(titleSource),
        excerpt: getTelegramExcerpt(excerptSource),
        content: excerptSource,
        href,
        sourceHref,
        image,
        video,
        duration,
        mediaType: hasVideoPreview ? 'video' : image ? 'image' : 'text',
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

async function fetchTelegramPublicPage(before?: number) {
  const url = before ? `${TELEGRAM_PUBLIC_FEED_URL}?before=${before}` : TELEGRAM_PUBLIC_FEED_URL;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(TELEGRAM_FETCH_TIMEOUT_MS),
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Mozilla/5.0 GorillaHockeyHomepage/1.0',
    },
  });

  if (!response.ok) {
    return null;
  }

  return extractPublicTelegramFeed(await response.text());
}

async function fetchRemoteTelegramFeed() {
  const sourceUrl = process.env.GORILLA_TELEGRAM_FEED_URL;

  if (sourceUrl) {
    try {
      const response = await fetch(sourceUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(TELEGRAM_FETCH_TIMEOUT_MS),
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
    return await fetchTelegramPublicPage();
  } catch {
    return null;
  }
}

async function fetchTelegramVideoFeed() {
  const collected = new Map<string, RemoteTelegramNewsItem>();
  let before: number | undefined;

  for (let page = 0; page < TELEGRAM_VIDEO_PAGE_LIMIT; page += 1) {
    const items = await fetchTelegramPublicPage(before);

    if (!items || items.length === 0) {
      break;
    }

    for (const item of items) {
      if (item.video || item.sourceHref) {
        collected.set(item.id, item);
      }
    }

    const messageIds = items
      .map((item) => item.messageId)
      .filter((value): value is number => typeof value === 'number');
    const nextBefore = Math.min(...messageIds);

    if (!Number.isFinite(nextBefore) || nextBefore === before) {
      break;
    }

    before = nextBefore;
  }

  return Array.from(collected.values());
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
    .slice(0, 12)
    .map(normalizeFeedItem);
}

export async function getHomepageTelegramVideos() {
  const videos = await fetchTelegramVideoFeed();

  return videos
    .slice()
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
    )
    .map(normalizeFeedItem);
}
