import Image from 'next/image';

import type { HomepageSchoolContent } from '@/content/homepage-school';

type HomeFooterProps = {
  footer: HomepageSchoolContent['footer'];
  site: HomepageSchoolContent['site'];
};

export function HomeFooter({ footer, site }: HomeFooterProps) {
  return (
    <footer className="px-4 pb-28 pt-16 sm:px-6 lg:px-8">
      <div className="home-ice-section-strong mx-auto max-w-[1480px] p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Image
                src={site.logoSrc}
                alt={site.logoAlt}
                width={84}
                height={44}
                className="h-auto w-[84px]"
              />
              <div>
                <p className="text-xl font-black uppercase tracking-[0.18em] text-[color:var(--gh-text)]">
                  {site.brand}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--gh-muted)]">
                  school / team / ice
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-[color:var(--gh-muted)] sm:text-base">
              {footer.blurb}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={site.telegramHref}
                target="_blank"
                rel="noreferrer"
                className="home-ice-chip rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
              >
                {site.telegramLabel}
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="home-ice-chip rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
              >
                {site.whatsappLabel}
              </a>
              <a
                href={site.phoneHref}
                className="home-ice-chip rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/12"
              >
                {site.phoneLabel}
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footer.groups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--gh-accent)]">
                  {group.title}
                </p>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <a
                      key={`${group.title}-${link.label}`}
                      href={link.href}
                      className="block text-sm font-semibold text-[color:var(--gh-muted)] transition hover:text-[color:var(--gh-text)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
