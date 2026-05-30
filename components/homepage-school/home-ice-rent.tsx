import Image from 'next/image';
import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';

type HomeIceRentProps = {
  section: HomepageSchoolContent['iceRent'];
};

export function HomeIceRent({ section }: HomeIceRentProps) {
  return (
    <section id="rent" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[color:var(--gh-accent)]">
              {section.eyebrow}
            </p>
            <h2 className="max-w-4xl text-4xl font-black uppercase tracking-[-0.04em] text-[color:var(--gh-text)] sm:text-5xl">
              {section.title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--gh-muted)] sm:text-base">
              {section.description}
            </p>
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-6 xl:grid-cols-2">
          {section.items.map((venue) => (
            <article
              key={venue.title}
              className="home-ice-panel flex h-full flex-col overflow-hidden rounded-[1.8rem] p-4"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-black/40">
                <Image
                  src={venue.image}
                  alt={venue.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[color:var(--gh-accent)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-black">
                    {venue.city}
                  </span>
                  <span className="rounded-full border border-white/12 bg-black/38 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/82 backdrop-blur">
                    {venue.format}
                  </span>
                </div>
              </div>

              <div className="grid flex-1 gap-5 pt-5 lg:grid-cols-[minmax(0,1fr)_13rem]">
                <div className="flex min-w-0 flex-col">
                  <h3 className="text-2xl font-black uppercase leading-tight tracking-[-0.04em] text-[color:var(--gh-text)] sm:text-3xl">
                    {venue.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--gh-muted)]">
                    {venue.subtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {venue.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/72"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-5 grid gap-2 text-sm leading-6 text-[color:var(--gh-muted)]">
                    {venue.facts.map((fact) => (
                      <li key={fact} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  {venue.gallery.map((image, index) => (
                    <div
                      key={image}
                      className="relative min-h-28 overflow-hidden rounded-[1rem] bg-white/[0.04]"
                    >
                      <Image
                        src={image}
                        alt={`${venue.title}: фото ${index + 2}`}
                        fill
                        sizes="(max-width: 1024px) 45vw, 13rem"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)]">
                <div className="rounded-[1.25rem] bg-white/[0.05] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--gh-accent)]">
                    {venue.termsTitle}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-white/82">
                    {venue.terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ul>
                  {venue.contacts ? (
                    <div className="mt-4 border-t border-white/10 pt-3 text-sm leading-6 text-[color:var(--gh-muted)]">
                      {venue.contacts.map((contact) => (
                        <p key={contact}>{contact}</p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/48">
                      Адрес
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/84">
                      {venue.address}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={venue.primaryCta.href}
                      className="inline-flex flex-1 justify-center rounded-full bg-[color:var(--gh-accent)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {venue.primaryCta.label}
                    </Link>
                    <a
                      href={venue.secondaryCta.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 justify-center rounded-full border border-white/12 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gh-accent)]"
                    >
                      {venue.secondaryCta.label}
                    </a>
                    <a
                      href={venue.tertiaryCta.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full justify-center rounded-full border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/76 transition hover:border-[color:var(--gh-accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gh-accent)]"
                    >
                      {venue.tertiaryCta.label}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
