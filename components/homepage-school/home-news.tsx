'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { useGorillaAccount } from '@/components/gorilla-account-provider';
import type { HomepageSchoolContent } from '@/content/homepage-school';
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

    if (url.protocol === 'https:' && /\.(avif|gif|jpe?g|png|webp)$/i.test(url.pathname)) {
      return src;
    }

    if (url.protocol === 'https:' && isTelegramCdn && url.pathname.startsWith('/file/')) {
      return src;
    }
  } catch {
    return null;
  }

  return null;
}

function NewsMedia({ src, alt, cover = false }: { src: string | null; alt: string; cover?: boolean }) {
  const [hasFailed, setHasFailed] = useState(false);
  const safeSrc = hasFailed ? null : getSafeNewsImageSrc(src);
  const objectClassName = cover ? 'object-cover' : 'object-contain';

  if (!safeSrc) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(201,24,43,0.22),transparent_28%),linear-gradient(135deg,rgba(18,34,48,0.96),rgba(5,10,16,1))]"
      />
    );
  }

  if (safeSrc.startsWith('/')) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 58vw, 100vw"
        className={objectClassName}
        onError={() => setHasFailed(true)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safeSrc}
      alt={alt}
      className={`absolute inset-0 h-full w-full ${objectClassName}`}
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
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const featureItem = newsItems[0] ?? null;
  const secondaryItems = useMemo(() => newsItems.slice(1, 3), [newsItems]);
  const gridItems = useMemo(() => newsItems.slice(3, 9), [newsItems]);
  const modalItem = modalIndex === null ? null : newsItems[modalIndex] ?? null;

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
        // Keep the server-rendered feed.
      }
    }

    const intervalId = window.setInterval(refreshNews, 60000);
    void refreshNews();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  function openModalRelative(direction: -1 | 1) {
    if (modalIndex === null || newsItems.length === 0) {
      return;
    }

    setModalIndex((modalIndex + direction + newsItems.length) % newsItems.length);
  }

  if (!featureItem) {
    return null;
  }

  return (
    <section id="news" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
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

        <div className="mt-10 border-y border-white/10 py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.75fr)]">
            <article className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.82fr)]">
              <button
                type="button"
                onClick={() => setModalIndex(0)}
                className="group relative min-h-[24rem] overflow-hidden bg-black/42 text-left"
              >
                <NewsMedia src={featureItem.image} alt={featureItem.title} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.18)_70%,rgba(0,0,0,0.42))]" />
                <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/34 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--gh-accent)] backdrop-blur">
                  Telegram
                </span>
              </button>

              <div className="flex flex-col justify-between border-white/10 lg:border-l lg:pl-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--gh-accent)]">
                    {featureItem.dateLabel}
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalIndex(0)}
                    className="mt-4 block text-left text-4xl font-black uppercase leading-none tracking-[-0.06em] text-[color:var(--gh-text)] transition hover:text-white sm:text-5xl"
                  >
                    {featureItem.title}
                  </button>
                  <p className="mt-5 line-clamp-8 text-base leading-8 text-[color:var(--gh-muted)]">
                    {featureItem.content}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setModalIndex(0)}
                    className="rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-[color:var(--gh-accent-hover)]"
                  >
                    Читать
                  </button>
                  <a
                    href={featureItem.href}
                    target="_blank"
                    rel="noreferrer"
                    className="home-ice-chip rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]"
                  >
                    Telegram
                  </a>
                </div>
              </div>
            </article>

            <div className="grid gap-5">
              {secondaryItems.map((item, index) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 border-b border-white/10 pb-5 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setModalIndex(index + 1)}
                    className="relative h-28 overflow-hidden bg-black/42"
                  >
                    <NewsMedia src={item.image} alt={item.title} cover />
                  </button>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-accent)]">
                      {item.dateLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalIndex(index + 1)}
                      className="mt-2 line-clamp-3 text-left text-xl font-black uppercase leading-tight tracking-[-0.04em] text-[color:var(--gh-text)] transition hover:text-white"
                    >
                      {item.title}
                    </button>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--gh-muted)]">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {gridItems.length > 0 ? (
            <div className="mt-8 grid gap-x-6 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-2 xl:grid-cols-3">
              {gridItems.map((item, index) => (
                <article key={item.id} className="grid gap-4">
                  <button
                    type="button"
                    onClick={() => setModalIndex(index + 3)}
                    className="relative aspect-[16/10] overflow-hidden bg-black/42"
                  >
                    <NewsMedia src={item.image} alt={item.title} cover />
                  </button>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--gh-accent)]">
                      {item.dateLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalIndex(index + 3)}
                      className="mt-2 line-clamp-3 text-left text-2xl font-black uppercase leading-tight tracking-[-0.05em] text-[color:var(--gh-text)] transition hover:text-white"
                    >
                      {item.title}
                    </button>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[color:var(--gh-muted)]">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {modalItem ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={modalItem.title}
          onClick={() => setModalIndex(null)}
        >
          <article
            className="relative flex max-h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,24,36,0.98),rgba(7,13,22,1))] shadow-[0_28px_90px_rgba(0,0,0,0.52)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[34dvh] min-h-[14rem] shrink-0 bg-black lg:h-auto lg:min-h-[90dvh]">
              <NewsMedia src={modalItem.image} alt={modalItem.title} />
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden">
              <div className="shrink-0 border-b border-white/10 bg-[rgba(10,18,28,0.94)] p-5 backdrop-blur sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--gh-accent)]">
                      {modalItem.dateLabel}
                    </p>
                    <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">
                      {modalItem.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalIndex(null)}
                    className="shrink-0 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
                  >
                    Закрыть
                  </button>
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
                <p className="whitespace-pre-line break-words text-base leading-8 text-white/78">
                  {modalItem.content}
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openModalRelative(-1)}
                      className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => openModalRelative(1)}
                      className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
                    >
                      Далее
                    </button>
                  </div>

                  <a
                    href={modalItem.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[color:var(--gh-accent)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-[color:var(--gh-accent-hover)]"
                  >
                    Открыть в Telegram
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
