# Deploying GrammarNovaLearn — Neon + Render + Vercel

Stack:

- **Database** → Neon (serverless Postgres)
- **Backend** (NestJS API) → Render
- **Frontend** (Vite/React) → Vercel

Do the steps **in this order**. The frontend needs the backend URL, and the
backend needs the database URL and the frontend URL — so DB first, API second,
web last.

---

## 0. Prerequisites (one time)

1. Push the repo to **GitHub** (Render and Vercel both deploy from it):

   ```bash
   cd /path/to/grammartree
   git init
   git add .
   git commit -m "GrammarNovaLearn — ready for deploy"
   git branch -M main
   git remote add origin https://github.com/<you>/grammarnovalearn.git
   git push -u origin main
   ```

   Confirm no secrets were committed — `.env` files are gitignored; only
   `.env.example` should appear in the repo.

2. Have your **Gemini API key** ready (Google AI Studio → API keys).

3. Generate a strong JWT secret (32+ chars) and keep it somewhere safe:

   ```bash
   openssl rand -base64 48
   ```

---

## 1. Neon — database

1. Go to https://neon.tech → **New Project**. Pick a region close to where
   Render will run (e.g. AWS `eu-central-1` Frankfurt).
2. After it's created, open **Connect** and copy **two** connection strings:
   - **Pooled** — the host contains `-pooler`. This is your `DATABASE_URL`.
   - **Direct** — the same host **without** `-pooler`. This is your `DIRECT_URL`.
     (Toggle "Connection pooling" off, or use the "Direct connection" option.)
3. Make sure both end with `?sslmode=require`.

Keep both strings — you'll paste them into Render in the next step.

> Why two? The app uses the pooled URL at runtime (many short connections),
> while Prisma migrations use the direct URL (DDL needs a real session).

---

## 2. Render — backend API

The repo ships a **`render.yaml` blueprint**, so this is mostly one click.

1. Go to https://render.com → **New +** → **Blueprint**.
2. Connect your GitHub repo. Render detects `render.yaml` and proposes the
   `grammarnovalearn-api` web service (rootDir `backend`).
3. It will ask for the secret env vars (the ones marked "sync:false"). Fill in:

   | Key             | Value                                                        |
   | --------------- | ----------------------------------------------------------- |
   | `DATABASE_URL`  | Neon **pooled** string (`...-pooler...?sslmode=require`)     |
   | `DIRECT_URL`    | Neon **direct** string (no `-pooler`, `?sslmode=require`)    |
   | `JWT_SECRET`    | the 32+ char secret from step 0                             |
   | `GOOGLE_API_KEY`| your Gemini key                                             |
   | `FRONTEND_URL`  | leave a placeholder for now, e.g. `https://example.com` — you'll fix it in step 4 |

   `NODE_ENV`, `JWT_EXPIRY`, etc. are already set in the blueprint.

4. Click **Apply**. Render will:
   - `npm install --include=dev && npx prisma generate && npm run build`
   - on start: `npx prisma migrate deploy` (creates/updates tables) then
     `npm run start:prod` (free tier has no pre-deploy hook, so migrations run
     at start — idempotent, a no-op when nothing is pending)
   - health-check `GET /health`

5. When it goes green, note the service URL, e.g.
   `https://grammarnovalearn-api.onrender.com`. Test it:

   ```
   https://grammarnovalearn-api.onrender.com/health   →  {"status":"ok",...}
   ```

> **Free plan** spins the service down after ~15 min idle; the first request
> after that takes ~30–50s to wake. Upgrade to a paid instance for always-on.

### Seed the database (once)

Migrations create empty tables. To load topics/exercises, open the Render
service → **Shell** and run the seed(s) you need:

```bash
npm run seed          # core seed (admin/teacher + base data)
npm run seed:full     # full content set (if you use it)
```

(Seeds use `ts-node`, which is available because the build installs dev deps.)

---

## 3. Vercel — frontend

1. Go to https://vercel.com → **Add New** → **Project** → import the same repo.
2. **Root Directory**: set to **`frontend`**. Vercel reads `frontend/vercel.json`
   (framework Vite, build `npm run build`, output `dist`, SPA rewrites).
3. **Environment Variables** → add:

   | Key            | Value                                             |
   | -------------- | ------------------------------------------------- |
   | `VITE_API_URL` | your Render URL, e.g. `https://grammarnovalearn-api.onrender.com` (no trailing slash) |

4. **Deploy.** When done you get a URL like
   `https://grammarnovalearn.vercel.app`.

> `VITE_*` vars are baked in at build time. If you change `VITE_API_URL` later,
> you must **redeploy** the frontend.

---

## 4. Close the loop (CORS)

Now the backend needs to allow the real frontend origin:

1. Render → `grammarnovalearn-api` → **Environment** → set
   `FRONTEND_URL` = your Vercel URL (e.g. `https://grammarnovalearn.vercel.app`,
   **no trailing slash**).
2. Save → Render redeploys automatically.

Without this, the browser blocks API calls with a CORS error.

---

## 5. Smoke test (end-to-end)

1. Open the Vercel URL.
2. Register with an invite code (create one as a teacher/admin first, or via a
   seeded account), log in, take a test with the timer, run a knowledge check,
   check reviews. Watch the browser console/network tab for any red.
3. Toggle light/dark, resize to mobile.

If API calls fail, check in this order: `VITE_API_URL` correct & redeployed →
`FRONTEND_URL` matches exactly → Neon URLs valid → Render logs.

---

## Updating after launch

- **Code change** → `git push` → Render and Vercel auto-redeploy from `main`.
- **New DB migration** → commit the migration under `backend/prisma/migrations`;
  Render's pre-deploy `prisma migrate deploy` applies it on the next deploy.

## Notes / gotchas

- **Existing sessions are invalidated on first deploy of this version** —
  refresh tokens are now stored as SHA-256 hashes, so everyone must log in again.
  This is expected, not a bug.
- **Swagger `/docs` is disabled in production** (NODE_ENV=production).
- **R2 / TTS env vars** (`R2_*`, `TTS_VOICE`) are optional — only needed if you
  use speaking-audio storage. Add them in Render if so.
- **Region**: keep Neon and Render in the same region to minimise DB latency.
