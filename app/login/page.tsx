'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, type FormEvent, useState } from 'react';

type LoginState = {
  identifier: string;
  password: string;
};

const initialLoginState: LoginState = {
  identifier: '',
  password: '',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialLoginState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextHref = searchParams?.get('next') || '/cabinet';
  const safeNextHref = nextHref.startsWith('/') && !nextHref.startsWith('//') ? nextHref : '/cabinet';

  function updateField<Field extends keyof LoginState>(field: Field, value: LoginState[Field]) {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error || 'Не удалось войти.');
        return;
      }

      router.replace(safeNextHref);
      router.refresh();
    } catch {
      setError('Не удалось войти. Проверьте соединение и попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2633_0%,#0d1218_38%,#06080b_100%)] px-4 py-8 text-stone-100">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl place-items-center">
        <div className="grid w-full gap-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_36px_110px_-70px_rgba(0,0,0,0.85)] backdrop-blur-xl md:grid-cols-[0.86fr_1fr] md:p-7">
          <div className="rounded-[1.45rem] bg-black/24 p-5 ring-1 ring-white/8">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
              Gorilla Hockey
            </Link>
            <h1 className="mt-5 text-[2.4rem] font-black uppercase leading-[0.95] tracking-[-0.06em] text-white">
              Вход в кабинет
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Войдите по почте или телефону, которые указали при регистрации. Dev-login не используется в публичном контуре.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.45rem] bg-black/18 p-5 ring-1 ring-white/8">
            <label className="grid gap-2 text-sm font-semibold text-stone-200">
              Почта или телефон
              <input
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                autoComplete="username"
                inputMode="email"
                value={form.identifier}
                onChange={(event) => updateField('identifier', event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-stone-200">
              Пароль
              <input
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-amber-300/60"
                autoComplete="current-password"
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
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
              {isSubmitting ? 'Входим...' : 'Войти'}
            </button>

            <p className="text-center text-sm text-stone-400">
              Нет аккаунта?{' '}
              <Link href="/register" className="font-bold text-amber-200 transition hover:text-amber-100">
                Зарегистрироваться
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2633_0%,#0d1218_38%,#06080b_100%)] px-4 py-8 text-stone-100">
          <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl place-items-center">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 text-sm text-stone-300">
              Загружаем форму входа...
            </div>
          </section>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
