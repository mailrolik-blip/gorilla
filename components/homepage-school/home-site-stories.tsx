'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { TelegramNewsItem } from '@/lib/telegram-news';

type HomeSiteStoriesProps = {
  items: TelegramNewsItem[];
};

type SiteStoryItem = {
  id: string;
  title: string;
  date: string;
  href: string;
  text: string;
  image: string | null;
  video: string | null;
  mediaType: TelegramNewsItem['mediaType'];
  duration: string | null;
};

function isLocalImage(src: string | null) {
  return Boolean(src?.startsWith('/'));
}

function isRemoteImage(src: string | null) {
  if (!src) {
    return false;
  }

  try {
    const url = new URL(src);

    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSafeVideo(src: string | null) {
  if (!src) {
    return false;
  }

  try {
    const url = new URL(src);

    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function StoryMedia({
  story,
  priority = false,
  mode = 'cover',
}: {
  story: SiteStoryItem;
  priority?: boolean;
  mode?: 'cover' | 'contain';
}) {
  const objectClassName = mode === 'contain' ? 'object-contain' : 'object-cover';

  if (story.image && isLocalImage(story.image)) {
    return (
      <Image
        src={story.image}
        alt={story.title}
        fill
        priority={priority}
        className={objectClassName}
      />
    );
  }

  if (story.image && isRemoteImage(story.image)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={story.image} alt={story.title} className={`h-full w-full ${objectClassName}`} />;
  }

  if (story.video) {
    return (
      <video
        src={story.video}
        muted
        playsInline
        preload="metadata"
        className={`h-full w-full ${objectClassName}`}
      />
    );
  }

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(201,24,43,0.24),transparent_28%),linear-gradient(145deg,rgba(20,38,54,0.98),rgba(5,10,16,1))]" />
  );
}

function StoryViewerMedia({ story }: { story: SiteStoryItem }) {
  if (story.video && isSafeVideo(story.video)) {
    return (
      <video
        key={story.id}
        src={story.video}
        poster={story.image ?? undefined}
        className="h-full max-h-[92dvh] w-full object-contain"
        controls
        playsInline
        autoPlay
      />
    );
  }

  return <StoryMedia story={story} mode="contain" />;
}

function VideoStoryButton({
  story,
  index,
  onOpen,
}: {
  story: SiteStoryItem;
  index: number;
  onOpen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canPreview = isSafeVideo(story.video);

  function playPreview() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    void video.play();
  }

  function stopPreview() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
      onFocus={playPreview}
      onBlur={stopPreview}
      className="group relative h-[24rem] w-[min(66vw,14.5rem)] shrink-0 snap-start overflow-hidden rounded-[1.7rem] border border-white/10 bg-black text-left shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-white/18 focus:outline-none focus:ring-2 focus:ring-[color:var(--gh-accent)]"
    >
      <StoryMedia story={story} priority={index < 2} />
      {canPreview ? (
        <video
          ref={videoRef}
          src={story.video ?? undefined}
          poster={story.image ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 z-10 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100 group-focus:opacity-100"
        />
      ) : null}
      <div className="absolute inset-0 z-20 bg-black/10 transition group-hover:bg-black/0" />
      <span className="absolute left-1/2 top-1/2 z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/78 backdrop-blur-sm transition group-hover:scale-95 group-hover:opacity-0 group-focus:scale-95 group-focus:opacity-0">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
          <path d="M8 5.75v12.5L18 12 8 5.75Z" />
        </svg>
      </span>
      <div className="absolute inset-x-0 bottom-0 z-30 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.22))] p-4">
        <h2 className="line-clamp-2 text-sm font-black uppercase leading-tight tracking-[-0.02em] text-white">
          {story.title}
        </h2>
      </div>
    </button>
  );
}

function SiteStoryViewer({
  stories,
  activeIndex,
  onClose,
  onSelect,
}: {
  stories: SiteStoryItem[];
  activeIndex: number;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const story = stories[activeIndex];

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
    onSelect((activeIndex + direction + stories.length) % stories.length);
  }

  return (
    <div
      className="fixed inset-0 z-[92] flex items-center justify-center bg-black/76 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
      onClick={onClose}
    >
      <article
        className="grid max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,24,36,0.98),rgba(7,13,22,1))] shadow-[0_28px_90px_rgba(0,0,0,0.52)] lg:grid-cols-[minmax(0,0.82fr)_minmax(21rem,0.7fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex min-h-[28rem] items-center justify-center bg-black/72">
          <StoryViewerMedia story={story} />
          <button
            type="button"
            onClick={() => selectRelative(-1)}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/32 text-xl font-black text-white backdrop-blur transition hover:bg-white/12"
            aria-label="Предыдущая история"
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => selectRelative(1)}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/32 text-xl font-black text-white backdrop-blur transition hover:bg-white/12"
            aria-label="Следующая история"
          >
            {'>'}
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--gh-accent)]">
                {story.date} / {story.duration ?? '--:--'}
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                {story.title}
              </h2>
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
            {story.text}
          </p>
          <a
            href={story.href}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
          >
            Открыть в Telegram
          </a>
        </div>
      </article>
    </div>
  );
}

export function HomeSiteStories({ items }: HomeSiteStoriesProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const stories = useMemo(
    () =>
      items
        .filter((item) => item.mediaType === 'video' || item.video || item.sourceHref)
        .map((item): SiteStoryItem => ({
          id: item.id,
          title: item.title,
          date: item.dateLabel,
          href: item.href,
          text: item.content,
          image: item.image,
          video: item.video,
          mediaType: item.mediaType,
          duration: item.duration,
        })),
    [items]
  );

  function openStory(index: number) {
    lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveIndex(index);
  }

  function closeStory() {
    setActiveIndex(null);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <section
      id="stories"
      className="relative scroll-mt-28 overflow-hidden border-y border-white/8 bg-[linear-gradient(180deg,#061018_0%,rgba(8,22,35,0.98)_48%,#07131f_100%)] py-10 sm:py-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(93,214,255,0.16),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(201,24,43,0.13),transparent_22%)]" />
      <div className="home-media-scroll relative overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1480px] gap-3 sm:gap-4">
          {stories.map((story, index) => (
            <VideoStoryButton
              key={story.id}
              story={story}
              index={index}
              onOpen={() => openStory(index)}
            />
          ))}
        </div>
      </div>

      {activeIndex !== null ? (
        <SiteStoryViewer
          stories={stories}
          activeIndex={activeIndex}
          onClose={closeStory}
          onSelect={setActiveIndex}
        />
      ) : null}
    </section>
  );
}
