'use client';

type WorkspaceSectionNavItem<T extends string> = {
  id: T;
  label: string;
  description?: string;
  badge?: string | number | null;
};

export function WorkspaceSectionNav<T extends string>({
  items,
  activeId,
  onChange,
  mode = 'row',
}: {
  items: WorkspaceSectionNavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  mode?: 'row' | 'rail';
}) {
  const isRail = mode === 'rail';

  return (
    <nav className="overflow-x-auto">
      <div
        className={`flex min-w-max gap-2 rounded-[1.75rem] bg-black/24 p-1.5 shadow-[0_24px_72px_-54px_rgba(0,0,0,0.8)] ring-1 ring-white/7 backdrop-blur ${
          isRail ? 'flex-col min-w-0' : 'flex-row'
        }`}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`group relative flex ${
                isRail ? 'w-full min-w-0' : 'min-w-[138px] flex-1 items-center sm:min-w-[160px]'
              } flex-col justify-center overflow-hidden rounded-[1.2rem] text-left transition ${
                isActive
                  ? isRail
                    ? 'bg-white/[0.08] text-white shadow-[0_18px_34px_-28px_rgba(0,0,0,0.72)]'
                    : 'bg-white text-black shadow-[0_16px_40px_-28px_rgba(255,255,255,0.42)]'
                  : 'bg-transparent text-stone-300 hover:bg-white/[0.045] hover:text-white'
              }`}
            >
              <span
                className={`absolute transition ${
                  isRail
                    ? `left-0 top-3 bottom-3 w-px ${isActive ? 'bg-amber-300' : 'bg-transparent group-hover:bg-white/14'}`
                    : `inset-x-5 bottom-0 h-px ${isActive ? 'bg-black/18' : 'bg-transparent group-hover:bg-white/12'}`
                }`}
              />
              <div
                className={`flex w-full items-center justify-between gap-3 ${
                  isRail ? 'px-4 py-4' : 'px-4 py-3.5'
                }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                {item.badge !== null && item.badge !== undefined ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                      isActive
                        ? isRail
                          ? 'bg-white/8 text-stone-100'
                          : 'bg-black/8 text-black'
                        : 'bg-white/8 text-stone-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {item.description && isRail ? (
                <span
                  className={`px-4 pb-4 text-xs leading-5 ${
                    isActive
                      ? isRail
                        ? 'text-stone-300'
                        : 'text-black/72'
                      : 'text-stone-400'
                  }`}
                >
                  {item.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
