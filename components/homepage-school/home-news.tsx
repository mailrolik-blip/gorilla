'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import type { HomepageSchoolContent } from '@/content/homepage-school';
import { useGorillaAccount } from '@/components/gorilla-account-provider';
import type { TelegramNewsItem } from '@/lib/telegram-news';

import { HomeSectionHeading } from './home-section-heading';

type HomeNewsProps = {
  section: HomepageSchoolContent['news'];
  items: TelegramNewsItem[];
};

function getSafeNewsImageSrc(src: string | null) {
  if (!src) {
    return null;
  }

  if (src.startsWith('/')) {
    return src;
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

function NewsImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [hasFailed, setHasFailed] = useState(false);
  const safeSrc = hasFailed ? null : getSafeNewsImageSrc(src);

  if (!safeSrc) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(201,24,43,0.24),transparent_28%),linear-gradient(135deg,rgba(18,34,48,0.96),rgba(5,10,16,1))]"
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill
      unoptimized={safeSrc.startsWith('https://')}
      className={className}
      onError={() => setHasFailed(true)}
    />
  );
}

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

function normalizePolledNews(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { items?: unknown[] }).items) &&
    (payload as { items: unknown[] }).items.every(isTelegramNewsItem)
  ) {
    return (payload as { items: TelegramNewsItem[] }).items;
  }

  return null;
}

export function HomeNews({ section, items }: HomeNewsProps) {
  const { announceNews } = useGorillaAccount();
  const [newsItems, setNewsItems] = useState(items);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : newsItems[activeIndex] ?? null;

  useEffect(() => {
    if (!newsItems[0]) {
      return;
    }

    announceNews({
      id: newsItems[0].id,
      title: newsItems[0].title,
      href: '#news',
    });
  }, [announceNews, newsItems]);

  useEffect(() => {
    let cancelled = false;

    async function refreshNews() {
      try {
        const response = await fetch('/api/public/telegram-news', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as unknown;
        const nextItems = normalizePolledNews(payload);

        if (!cancelled && nextItems && nextItems.length > 0) {
          setNewsItems(nextItems);
        }
      } catch {
        // Keep the current server-rendered feed.
      }
    }

    const intervalId = window.setInterval(refreshNews, 60000);
    void refreshNews();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  function openNext(direction: -1 | 1) {
    if (activeIndex === null) {
      return;
    }

    const nextIndex = activeIndex + direction;

    if (nextIndex >= 0 && nextIndex < newsItems.length) {
      setActiveIndex(nextIndex);
    }
  }

  return (
    <section id="news" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section-soft mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          action={
            <a
              href={section.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-black/24 px-5 py-3 text-xs font-bold uppercase text-[color:var(--gh-text)] transition hover:bg-white/10"
            >
              {section.ctaLabel}
            </a>
          }
        />

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {newsItems.slice(0, 3).map((item, index) => (
            <article
              key={item.id}
              className={`home-ice-panel overflow-hidden rounded-[2.1rem] ${index === 1 ? 'xl:translate-y-6' : ''}`}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group block w-full text-left"
              >
                <div className="relative min-h-[220px] overflow-hidden">
                  <NewsImage
                    src={item.image}
                    alt={item.title}
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.06),rgba(6,10,14,0.78)_72%,rgba(6,10,14,0.96))]" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/26 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--gh-accent)]">
                    Telegram
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--gh-muted)]">
                      {item.dateLabel}
                    </p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60">
                      клуб
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[1.65rem] font-black leading-tight tracking-[-0.04em] text-[color:var(--gh-text)]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-[color:var(--gh-muted)]">
                      {item.excerpt}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[color:var(--gh-text)] transition group-hover:text-[color:var(--gh-accent)]">
                    Читать на сайте
                    <span aria-hidden="true">{'>'}</span>
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setActiveIndex(null)}
        >
          <article
            className="relative max-h-[90dvh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,24,36,0.98),rgba(7,13,22,1))] shadow-[0_28px_90px_rgba(0,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-56 overflow-hidden sm:h-72">
              <NewsImage
                src={activeItem.image}
                alt={activeItem.title}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.08),rgba(6,10,14,0.9))]" />
            </div>

            <div className="max-h-[calc(90dvh-14rem)] overflow-y-auto p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--gh-accent)]">
                    {activeItem.dateLabel}
                  </p>
                  <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                    {activeItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="shrink-0 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
                >
                  Закрыть
                </button>
              </div>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-white/78">
                {activeItem.content}
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openNext(-1)}
                    disabled={activeIndex === 0}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={() => openNext(1)}
                    disabled={activeIndex === newsItems.length - 1}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Далее
                  </button>
                </div>

                <a
                  href={activeItem.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[color:var(--gh-accent)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-[color:var(--gh-accent-hover)]"
                >
                  Открыть в Telegram
                </a>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
