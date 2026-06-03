'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

type RegisterState = {
  parentFullName: string;
  phone: string;
  email: string;
  telegram: string;
  city: string;
  childFullName: string;
  birthYear: string;
  interestedFormat: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
};

const initialRegisterState: RegisterState = {
  parentFullName: '',
  phone: '',
  email: '',
  telegram: '',
  city: '',
  childFullName: '',
  birthYear: '',
  interestedFormat: '',
  password: '',
  confirmPassword: '',
  consent: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialRegisterState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Field extends keyof RegisterState>(
    field: Field,
    value: RegisterState[Field]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error || 'Не удалось создать аккаунт.');
        return;
      }

      router.replace('/cabinet');
      router.refresh();
    } catch {
      setError('Не удалось создать аккаунт. Проверьте соединение и попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2633_0%,#0d1218_38%,#06080b_100%)] px-4 py-8 text-stone-100">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl place-items-center">
        <div className="grid w-full gap-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_36px_110px_-70px_rgba(0,0,0,0.85)] backdrop-blur-xl lg:grid-cols-[0.7fr_1fr] lg:p-7">
          <div className="rounded-[1.45rem] bg-black/24 p-5 ring-1 ring-white/8">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
              Gorilla Hockey
            </Link>
            <h1 className="mt-5 text-[2.4rem] font-black uppercase leading-[0.95] tracking-[-0.06em] text-white">
              Регистрация семьи
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Создайте кабинет родителя и профиль ребёнка. После регистрации кабинет откроется сразу, а подтверждение доступа к тренировкам будет отображаться отдельным статусом.
            </p>
            <div className="mt-5 rounded-2xl border border-amber-300/18 bg-amber-300/8 p-4 text-sm leading-6 text-amber-50/86">
              Telegram можно указать для связи, но он больше не обязателен для входа.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.45rem] bg-black/18 p-5 ring-1 ring-white/8">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                ФИО родителя
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  autoComplete="name"
                  value={form.parentFullName}
                  onChange={(event) => updateField('parentFullName', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Телефон
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Email
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Telegram
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  placeholder="@username"
                  value={form.telegram}
                  onChange={(event) => updateField('telegram', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Город
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                ФИО ребёнка
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  value={form.childFullName}
                  onChange={(event) => updateField('childFullName', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Год рождения
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  inputMode="numeric"
                  placeholder="2018"
                  value={form.birthYear}
                  onChange={(event) => updateField('birthYear', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Интересующий формат
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  placeholder="Группа, индивидуально, команда"
                  value={form.interestedFormat}
                  onChange={(event) => updateField('interestedFormat', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Пароль
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  autoComplete="new-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-200">
                Повторите пароль
                <input
                  className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                  autoComplete="new-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                />
              </label>
            </div>

            <label className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-stone-300">
              <input
                className="mt-1 h-4 w-4 accent-amber-300"
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField('consent', event.target.checked)}
              />
              <span>Согласен на обработку данных для создания кабинета и связи по заявке.</span>
            </label>

            {error ? (
              <p className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-12 rounded-full bg-amber-300 px-5 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Создаём...' : 'Создать аккаунт'}
            </button>

            <p className="text-center text-sm text-stone-400">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="font-bold text-amber-200 transition hover:text-amber-100">
                Войти
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
