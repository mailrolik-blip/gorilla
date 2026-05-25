# Gorilla Hockey

Gorilla Hockey — это продукт для хоккейной школы и клубного контура. В одном проекте собраны пользовательский кабинет, staff/admin workspace, тренировки, команды, аренда и promo-билеты.

## Что это за проект

Платформа решает три основные задачи:

- даёт пользователю понятный кабинет для записей, участников, заявок, аренды и promo-билетов
- даёт staff и admin рабочую зону для управления командами, составом, тренировками, арендой и promo-модулем
- удерживает всё внутри одной продуктовой среды без отдельного «CRM-сайта» и разрозненных сценариев

## Стек

- Next.js 16.2.3
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Next.js API routes

## Основные разделы продукта

- `/` — главная страница Gorilla
- `/cabinet` — пользовательский кабинет
- `/admin` — staff/admin workspace
- `/promo-tickets` — отдельный экран promo-билетов
- `/dev/login` — dev-вход для локальной среды

## Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Подготовить переменные окружения:

```bash
copy .env.example .env
```

3. Поднять локальную базу данных и применить миграции.

Пример команды:

```bash
npx prisma migrate dev
```

4. При необходимости заполнить базу тестовыми данными:

```bash
npm run db:seed
```

5. Запустить dev-сервер:

```bash
npm run dev
```

## Production build

Проверка production-сборки:

```bash
npm run build
```

Запуск production-сервера после сборки:

```bash
npm run start
```

## Переменные окружения

Проект использует `.env` и `.env.example`.

Минимально важные переменные:

- `DATABASE_URL` — строка подключения к PostgreSQL
- `TELEGRAM_BOT_TOKEN` — токен Telegram-бота, если используется bot-flow

Секреты в репозиторий не коммитятся. Для локальной среды используйте `.env.example` как основу.

## Полезные команды

```bash
npx prisma validate
npx tsc --noEmit
npm run lint
npm run build
```

## Структура коммитов

Исторически в проекте используется короткий формат:

```text
Gorilla <версия>
Gorilla <версия> <короткий суффикс>
```

Для production UI/system итераций допустим формат:

```text
Gorilla 0.9.3 SP-Production
```

## Журнал изменений

<details>
<summary><strong>Gorilla 0.9.3 SP-Production</strong></summary>

- сокращён открытый текст на `/`, `/cabinet` и `/admin`
- вторичная информация убрана в disclosure/help вместо постоянных абзацев
- усилены primary actions в hero и active workspace зонах
- главная пересобрана как более action-oriented и visual-led экран с test visual blocks
- `/cabinet` и `/admin` дочищены до более короткого и понятного рабочего ритма
- promo user/staff модули упрощены по тексту и приведены к тому же UI language
- README полностью переписан на русском

</details>

<details>
<summary><strong>Gorilla 0.9.2</strong></summary>

- продукт переведён на тёмную основу
- собран общий shell для главной, кабинета и admin workspace
- внедрён promo-модуль в пользовательскую и staff-часть

</details>

<details>
<summary><strong>Gorilla 0.9.1</strong></summary>

- добавлены staff/user сценарии для promo-билетов
- собраны route-level workspace экраны `/cabinet`, `/admin`, `/promo-tickets`
- стабилизированы UI-first сценарии для локального MVP

</details>

<details>
<summary><strong>Gorilla 0.9.0</strong></summary>

- усилен продуктовый контур Gorilla как единой клубной платформы
- собраны пользовательский кабинет, staff/admin рабочая зона и promo-направление
- выровнены основные маршруты продукта и локальные dev-flows

</details>
