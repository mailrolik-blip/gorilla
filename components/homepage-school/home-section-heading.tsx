import type { ReactNode } from 'react';

type HomeSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function HomeSectionHeading({
  eyebrow,
  title,
  description,
  action,
}: HomeSectionHeadingProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[color:var(--gh-accent)]">
          {eyebrow}
        </p>
        <h2 className="max-w-4xl text-4xl font-black uppercase tracking-[-0.04em] text-[color:var(--gh-text)] sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--gh-muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
