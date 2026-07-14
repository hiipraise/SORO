# SORO (Full-Stack)

SORO is a full-stack app with:
- **Backend**: FastAPI (REST API, JWT auth, MongoDB via Motor/Beanie, optional Redis + scheduler).
- **Frontend**: React + Vite (TypeScript), Zustand state management, TanStack Query, PWA support.

---

## Repository structure

- `backend/`
  - `app/main.py` — FastAPI app bootstrap, startup/shutdown (DB init, anchor seeding, scheduler)
  - `app/api/*` — API routers (auth, check-ins, anchors, circles, finance, community, journal, insights, settings, etc.)
  - `app/core/*` — configuration, database init, security helpers
  - `app/services/*` — AI, email, scheduler services
- `frontend/`
  - `src/` — React app, routes/pages, shared UI components, API client (`src/lib/api.ts`)
  - `index.html`, `vite.config.ts`

---

## Prerequisites

- Node.js (for frontend)
- Python 3.11 (for backend; pinned for deploys in `.python-version` and `backend/.python-version`)
- MongoDB running (local or hosted)
- (Optional) Redis (Upstash) for additional features
- (Optional) API keys for AI/email providers used by the backend

---

## Backend (FastAPI)

### 1) Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2) Configure environment variables
Create a `.env` file in `backend/` with values for the settings used in `backend/app/core/config.py`, for example:
- `APP_NAME` / `APP_VERSION` (optional; defaults exist in code)
- `CORS_ORIGINS` (comma-separated)
- `MONGO_URI`
- `DATABASE_NAME`
- `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`
- `REDIS_URL` (optional)
- `GROQ_API_KEY`, `GROQ_MODEL` (optional)
- `GEMINI_API_KEY` (optional)
- `SENDHIIV_API_KEY`, `SENDHIIV_URL` (optional)
- `SCHEDULER_ENABLED`, `DIGEST_DAY`, `DIGEST_HOUR`, `DIGEST_MINUTE`
- `CRISIS_NUMBER`, `CRISIS_ORGANIZATION`

> Note: the code loads `.env` automatically via pydantic-settings.

### 3) Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

### 4) Health check
- `GET /health`
  - Returns: `{ "status": "ok", "version": "<app_version>" }`

### API prefix
All routers are registered under:
- `/api/...`

### Auth (JWT Bearer)
Protected endpoints are expected to use:
- `Authorization: Bearer <token>`

The dependency `get_current_user_id()` extracts the `sub` claim from the JWT.

---

## Frontend (React + Vite)

### 1) Install dependencies
```bash
cd frontend
npm install
```

### 2) Configure environment variables
Create a `.env` file in `frontend/` (Vite). This typically includes the API base/proxy settings used by `src/lib/api.ts` (adjust to match your backend URL, commonly `http://localhost:8000`).

### 3) Run dev server
```bash
npm run dev
```

Frontend runs at:
- `http://localhost:3000` (or Vite’s default depending on config)

---

## Development notes

- **CORS** is enabled from `cfg.cors_origins` (defaults to localhost origins).
- Backend startup includes:
  - `init_db()` (database initialization)
  - `seed_anchors()` (initial data seeding)
  - scheduler start/stop based on `SCHEDULER_ENABLED`

---

## Build & quality

### Frontend
```bash
cd frontend
npm run lint
npm run build
```

---

## Docker (not included)
No Docker files were added in this repository snapshot; follow the run instructions above.

---

## License
Add your license information here.
