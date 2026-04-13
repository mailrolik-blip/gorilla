
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

## 5 Коммит Gorilla 0.4

1. Инициализация и стабильность проекта
- Настроен и запущен Next.js проект (TypeScript)
- Подключён Prisma ORM
- Подключена PostgreSQL база через Docker
- Проверена работоспособность локального dev-сервера

2. Работа с базой данных (Prisma)
Выполнено:
- Создана и стабилизирована Prisma schema
- Добавлены основные модели:
--User
--UserProfile
--Team
--TeamMember
--Session
--Booking
--SchoolTraining
--City

Добавлены enum:
- TeamRole
- TeamMemberStatus

Исправлено в процессе:
- устранены ошибки связей (relation errors)
- исправлены дублирующиеся модели/поля
- исправлены конфликты City model
- приведены связи Booking ↔ UserProfile ↔ Session ↔ Training

3. Миграции Prisma
- Выполнена первая миграция (init schema)
- Выполнена миграция исправления связей
- Выполнена миграция City модели
- Выполнена миграция корректировки relations
- Prisma Client успешно генерируется

4. API (Next.js)

Созданы и проверены базовые endpoints:

Users
- POST /api/users
- GET /api/users
Participants (UserProfile)
- POST /api/participants
- GET /api/participants
- PATCH /api/participants
Cities
- POST /api/city
- GET /api/city
Trainings
- POST /api/trainings
- GET /api/trainings
Booking (частично)
- создан endpoint /api/trainings/[id]/book
- реализована логика создания записи на тренировку

5. Проверка через Postman / API
- Проверены POST запросы к API
- Проверено создание пользователей
- Проверено создание тренировок
- Проверено создание участников
- Проверена работа Prisma Studio
- Исправлена проблема с частично пустыми данными при записи в БД

6. Исправления и отладка
- исправлены ошибки Prisma relation validation (P1012)
- исправлены ошибки duplicate fields в schema.prisma
- устранены ошибки миграций (P3018 rollback / sync issues)
- решена проблема EPERM при генерации Prisma Client (в процессе повторного запуска)

Итог состояния на конец дня

Backend полностью поднят и работает:

- база данных стабильна
- ORM настроен
- API endpoints функционируют
- основные сущности и связи определены
- система уже принимает и сохраняет реальные данные

Статус проекта

Backend MVP foundation — завершён (v0.1 stable)

## 6 Коммит Gorilla 0.5

Привели backend-контур в рабочее и стабильное состояние.

Что сделано:

- выровнены связи Prisma-моделей;
- стабилизирована архитектура бронирований тренировок;
- добавлена отдельная модель TrainingBooking;
- приведены в порядок связи City, UserProfile, Team, Session;
- донастроены API-роуты:
    - users
    - city
    - participants
    - teams
    - trainings
    - training-bookings
    - trainings/[id]/book
- из API-ответов убран passwordHash;
- вынесены безопасные select и общий booking-flow;
- Telegram-бот переведён на переменную окружения TELEGRAM_BOT_TOKEN.

Проверка:

- npx prisma validate — ok
- npx tsc --noEmit — ok
- npm run lint — ok
- npm run build — ok

Дополнительно:

- проверены живые GET/POST/PATCH запросы к основным endpoint’ам;
- повторное бронирование корректно возвращает 409;
- в локальной БД созданы smoke-test данные для проверки сценариев.

Итог:

- backend foundation стабилизирован;
- база и API готовы к следующему этапу — завершению пользовательского school-flow.

## 6.1 Gorilla 0.5.1

Закрыт базовый пользовательский school-flow без изменений схемы БД.

Что сделано:

- добавлен endpoint GET /api/my/training-bookings
- добавлен endpoint POST /api/training-bookings/[id]/cancel
- реализована ownership-логика: пользователь видит только свои бронирования и бронирования своих участников
- отмена своей записи меняет статус без физического удаления
- повторная отмена возвращает 409
- отмена чужой записи возвращает 404
- добавлен безопасный select для выдачи бронирований без приватных contact-данных
- добавлен helper текущего пользователя через заголовок x-user-id для dev-тестирования

Проверка:

- npx prisma validate — ok
- npx tsc --noEmit — ok
- npm run lint — ok
- npm run build — ok

Итог:

- пользовательский контур бронирований тренировок доведён до рабочего состояния
- backend готов к следующему этапу: team applications flow

## 6.2 Gorilla 0.5.2

Закрыт базовый team applications flow для MVP v1.

Что сделано:

- добавлен endpoint POST /api/teams/[id]/applications
- добавлен endpoint GET /api/my/team-applications
- добавлен endpoint POST /api/team-applications/[id]/cancel
- реализована ownership-логика:
    - пользователь может подать заявку только за своего участника
    - пользователь видит только свои заявки
    - пользователь может отменить только свою заявку
- реализована защита от дублей активных заявок в одну и ту же команду
- отмена заявки меняет статус без физического удаления

Проверка:

- создание своей заявки — ok
- попытка подать заявку за чужого participant — 404
- повторная активная заявка — 409
- /api/my/team-applications корректно фильтрует по пользователю
- отмена своей заявки — ok
- повторная отмена — 409
- отмена чужой заявки — 404

Итог:

- пользовательский team-flow доведён до рабочего состояния
- backend готов к следующему этапу: staff review flow для заявок в команду

## 6.3 Gorilla 0.5.3

Закрыт staff review flow для заявок в команду.

Что сделано:

- добавлен GET /api/coach/team-applications
- добавлен PATCH /api/coach/team-applications/[id]
- добавлено поле internalNote у TeamApplication
- добавлена staff-роль пользователя:
    - MANAGER
    - ADMIN
- расширены статусы review-flow:
    - IN_REVIEW
    - ACCEPTED
- выполнена миграция legacy-статуса:
    - APPROVED -> ACCEPTED
- реализованы safe select’ы:
    - user-facing без internalNote
    - staff-facing с internalNote
- реализовано разграничение доступа:
    - coach видит и меняет заявки только своих команд
    - manager/admin имеют расширенный доступ
    - обычный user не имеет доступа к staff-endpoints

Проверка:

- npx prisma validate — ok
- npx tsc --noEmit — ok
- npm run lint — ok
- npm run build — ok

Ручная проверка:

- coach видел только заявки своей команды
- coach не видел чужие заявки
- coach менял статус своей заявки — ok
- internalNote сохраняется — ok
- manager видел все заявки и менял чужие — ok
- обычный user получал 403 — ok

Итог:

- командный контур доведён до staff-level review
- school-flow и team-flow базово закрыты
- следующий этап: пользовательский rental flow

## 6.4 Gorilla 0.5.4

Закрыт базовый rental user flow для MVP v1.

Что сделано:

- добавлен минимальный rental-домен в Prisma:
    - RentalFacility
    - RentalResource
    - RentalSlot
    - RentalBooking
- добавлены endpoint’ы:
    - GET /api/public/rental-slots
    - POST /api/rental-slots/[id]/book
    - GET /api/my/rental-bookings
    - POST /api/rental-bookings/[id]/cancel
- реализованы safe select’ы для публичной выдачи и личных бронирований
- реализован ownership-check по participantId
- бронирование создаётся со статусом PENDING_CONFIRMATION
- при отмене бронь не удаляется физически, а переводится в CANCELLED
- после отмены слот возвращается в AVAILABLE

Проверка:

- npx prisma validate — ok
- npx tsc --noEmit — ok
- npm run lint — ok
- npm run build — ok

Ручная проверка:

- публичные rental-slots читаются — ok
- пользователь может создать бронь доступного слота — 201
- занятый слот возвращает — 409
- пользователь видит только свои rental bookings — ok
- пользователь может отменить только свою бронь — 200
- повторная отмена — 409
- отмена чужой брони — 404

Итог:

- пользовательский контур аренды доведён до рабочего состояния
- school-flow, team-flow и rental user-flow базово закрыты
- следующий этап: staff/admin flow для аренды

## 6.5 Gorilla 0.5.5

Закрыт staff/admin rental review flow для MVP v1.

Что сделано:

- добавлен endpoint GET /api/admin/rental-bookings
- добавлен endpoint PATCH /api/admin/rental-bookings/[id]
- добавлен staff-only helper проверки доступа для MANAGER / ADMIN
- добавлены поля:
    - RentalBooking.noteFromUser
    - RentalBooking.managerNote
- добавлен staff-facing select для rental bookings
- реализовано обновление статуса брони staff’ом:
    - PENDING_CONFIRMATION
    - CONFIRMED
    - CANCELLED
- синхронизирован RentalSlot.status при confirm/cancel
- POST /api/rental-slots/[id]/book теперь принимает noteFromUser

Проверка:

- npx prisma validate — ok
- npx tsc --noEmit — ok
- npm run lint — ok
- npm run build — ok

Ручная проверка:

- manager видит rental bookings — ok
- admin видит rental bookings — ok
- обычный user на /api/admin/rental-bookings* получает 403
- admin подтверждает бронь — ok
- manager отменяет бронь — ok
- managerNote сохраняется — ok
- повторная отмена даёт 409
- slot.status остаётся согласованным:
    - после confirm — BOOKED
    - после cancel — AVAILABLE

Итог:

- rental flow доведён до staff/admin уровня
- school-flow, team-flow и rental-flow базово закрыты
- следующий этап: базовый staff/admin CRUD для тренировок и командной операционки