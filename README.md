
# Gorilla Hockey

Контрольная точка разработки (MVP v1)
📌 Общая цель проекта

Разработка платформы для хоккейной школы/клуба с возможностями:

- запись на тренировки
- управление участниками (игроки, дети)
- команды и заявки в команды
- аренда льда
- дальнейшая интеграция с Telegram

Платформа для хоккейной школы. первым делом поднимаем локальный сервер и настраиваем гит проекта:

Локальный сервер стоит на базе [Next.js](https://nextjs.org). базовая документация представлена ниже:

<details>
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

</details>

## 1 Коммит localhost 0 + Tailwind + Docker + prisma 

содержит в себе установленные и подключенные на локальный хост сервисы. Создаем базы данных и настраиваем взаимосвязь между ними. 

⚙️ Текущий стек

- Next.js (App Router)
- TypeScript
- PostgreSQL (в Docker)
- Prisma ORM
- API через Next.js (/api/*)
- Thunder Client для тестирования

## 2 Коммит Gorilla 0.0 

Привели в порядок взаимосвязи и настроили миграцию таблиц

## 3 Коммит Gorilla 0.1

Итог по состоянию проекта

Создал базу данных:
команда в терминале npx prisma studio 
порт http://localhost:5555

<details>

🟢 User
- email / phone / telegramId
- passwordHash
- timestamps
- связь с профилями

🟢 UserProfile
- профили пользователей
- self-relation (parent/children)
- расширяемая модель

🟢 Team
- базовая сущность команды

🟢 TeamMember
- связь user ↔ team
- роли через enum TeamRole
- уникальность [userId, teamId]

🟢 UserProfile
- memberships теперь связывает пользователя с командами
- участники (игрок / ребёнок)

🟢 Session
- создали таблицу сессий (игровые матчи)

🟢 Booking
- создали таблицу тренировок (для школы)

⚠️ Частично есть рассинхрон архитектуры:

Booking привязан к User, а не к UserProfile (планируется исправление)

</details>

## 4 Коммит Gorilla 0.2

1. подключил демо бота в [телеграмме](https://t.me/gorillahockyebot) для регистрации на сайте
1.1 бот работает создает пользователя и выводит базу доступных тренировок

*КОМАНДЫ БОТА
Открой Telegram, найди своего бота и проверь, как он работает:

Напиши /start, чтобы увидеть приветственное сообщение.
Напиши /register, чтобы зарегистрироваться.
Попробуй /trainings, чтобы увидеть список доступных тренировок.
Попробуй /book [trainingId], чтобы забронировать тренировку.

2. исправление ошибок миграции и тестирования связи базы данных

## 4 Коммит Gorilla 0.3

🔌 API (реализовано)

Сделаны базовые endpoint'ы:

Users
- GET /api/users
- POST /api/users
Teams
- GET /api/teams
- POST /api/teams
Trainings
- GET /api/trainings
- POST /api/trainings

✔ данные успешно сохраняются в БД
✔ Prisma работает
✔ миграции применяются

🧪 Тестирование

- Используется Thunder Client (VS Code)
- POST/GET запросы работают
- Добавлен дебаг через console.log(req.body)
