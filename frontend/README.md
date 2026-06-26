# Grammar Platform Frontend

React + Vite + Chakra UI v3 интерфейс для Grammar Platform.

## Stack

- React 19 + Vite + TypeScript (strict)
- Chakra UI v3
- TanStack Query (server state)
- Zustand (session)
- React Hook Form + Zod
- React Router 6
- Архитектура: **Feature-Sliced Design (FSD)**

## Структура (FSD)

```
src/
├── app/        # композиция: провайдеры, роутер
├── pages/      # страницы: login, register, dashboard, topic-detail, exercise-player, profile
├── widgets/    # app-header
├── features/   # auth (login/register), submit-answer (все типы ответов + запись голоса)
├── entities/   # session, topic, exercise, mastery
└── shared/     # api (axios), ui (FormField, ProgressBar), config (тема), lib
```

Правило импортов: слой может импортировать только нижележащие
(app → pages → widgets → features → entities → shared).

## Запуск

```bash
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev             # http://localhost:5173
```

Backend должен быть запущен (`cd ../backend && npm run start:dev`).

## Возможности

- Регистрация по инвайт-коду, JWT-сессия (persist в localStorage)
- Дашборд: темы по юнитам, mastery %, статистика, очередь повторения
- Страница темы: текст для чтения + TTS-озвучка (🔊 Listen)
- Плеер упражнений: 6 типов — multiple choice, fill-in-blank,
  true/false, matching, reorder, speaking (запись с микрофона → AI-оценка)
- AI-фидбек после каждого ответа
- Профиль: mastery по всем темам, точность

## Build

```bash
npm run build   # tsc + vite build → dist/
```
