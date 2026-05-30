'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { HomepageSchoolContent } from '@/content/homepage-school';
import type { TelegramNewsItem } from '@/lib/telegram-news';

import { HomeSectionHeading } from './home-section-heading';

type HomeLiveStreamsProps = {
  section: HomepageSchoolContent['liveStreams'];
  feedItems: TelegramNewsItem[];
};

type MatchMediaItem = {
  id: string;
  title: string;
  date: string;
  href: string;
  sourceHref: string | null;
  detail: string;
  image: string | null;
  video: string | null;
  duration: string | null;
  status: 'live' | 'scheduled' | 'replay';
};

function getSafeTelegramMediaSrc(src: string | null) {
  if (!src) {
    return null;
  }

  try {
    const url = new URL(src);
    const isTelegramCdn = /^cdn\d*\.telesco\.pe$/i.test(url.hostname);

    if (url.protocol === 'https:' && isTelegramCdn && url.pathname.startsWith('/file/')) {
      return src;
    }
  } catch {
    return null;
  }

  return null;
}

function getPlayableVideoSrc(src: string | null) {
  if (!src) {
    return null;
  }

  try {
    const url = new URL(src);

    if (url.protocol !== 'https:') {
      return null;
    }

    return src;
  } catch {
    return null;
  }
}

function getVkEmbedUrl(src: string | null) {
  if (!src) {
    return null;
  }

  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    const directEmbed = url.pathname.includes('/video_ext.php');

    if (!host.includes('vk.com') && !host.includes('vkvideo.ru')) {
      return null;
    }

    if (directEmbed) {
      return src;
    }

    const match = `${url.pathname}${url.search}`.match(/video(-?\d+)_(\d+)/);

    if (!match) {
      return null;
    }

    return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
  } catch {
    return null;
  }
}

function getMatchMediaStatus(item: TelegramNewsItem): MatchMediaItem['status'] {
  const text = `${item.title} ${item.excerpt} ${item.content}`.toLowerCase();

  if (/(прям|эфир|live|трансляц|stream)/i.test(text)) {
    return 'live';
  }

  if (/(скоро|анонс|расписан|будет|завтра|сегодня)/i.test(text) && !item.video) {
    return 'scheduled';
  }

  return 'replay';
}

function isMatchMediaItem(item: TelegramNewsItem) {
  const hasPlayableMedia = Boolean(getVkEmbedUrl(item.sourceHref));

  if (!hasPlayableMedia) {
    return false;
  }

  const text = `${item.title} ${item.excerpt} ${item.content}`.toLowerCase();
  const matchPattern =
    /(матч|трансляц|эфир|запис|replay|live|stream|игр|игра|игры|лхл|тур|гол|шайб|против| vs |gorilla|hockey)/i;

  return (
    /(матч|трансляц|эфир|запис|запись матча|просмотр игры|replay|live|stream|игр|игра|игры|против| vs )/i.test(text) ||
    matchPattern.test(text)
  );
}

function getStatusLabel(status: MatchMediaItem['status']) {
  if (status === 'live') {
    return 'Эфир';
  }

  if (status === 'scheduled') {
    return 'Скоро';
  }

  return 'Запись';
}

function MatchMediaCard({ item, onOpen }: { item: MatchMediaItem; onOpen: () => void }) {
  const safeImage = getSafeTelegramMediaSrc(item.image);
  const playableVideo = getPlayableVideoSrc(item.video);
  const vkEmbed = getVkEmbedUrl(item.sourceHref);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-[min(86vw,31rem)] shrink-0 snap-start overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(10,18,28,0.9)] text-left shadow-[0_18px_54px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-white/18"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {safeImage ? (
          <Image
            src={safeImage}
            alt={item.title}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : playableVideo ? (
          <video
            src={playableVideo}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : vkEmbed ? (
          <iframe
            src={vkEmbed}
            title={item.title}
            className="pointer-events-none absolute inset-0 h-full w-full"
            tabIndex={-1}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(201,24,43,0.24),transparent_28%),linear-gradient(145deg,rgba(18,34,48,0.96),rgba(5,10,16,1))]" />
        )}
        <div className="absolute inset-0 bg-black/10 transition group-hover:bg-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-13 w-13 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/82 backdrop-blur-sm transition group-hover:scale-95 group-hover:opacity-70">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current">
            <path d="M8 5.75v12.5L18 12 8 5.75Z" />
          </svg>
        </span>
      </div>
      <div className="grid gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-accent)]">
            {getStatusLabel(item.status)}
          </p>
        </div>
        <h3 className="line-clamp-2 text-2xl font-black uppercase leading-tight tracking-[-0.05em] text-white">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-[color:var(--gh-muted)]">
          {item.detail}
        </p>
      </div>
    </button>
  );
}

function MatchMediaViewer({
  items,
  activeIndex,
  onClose,
  onSelect,
}: {
  items: MatchMediaItem[];
  activeIndex: number;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const item = items[activeIndex];
  const safeVideo = getPlayableVideoSrc(item.video);
  const safeImage = getSafeTelegramMediaSrc(item.image);
  const vkEmbed = getVkEmbedUrl(item.sourceHref);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function selectRelative(direction: -1 | 1) {
    onSelect((activeIndex + direction + items.length) % items.length);
  }

  return (
    <div
      className="fixed inset-0 z-[94] flex items-center justify-center bg-black/78 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <article
        className="grid max-h-[92dvh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,24,36,0.98),rgba(7,13,22,1))] shadow-[0_28px_90px_rgba(0,0,0,0.52)] lg:grid-cols-[minmax(0,1.25fr)_minmax(21rem,0.7fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex min-h-[22rem] items-center justify-center bg-black">
          {vkEmbed ? (
            <iframe
              src={vkEmbed}
              title={item.title}
              className="aspect-video h-full max-h-[92dvh] w-full"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : safeVideo ? (
            <video
              key={item.id}
              src={safeVideo}
              poster={safeImage ?? undefined}
              className="h-full max-h-[92dvh] w-full object-contain"
              controls
              playsInline
              autoPlay
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(201,24,43,0.28),transparent_28%),linear-gradient(150deg,rgba(18,34,48,0.96),rgba(5,10,16,1))]" />
          )}
          <button
            type="button"
            onClick={() => selectRelative(-1)}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/34 text-xl font-black text-white backdrop-blur transition hover:bg-white/12"
            aria-label="Предыдущее видео"
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => selectRelative(1)}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/34 text-xl font-black text-white backdrop-blur transition hover:bg-white/12"
            aria-label="Следующее видео"
          >
            {'>'}
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--gh-accent)]">
                {getStatusLabel(item.status)} / {item.date} / {item.duration ?? '--:--'}
              </p>
              <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                {item.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
            >
              Закрыть
            </button>
          </div>

          <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-white/76">
            {item.detail}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => selectRelative(1)}
              className="rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-[color:var(--gh-accent-hover)]"
            >
              Следующая запись
            </button>
            <a
              href={item.sourceHref ?? item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
            >
              Открыть источник
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export function HomeLiveStreams({ section, feedItems }: HomeLiveStreamsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const matchItems = useMemo(
    () =>
      feedItems
        .filter(isMatchMediaItem)
        .map((item): MatchMediaItem => ({
          id: item.id,
          title: item.title,
          date: item.dateLabel,
          href: item.href,
          sourceHref: item.sourceHref,
          detail: item.content,
          image: item.image,
          video: item.video,
          duration: item.duration,
          status: getMatchMediaStatus(item),
        })),
    [feedItems]
  );

  if (matchItems.length === 0) {
    return null;
  }

  function openMatch(index: number) {
    lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveIndex(index);
  }

  function closeMatch() {
    setActiveIndex(null);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }

  return (
    <section id="live" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="home-media-scroll mt-10 overflow-x-auto pb-4">
          <div className="flex gap-5">
            {matchItems.map((item, index) => (
              <MatchMediaCard
                key={item.id}
                item={item}
                onOpen={() => openMatch(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {activeIndex !== null ? (
        <MatchMediaViewer
          items={matchItems}
          activeIndex={activeIndex}
          onClose={closeMatch}
          onSelect={setActiveIndex}
        />
      ) : null}
    </section>
  );
}
