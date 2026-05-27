'use client';

import { useState } from 'react';

import type { HomepageLiveStream, HomepageSchoolContent } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeLiveStreamsProps = {
  section: HomepageSchoolContent['liveStreams'];
};

const statusLabel = {
  upcoming: 'скоро',
  replay: 'запись',
};

function StreamViewer({
  stream,
  minimized,
  onClose,
  onMinimize,
  onRestore,
}: {
  stream: HomepageLiveStream;
  minimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
}) {
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[95] w-[min(92vw,24rem)] rounded-[1.4rem] border border-white/12 bg-[rgba(5,10,16,0.92)] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase text-white">{stream.title}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--gh-accent)]">
              {statusLabel[stream.status]} / {stream.date}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onRestore}
              className="rounded-full bg-[color:var(--gh-accent)] px-3 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-black"
            >
              Открыть
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[94] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md">
      <article className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(13,24,36,0.98),rgba(7,13,22,1))] shadow-[0_28px_90px_rgba(0,0,0,0.52)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--gh-accent)]">
              {statusLabel[stream.status]} / {stream.date}
            </p>
            <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">
              {stream.title}
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onMinimize}
              className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
            >
              Свернуть
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
            >
              Закрыть
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.75fr)]">
          <div className="flex aspect-video min-h-[18rem] items-center justify-center bg-black">
            <iframe
              src={stream.href}
              title={stream.title}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-sm leading-7 text-white/76">{stream.detail}</p>
            <a
              href={stream.href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full border border-white/12 bg-white/6 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/12"
            >
              Открыть источник
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export function HomeLiveStreams({ section }: HomeLiveStreamsProps) {
  const upcomingItems = section.items.filter((item) => item.status === 'upcoming');
  const replayItems = section.items.filter((item) => item.status === 'replay');
  const [activeStream, setActiveStream] = useState<HomepageLiveStream | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  function openStream(stream: HomepageLiveStream) {
    setActiveStream(stream);
    setIsMinimized(false);
  }

  function renderStreamCard(item: HomepageLiveStream) {
    return (
      <article
        key={`${item.title}-${item.date}`}
        className="home-ice-panel group flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-[2rem] p-5 transition hover:bg-[rgba(16,29,42,0.98)] sm:p-6"
      >
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--gh-accent)]">
              {statusLabel[item.status]}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--gh-muted)]">
              {item.date}
            </span>
          </div>

          <h3 className="mt-5 text-2xl font-black uppercase tracking-[-0.04em] text-[color:var(--gh-text)]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--gh-muted)]">
            {item.detail}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openStream(item)}
          className="mt-6 inline-flex w-fit rounded-full bg-[color:var(--gh-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:bg-[color:var(--gh-accent-hover)]"
        >
          {item.status === 'upcoming' ? 'Открыть эфир' : 'Смотреть запись'}
        </button>
      </article>
    );
  }

  return (
    <section id="live" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--gh-accent)]">
              Предстоящие
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {upcomingItems.map(renderStreamCard)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--gh-accent)]">
              Записи
            </p>
            <div className="mt-4 grid gap-4">
              {replayItems.map(renderStreamCard)}
            </div>
          </div>
        </div>
      </div>

      {activeStream ? (
        <StreamViewer
          stream={activeStream}
          minimized={isMinimized}
          onClose={() => setActiveStream(null)}
          onMinimize={() => setIsMinimized(true)}
          onRestore={() => setIsMinimized(false)}
        />
      ) : null}
    </section>
  );
}
