# Grammar Platform Backend

LMS для изучения английской грамматики IT студентами (B2 level).

## Stack

- **Framework:** NestJS
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **AI:** Google Gemini Flash
- **Auth:** JWT + bcryptjs

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (или Neon account)
- Google Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Setup .env
cp .env.example .env
# Заполнить DATABASE_URL и GOOGLE_API_KEY

# Generate Prisma client
npm run prisma:generate

# Migrate database
npm run prisma:migrate

# Seed: basic (Unit 1 only)
npm run seed

# Seed: full content — 18 units, 37 topics, ~150 exercises
npm run seed:full

# Start development server
npm run start:dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Auth

```
POST   /auth/register       Register new user (requires invite code)
POST   /auth/login          Login user
POST   /auth/refresh        Refresh tokens
GET    /auth/me             Get current user
```

### Topics

```
GET    /topics              List all topics (mastery % if authenticated)
GET    /topics/:slug        Get topic details
GET    /topics/:slug/audio  Get TTS audio (WAV) of readingText, cached in DB
```

### TTS

```
POST   /tts                 Synthesize arbitrary text → audio/wav
                            Body: { "text": "...", "voice": "Sulafat"? }
```

### Exercises

```
GET    /exercises?topicId=X Get exercises for topic
GET    /exercises/:id       Get single exercise
POST   /exercises           Create exercise (teacher only)
```

### Submissions

```
POST   /submissions         Submit exercise answer (AI feedback)
POST   /submissions/audio   Submit SPEAKING exercise (multipart: audio + exerciseId)
GET    /submissions         Get user's submissions
```

### Review (Spaced Repetition, SM-2)

```
GET    /review/queue        Exercises due for review (max 10)
GET    /review/stats        Due count, total tracked, next review date
```

### Teacher

```
GET    /teacher/students             Students with progress overview
GET    /teacher/students/:studentId  Detailed student progress
GET    /teacher/heatmap              Topic difficulty heatmap
POST   /teacher/assignments          Create assignment
GET    /teacher/assignments          List assignments
```

### Users

```
GET    /users/me            Get user profile
GET    /users/mastery       Get user's mastery %
GET    /users/students      List students (teacher only)
```

### Invites

```
POST   /invites/generate    Generate invite code (teacher only)
GET    /invites             Get teacher's invite codes
```

### Research / AI Platform (v2)

```
POST   /auth/logout              Invalidate refresh token
POST   /auth/change-password     Change password
POST   /auth/consent             Give/withdraw research consent
PATCH  /users/me                 Update profile (fullName)

GET    /me/progress              Own progress across all skills
GET    /me/submissions           Own history (paginated)
GET    /me/writing  /me/speaking Own writing/speaking history

POST   /exercises/generate       AI exercise generation (teacher)
GET    /teacher/exercises/pending      Validation queue
PATCH  /teacher/exercises/:id/validate { approve }
PATCH  /teacher/students/:id/group     { group: CONTROL|EXPERIMENTAL }
POST   /teacher/tests            Create pre/post test

GET    /writing/topic/:slug      Writing tasks
POST   /writing/submit           AI writing analysis (errors + indices + score)

POST   /reading/:slug/start      + /reading/sessions/:id/complete (WPM)
POST   /listening/:slug/start    + /listening/sessions/:id/complete

GET    /tests  /tests/:id        POST /tests/:id/start (no-retake for PRE/POST)
POST   /tests/attempts/:id/submit

GET    /adaptive/next?topicId    Next exercise matched to ability (Elo)

GET    /analytics/groups         CONTROL vs EXPERIMENTAL comparison (teacher)
GET    /analytics/errors         Error category × topic heatmap
GET    /analytics/curve/:userId  Learning curve
GET    /analytics/export         CSV export (consent-gated)

GET    /health                   DB healthcheck
GET    /docs                     Swagger UI
```

### Research design

- Студенты при регистрации распределяются round-robin в группы
  CONTROL (минимальный фидбек) / EXPERIMENTAL (метаязыковой AI-фидбек).
- Каждый сабмит пишет responseTimeMs, errorCategory, feedbackType + LearningEvent.
- `difficultyLogit` (-3..+3) и `abilityEstimate` (θ) питают Elo-адаптивность.
- CSV-экспорт включает только пользователей с согласием (consentGivenAt).

## Seed Data

После `npm run seed`:

- Teacher: `teacher@grammar.com` / `teacher123`
- Invite codes: `LEARN2024`, `STUDY2024`
- Topics: Unit 1 (Present Simple, Plural Nouns, Personality Adjectives)
- 3 exercises for Present Simple

## Environment Variables

See `.env.example`

## Testing

```bash
npm run test:e2e
```

Требует запущенную БД с примененным seed (invite code `LEARN2024`).

## Deployment

Render connected to GitHub repo. Push to main branch to deploy.

```bash
npm run build
npm run start:prod
```
