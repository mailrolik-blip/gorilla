import Image from 'next/image';
import Link from 'next/link';

import type { HomepageSchoolContent } from '@/content/homepage-school';

type HomeIceRentProps = {
  section: HomepageSchoolContent['iceRent'];
};

export function HomeIceRent({ section }: HomeIceRentProps) {
  return (
    <section id="rent" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="home-ice-section grid gap-6 overflow-hidden p-5 sm:p-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] xl:items-center">
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/40">
            <Image src={section.image} alt={section.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,16,0.04),rgba(8,12,16,0.52))]" />
          </div>

          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[color:var(--gh-accent)]">
              {section.eyebrow}
            </p>
            <h2 className="text-4xl font-black uppercase tracking-[-0.05em] text-[color:var(--gh-text)] sm:text-5xl">
              {section.title}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--gh-muted)] sm:text-base">
              {section.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={section.primaryCta.href}
                className="inline-flex rounded-full bg-[color:var(--gh-accent)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                {section.primaryCta.label}
              </Link>
              <a
                href={section.secondaryCta.href}
                className="home-ice-chip inline-flex rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
              >
                {section.secondaryCta.label}
              </a>
            </div>

            <details className="home-ice-panel-soft group rounded-[1.6rem] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--gh-text)]">
                Условия аренды
                <span className="text-[color:var(--gh-muted)] transition group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--gh-muted)]">
                {section.details.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gh-accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
