import type { HomepageStatItem } from '@/content/homepage-school';

import { HomeSectionHeading } from './home-section-heading';

type HomeStatsProps = {
  items: HomepageStatItem[];
};

export function HomeStats({ items }: HomeStatsProps) {
  return (
    <section id="stats" className="scroll-mt-32 px-4 py-20 sm:px-6 lg:px-8">
      <div className="home-ice-section mx-auto max-w-[1480px] p-6 sm:p-8">
        <HomeSectionHeading
          eyebrow="Цифры о нас"
          title="Школа в цифрах"
          description="Коротко о том, как устроен ритм Gorilla Hockey."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <details
              key={item.label}
              className="home-ice-panel group rounded-[2rem] p-5 transition hover:bg-[rgba(16,29,42,0.96)]"
            >
              <summary className="list-none cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[3.2rem] font-black uppercase tracking-[-0.1em] text-[color:var(--gh-text)]">
                      {item.value}
                    </p>
                    <p className="text-base font-bold text-[color:var(--gh-text)]">{item.label}</p>
                  </div>
                  <span className="home-ice-chip rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--gh-muted)] transition group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>

              <div className="mt-5 border-t border-[color:var(--gh-border)] pt-5 text-sm leading-7 text-[color:var(--gh-muted)]">
                <p>{item.detail}</p>
                <a
                  href={item.href}
                  className="home-ice-chip mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition hover:bg-white/12"
                >
                  {item.cta}
                </a>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
