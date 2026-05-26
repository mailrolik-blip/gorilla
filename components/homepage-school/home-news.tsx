'use client';

import { useEffect, useEffectEvent } from 'react';
import Image from 'next/image';

import type { HomepageSchoolContent } from '@/content/homepage-school';
import { useGorillaAccount } from '@/components/gorilla-account-provider';
import type { TelegramNewsItem } from '@/lib/telegram-news';

import { HomeSectionHeading } from './home-section-heading';

type HomeNewsProps = {
  section: HomepageSchoolContent['news'];
  items: TelegramNewsItem[];
};

export function HomeNews({ section, items }: HomeNewsProps) {
  const { announceNews } = useGorillaAccount();
  const announceLatestNews = useEffectEvent((latestNews: TelegramNewsItem) => {
    announceNews({
      id: latestNews.id,
      title: latestNews.title,
      href: latestNews.href,
    });
  });

  useEffect(() => {
    if (!items[0]) {
      return;
    }

    announceLatestNews(items[0]);
  }, [items]);

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
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
            >
              {section.ctaLabel}
            </a>
          }
        />

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.id}
              className={`home-ice-panel overflow-hidden rounded-[2.1rem] ${index === 1 ? 'xl:translate-y-6' : ''}`}
            >
              <div className="relative min-h-[220px] overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.06),rgba(6,10,14,0.78)_72%,rgba(6,10,14,0.96))]" />
                <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/26 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--gh-accent)]">
                  Telegram
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-muted)]">
                    {item.dateLabel}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Канал школы
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[1.65rem] font-black leading-tight tracking-[-0.05em] text-[color:var(--gh-text)]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-7 text-[color:var(--gh-muted)]">
                    {item.excerpt}
                  </p>
                </div>

                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--gh-text)] transition hover:text-[color:var(--gh-accent)]"
                >
                  Открыть пост
                  <span aria-hidden="true">{'>'}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
