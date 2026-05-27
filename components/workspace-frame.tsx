import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

type WorkspaceHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  asideLabel?: string;
  media?: ReactNode;
};

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  actions,
  meta,
  aside,
  asideLabel = 'Подробности',
  media,
}: WorkspaceHeroProps) {
  return (
    <header className="relative overflow-hidden rounded-[3rem] bg-[linear-gradient(150deg,#040507_0%,#091119_34%,#111b27_100%)] px-6 py-8 text-stone-100 shadow-[0_56px_150px_-78px_rgba(0,0,0,0.9)] ring-1 ring-white/6 sm:px-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_22%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.045),transparent_30%)]" />
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div
        className={`relative ${media ? 'grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] xl:items-stretch' : 'flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'}`}
      >
        <div className="flex min-w-0 flex-col justify-between">
          <div className="mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur transition hover:bg-white/[0.07]"
            >
              <Image
                src="/homepage-school/gorilla-logo-v2.png"
                alt="Gorilla Hockey"
                width={56}
                height={56}
                className="h-12 w-12 object-contain"
                priority={false}
              />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-white">
                  Gorilla Hockey
                </p>
                <p className="truncate text-[10px] uppercase tracking-[0.24em] text-stone-500">
                  хоккейный клуб
                </p>
              </div>
            </Link>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-300/90">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-[2.55rem] font-semibold tracking-[-0.06em] text-white sm:text-[3.25rem] lg:text-[4.25rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-300 sm:text-[15px] lg:text-[1.04rem] lg:leading-8">
            {description}
          </p>
          {meta ? <div className="mt-5">{meta}</div> : null}
          {(actions || aside) && !media ? (
            <div className="mt-6 flex w-full max-w-[29rem] flex-col gap-4 xl:items-start">
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
              {aside ? <WorkspaceDisclosure label={asideLabel}>{aside}</WorkspaceDisclosure> : null}
            </div>
          ) : null}
        </div>

        {media ? (
          <div className="flex min-h-[360px] min-w-0 flex-col gap-4">
            <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[2.5rem] bg-black/24 ring-1 ring-white/8">
              {media}
            </div>
            {(actions || aside) ? (
              <div className="grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)]">
                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
                {aside ? <WorkspaceDisclosure label={asideLabel}>{aside}</WorkspaceDisclosure> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function WorkspaceCanvas({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2.8rem] bg-[linear-gradient(180deg,rgba(7,10,14,0.98)_0%,rgba(5,7,10,0.99)_100%)] p-5 text-stone-100 shadow-[0_46px_120px_-74px_rgba(0,0,0,0.88)] ring-1 ring-white/5 sm:p-7 lg:p-8 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_16%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      <div className="relative">{children}</div>
    </section>
  );
}

export function WorkspaceInset({
  children,
  className = '',
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'accent' | 'muted';
}) {
  const toneClasses =
    tone === 'accent'
      ? 'bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(245,158,11,0.08))] text-stone-100 ring-1 ring-inset ring-amber-300/24'
      : tone === 'muted'
        ? 'bg-black/22 text-stone-300 ring-1 ring-inset ring-white/7'
        : 'bg-white/[0.03] text-stone-100 ring-1 ring-inset ring-white/7';

  return (
    <div
      className={`rounded-[1.8rem] px-4 py-4 backdrop-blur ${toneClasses} ${className}`}
    >
      {children}
    </div>
  );
}

export function WorkspaceDisclosure({
  label = 'Подробности',
  children,
  className = '',
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={`group rounded-[1.55rem] bg-black/24 ring-1 ring-inset ring-white/8 backdrop-blur ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-stone-200 marker:content-none">
        <span>{label}</span>
        <span className="text-xs uppercase tracking-[0.18em] text-stone-500 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t border-white/8 px-4 py-4 text-sm leading-6 text-stone-300">
        {children}
      </div>
    </details>
  );
}

export function WorkspaceScoreStrip({
  items,
  compact = false,
}: {
  items: Array<{
    label: string;
    value: string;
    detail?: string;
    accent?: 'default' | 'amber' | 'sky' | 'emerald';
  }>;
  compact?: boolean;
}) {
  return (
    <section className="border-y border-white/8 py-2">
      <div className="grid md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const accentClass =
            item.accent === 'amber'
              ? 'text-amber-300'
              : item.accent === 'sky'
                ? 'text-sky-300'
                : item.accent === 'emerald'
                  ? 'text-emerald-300'
                  : 'text-white';

          return (
            <article
              key={item.label}
              className="px-5 py-5 md:border-r md:border-white/8 md:last:border-r-0 xl:last:border-r-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                {item.label}
              </p>
              <p className={`mt-3 text-[2.05rem] font-semibold tracking-[-0.04em] ${accentClass}`}>
                {item.value}
              </p>
              {item.detail && !compact ? (
                <p className="mt-2 text-sm leading-6 text-stone-400">{item.detail}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function WorkspaceMetric({
  label,
  value,
  detail,
  accent = 'default',
}: {
  label: string;
  value: string;
  detail: string;
  accent?: 'default' | 'amber' | 'sky';
}) {
  const accentClasses =
    accent === 'amber'
      ? 'text-amber-300'
      : accent === 'sky'
        ? 'text-sky-300'
        : 'text-white';

  return (
    <article className="rounded-[1.5rem] border border-white/7 bg-black/20 px-4 py-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accentClasses}`}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-400">{detail}</p>
    </article>
  );
}
