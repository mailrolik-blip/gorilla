import Link from 'next/link';

import { PromoTicketWorkspace } from '@/components/promo-ticket-workspace';
import { PROMO_COMPLIANCE_NOTICE } from '@/lib/promo';

const promoSteps = [
  {
    title: '1. Получите билет',
    text: 'Промо-билет выдаётся в рамках акции или промо-условия, а не покупается как отдельный шанс.',
  },
  {
    title: '2. Откройте один раз',
    text: 'Пользователь открывает билет один раз и видит три серверно зафиксированных символа.',
  },
  {
    title: '3. Получите итог',
    text: 'Три одинаковых символа дают соответствующий приз. NO_WIN или несовпадение фиксируются как результат без приза.',
  },
];

export default function PromoTicketsPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_34%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur sm:p-8">
            <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
              Gorilla Promo
            </div>

            <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Промо-билеты внутри Gorilla
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-8 text-stone-300 sm:text-base">
                  Это продуктовый экран промо-механики, встроенный в платформу.
                  Билет не продаётся как отдельный шанс: пользователь получает его
                  по условиям акции, открывает один раз и видит зафиксированный
                  результат.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/cabinet"
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-black transition hover:bg-amber-300"
                  >
                    Перейти в кабинет
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/10"
                  >
                    На главную
                  </Link>
                </div>
              </div>

              <div className="grid gap-3">
                {promoSteps.map((step) => (
                  <article
                    key={step.title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-sm font-black text-white">{step.title}</div>
                    <p className="mt-2 text-sm leading-7 text-stone-300">{step.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-7 text-amber-100">
              {PROMO_COMPLIANCE_NOTICE}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <PromoTicketWorkspace />
      </section>
    </main>
  );
}
