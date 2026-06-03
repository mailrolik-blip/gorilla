'use client';

import { useEffect, useState } from 'react';

import type { HomepageSchoolContent } from '@/content/homepage-school';
import type { TelegramNewsItem } from '@/lib/telegram-news';

import { HomeLiveStreams } from './home-live-streams';
import { HomeNews } from './home-news';
import { HomeSectionHeading } from './home-section-heading';
import { HomeSiteStories } from './home-site-stories';

type HomeMediaFeedProps = {
  news: HomepageSchoolContent['news'];
  liveStreams: HomepageSchoolContent['liveStreams'];
};

type FeedResponse = {
  items?: unknown[];
};

type FeedStatus = 'loading' | 'ready' | 'error';

function isTelegramNewsItem(value: unknown): value is TelegramNewsItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.excerpt === 'string' &&
    typeof item.content === 'string' &&
    typeof item.href === 'string' &&
    typeof item.publishedAt === 'string' &&
    typeof item.dateLabel === 'string'
  );
}

async function loadPublicFeed(path: string, signal: AbortSignal) {
  const response = await fetch(path, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as FeedResponse;
  const items = Array.isArray(payload.items) ? payload.items : [];

  return items.filter(isTelegramNewsItem);
}

function HomeMediaLoading() {
  return (
    <>
      <section
        id="stories"
        className="relative scroll-mt-28 overflow-hidden border-y border-white/8 bg-[linear-gradient(180deg,#061018_0%,rgba(8,22,35,0.98)_48%,#07131f_100%)] py-10 sm:py-12"
      >
        <div className="mx-auto flex max-w-[1480px] gap-3 overflow-hidden px-4 sm:gap-4 sm:px-6 lg:px-8">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[24rem] w-[min(66vw,14.5rem)] shrink-0 animate-pulse rounded-[1.7rem] border border-white/10 bg-white/[0.045]"
            />
          ))}
        </div>
      </section>

      <section id="news" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
            <div className="h-[24rem] animate-pulse rounded-[1.7rem] border border-white/10 bg-white/[0.045]" />
            <div className="grid gap-5">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-[1.2rem] border border-white/10 bg-white/[0.045]"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HomeMediaFallback({
  news,
  liveStreams,
  mode,
}: {
  news: HomepageSchoolContent['news'];
  liveStreams: HomepageSchoolContent['liveStreams'];
  mode: FeedStatus;
}) {
  return (
    <section id="news" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={news.eyebrow}
          title={news.title}
          description={
            mode === 'error'
              ? 'Лента Telegram сейчас недоступна. Главная остается рабочей, а свежие новости и записи можно открыть в канале клуба.'
              : news.description
          }
          action={
            <a
              href={news.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-black/24 px-5 py-3 text-xs font-bold uppercase text-[color:var(--gh-text)] transition hover:bg-white/10"
            >
              {news.ctaLabel}
            </a>
          }
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {liveStreams.items.map((item) => (
            <a
              key={`${item.title}-${item.date}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/16 hover:bg-white/[0.07]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-accent)]">
                {item.status === 'replay' ? 'Запись' : 'Скоро'} / {item.date}
              </p>
              <h3 className="mt-3 line-clamp-2 text-2xl font-black uppercase leading-tight tracking-[-0.05em] text-white">
                {item.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--gh-muted)]">
                {item.detail}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeStoriesFallback({ href }: { href: string }) {
  return (
    <section
      id="stories"
      className="relative scroll-mt-28 overflow-hidden border-y border-white/8 bg-[linear-gradient(180deg,#061018_0%,rgba(8,22,35,0.98)_48%,#07131f_100%)] py-10 sm:py-12"
    >
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/16 hover:bg-white/[0.07]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--gh-accent)]">
            Stories
          </p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-white">
            Видео-сторис временно не загрузились
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--gh-muted)]">
            Главная продолжает работать. Свежие ролики и записи доступны в Telegram-канале клуба.
          </p>
        </a>
      </div>
    </section>
  );
}

export function HomeMediaFeed({ news, liveStreams }: HomeMediaFeedProps) {
  const [status, setStatus] = useState<FeedStatus>('loading');
  const [newsItems, setNewsItems] = useState<TelegramNewsItem[]>([]);
  const [videoItems, setVideoItems] = useState<TelegramNewsItem[]>([]);
  const storyItems = videoItems.length > 0 ? videoItems : newsItems;
  const hasStoryItems = storyItems.some(
    (item) => item.mediaType === 'video' || Boolean(item.video || item.sourceHref)
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    async function loadMedia() {
      try {
        const [nextNewsItems, nextVideoItems] = await Promise.all([
          loadPublicFeed('/api/public/telegram-news', controller.signal),
          loadPublicFeed('/api/public/telegram-videos', controller.signal),
        ]);

        if (!cancelled) {
          setNewsItems(nextNewsItems);
          setVideoItems(nextVideoItems);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadMedia();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (status === 'loading') {
    return <HomeMediaLoading />;
  }

  if (newsItems.length === 0 && videoItems.length === 0) {
    return <HomeMediaFallback news={news} liveStreams={liveStreams} mode={status} />;
  }

  return (
    <>
      {hasStoryItems ? (
        <HomeSiteStories items={storyItems} />
      ) : (
        <HomeStoriesFallback href={news.ctaHref} />
      )}
      {newsItems.length > 0 ? (
        <HomeNews section={news} items={newsItems} />
      ) : (
        <HomeMediaFallback news={news} liveStreams={liveStreams} mode={status} />
      )}
      <HomeLiveStreams section={liveStreams} feedItems={videoItems} />
    </>
  );
}
