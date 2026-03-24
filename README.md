# Kindred

Full-stack web application that matches users based on cinematic preferences using vector similarity search. Users rank films in tier lists; the system extracts feature vectors from these rankings and computes taste compatibility via cosine similarity on PostgreSQL with the `pgvector` extension.

**Live demo:** [kindred.up.railway.app](https://kindred.up.railway.app)

## System Overview

Kindred operates on a simple premise: users complete tier lists (S through F rankings) for curated movie collections. Each ranking generates a 256-dimensional profile vector encoding preferences across genres, decades, and directors. The system then finds other users with similar vectors using approximate nearest neighbor search.

The term "Kin" refers to users with high cosine similarity scores—people whose cinematic preferences align closely with yours, even if they haven't ranked the same films.

<div align="center">
  <img src="./demo.gif" alt="Kindred App Demo" width="100%">
  <p><i>A short overview of the core interface and functionality.</i></p>
</div>

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              Frontend                               │
│  React 19 + TypeScript + TanStack Query + Tailwind CSS + Vite       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ TierList    │ │ Kin Page    │ │ Messages    │ │ Notifications │  │
│  │ (DnD/Tap)   │ │ (Filters)   │ │ (CRUD)      │ │ (Polling)     │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP (REST API)
┌────────────────────────────┴────────────────────────────────────────┐
│                              Backend                                │
│  Express 5 + TypeScript + node-pg                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ Auth        │ │ Tierlist    │ │ Kin         │ │ Vector        │  │
│  │ Service     │ │ Service     │ │ Service     │ │ Service       │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────────┐│
│  │ Message     │ │ Connection  │ │ TMDB Sync Job (node-cron)      ││
│  │ Service     │ │ Service     │ │ Interval (SYNC_INTERVAL_MINUTES)│
│  └─────────────┘ └─────────────┘ └─────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────────────┘
                             │ PostgreSQL Protocol
┌────────────────────────────┴────────────────────────────────────────┐
│                              Database                               │
│  PostgreSQL 16 + pgvector                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ users       │ │ movies      │ │ user_       │ │ tierlist_     │  │
│  │ (vector256) │ │ (tmdb_id)   │ │ rankings    │ │ templates     │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ messages    │ │ user_       │ │ connection_ │ │ notifications │  │
│  │             │ │ connections │ │ requests    │ │               │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture (Docker Compose)

```yaml
services:
  db: pgvector/pgvector:pg16 # Port 5432
  backend: Node.js 20 # Port 5000
  frontend: Nginx (static + reverse proxy) # Port 80
```

Frontend serves static files and proxies `/api` requests to the backend container.

## Core Algorithm: Profile Vector Calculation

### Feature Map Structure (256 dimensions)

| Index Range | Feature Type | Count |
| ----------- | ------------ | ----- |
| 0–18        | Genres       | 19    |
| 19–29       | Decades      | 11    |
| 30–255      | Directors    | 226   |

### Write Path (Vector Generation)

When a user saves a tier list ranking:

1. **Fetch all ranked items** for the user across all tier lists
2. **Map tiers to weights**: S=+3, A=+2, B=+1, C=0, D=-1, F=-2
3. **Aggregate by feature**: Sum weights for each genre/decade/director
4. **Apply Bayesian dampening** to prevent low-count bias:

```
affinity[i] = total_score[i] / (k + count[i])
```

Where `k=4` (dampening factor, see `k_DAMPENING_FACTOR` in `backend/services/featureMap.ts`). This shrinks scores toward zero when sample size is small.

5. **Persist** the 256-dimension vector to `users.profile_vector`

### Read Path (Similarity Search)

Cosine distance from pgvector’s `<=>` is in **[0, 2]** (0 = identical direction, 1 = orthogonal, 2 = opposite). The Kin service maps that to a **[0, 1] affinity** where **0.5 = neutral (50%)**, **1 = 100% match**, **0 = 0% (opposite)**:

```text
affinity = ((1 - cosine_distance) + 1) / 2
```

List query (simplified):

```sql
SELECT
  other.id,
  other.username,
  ((1 - (other.profile_vector <=> current_user.profile_vector)) + 1) / 2 AS similarity_score
FROM users other
WHERE other.id != $current_user_id
  AND other.profile_vector IS NOT NULL
ORDER BY similarity_score DESC
LIMIT $limit OFFSET $offset
```

**Note:** Using only `GREATEST(0, 1 - distance)` is wrong for this operator: for distances above 1 it clamps everything to **0**, which made the UI look like “0%” for many pairs.

### Segment-Based Comparison

Users can filter by feature category. Slices use **1-based** PostgreSQL subscripts (JS feature index `i` → SQL subscript `i + 1`):

```sql
-- Genre only (JS dims 0–18 → SQL [1:19])
((other.profile_vector::real[])[1:19])::vector <=>
((current.profile_vector::real[])[1:19])::vector
```

The Kin cards show **five qualitative labels** derived on the client from the numeric affinity (with rough score bands); see `frontend/src/features/kin/kinClassification.ts`.

## Technology Stack

### Backend

| Component        | Technology              | Purpose                          |
| ---------------- | ----------------------- | -------------------------------- |
| Runtime          | Node.js 20              | JavaScript execution             |
| Framework        | Express 5               | HTTP routing, middleware         |
| Language         | TypeScript              | Type safety                      |
| Database Driver  | node-postgres (pg)      | PostgreSQL connection pool       |
| Auth             | jsonwebtoken + bcryptjs | JWT generation, password hashing |
| Scheduling       | node-cron               | TMDB sync job                    |
| Validation       | validator.js            | Input sanitization               |
| Profanity Filter | bad-words               | Content moderation               |

### Frontend

| Component    | Technology        | Purpose                        |
| ------------ | ----------------- | ------------------------------ |
| Framework    | React 19          | UI components                  |
| Build Tool   | Vite 7 + SWC      | Fast HMR, production builds    |
| Language     | TypeScript        | Type safety                    |
| Styling      | Tailwind CSS 4    | Utility-first CSS              |
| Server State | TanStack Query 5  | Caching, pagination, mutations |
| Routing      | React Router 7    | Client-side navigation         |
| Drag & Drop  | @hello-pangea/dnd | Tier list reordering           |

### Database

| Component | Technology    | Purpose                              |
| --------- | ------------- | ------------------------------------ |
| RDBMS     | PostgreSQL 16 | Relational data storage              |
| Extension | pgvector      | Vector storage, similarity operators |

### External Services

| Service  | Purpose                                             |
| -------- | --------------------------------------------------- |
| TMDB API | Movie metadata (titles, posters, genres, directors) |

## Key Features

### Dual-Mode Tier List Interface

The tier list component detects viewport width via `useMediaQuery`:

- **Desktop (≥768px)**: Drag-and-drop interface using `@hello-pangea/dnd`
- **Mobile (<768px)**: Tap-to-rank modal interface

Users can override this with manual mode selection.

### Authentication

- JWT stored in an `httpOnly` cookie named `token` (reduces XSS token theft).
- Token expiry: `JWT_EXPIRY` (default `1h`); cookie lifetime: `COOKIE_MAX_AGE` in `authConfig` (72h).
- Password hashing: bcrypt (`SALT_ROUNDS` 10 in `authService`).

**Session cookie policy** (`backend/utils/tokenUtils.ts`):

- **Default (same-site / typical dev):** `SameSite=Lax`, `Secure` only when `NODE_ENV=production`. This works for a Vite dev server and API on different **ports** of `localhost` (still the same site for cookies). Using `SameSite=None` without `Secure` in dev caused browsers to **drop** the cookie, so `/user/me` failed while the login JSON body still returned a user—confusing UI state.
- **True cross-site SPA + API** (different hostnames, HTTPS): set backend `CROSS_SITE_COOKIES` to a truthy value (`true`, `TRUE`, `1`, `yes`) → `SameSite=None; Secure`. The code previously only treated lowercase `true` as enabled, so values like `TRUE` from Railway left `SameSite=Lax` on and browsers **rejected** `Set-Cookie` for cross-origin XHR—symptoms: DevTools “cookie rejected because cross-site”, `401` / “Invalid or expired token” on protected routes because no cookie was stored.
- **`FRONTEND_URL` must match the SPA origin** (scheme + host + port) for `Access-Control-Allow-Origin` with credentials. You can pass **comma-separated** origins (e.g. prod + preview). Trailing slashes in env are normalized; the browser’s `Origin` header never includes a path.

**API responses:** `POST /api/auth/login` and `POST /api/auth/register` return `{ user: { id, username }, token }`. The frontend must use **`response.data.user`** for context state (not the whole `data` object). New accounts keep `profile_vector` **NULL** until the first tier list save; registration does not write an all-zero vector.

**`/api/user/me`:** If the JWT `id` has no matching row (e.g. DB reset), the API responds with **401** and a session-invalid message so clients treat it like a logged-out session (previously **404** “User not found”, which was easy to misread as a generic Axios error).

**Frontend shell:** Do not wrap the app in providers that call `useAuth()` *above* `AuthProvider` (see `frontend/src/main.tsx`). `TmdbConfigProvider` belongs **inside** `AuthProvider`.

**Redirects:** After a protected redirect to login, `state.from` is a **path string** (`pathname` + `search` + `hash`), not a full `Location` object, so post-login navigation stays reliable.

### Direct messages

Conversation bubbles treat a row as “sent” when **`Number(sender_id) === Number(currentUser.id)`**. Strict `===` between a string id (e.g. from some JWT payloads) and a numeric `sender_id` from the API previously marked every bubble as received.

### Connection System

Users can:

1. Send connection requests (creates `connection_request` row)
2. Accept incoming requests (deletes request, creates `user_connections` row)
3. Block users (cascades: removes connections, requests; creates `user_blocks` row)

Connection state machine:

```
not_connected → pending_from_user (sent request)
              → pending_from_target (received request)
              → connected (mutual)
              → blocked (one-way or mutual)
```

### Notification System

Event-driven notifications for:

- `kin_request`: Someone sent a connection request
- `kin_accepted`: Your request was accepted
- `new_message`: New message received

Notifications are polled client-side. Read status is updated atomically when fetched.

### TMDB Integration

**Initial Sync** (seed script):

- Fetches movies by director ID from TMDB
- Extracts genres, release years, poster paths
- Builds `vw_movie_features` view for efficient vector calculation

**Scheduled Sync** (cron job, interval in minutes via `SYNC_INTERVAL_MINUTES`, default 1440):

1. Calls TMDB `/movie/changes` to get IDs modified since last run
2. Filters to only locally-stored movies
3. Updates `title`, `poster_path`, `updated_at` for changed records
4. Refreshes TMDB image configuration (stored in `tmdb_config`)

## Data Model

### Core Tables

```
users
├── id (serial)
├── username (unique)
├── email (unique)
├── password_hash
├── profile_vector (vector(256))
└── created_at

tmdb_config
├── id (1) — singleton row
├── base_url, secure_base_url, poster_sizes
└── updated_at

job_sync_log
├── job_name (pk)
├── last_run_at, type (status_type), metadata (jsonb)
└── — used by TMDB sync job

directors
├── id (pk, TMDB person id)
└── name

genres
├── id (pk, TMDB genre id)
└── name (unique)

movies
├── id (serial)
├── tmdb_id (unique)
├── title, release_year, director_id (fk)
├── poster_path, updated_at
└── decade (generated stored)

movie_genres (junction)
├── movie_id (fk), genre_id (fk)
└── PRIMARY KEY (movie_id, genre_id)

tierlist_templates
├── id (serial)
├── title (unique), description
└── created_at

template_movies (junction)
├── template_id (fk), movie_id (fk)
└── PRIMARY KEY (template_id, movie_id)

user_rankings
├── id (serial)
├── user_id (fk), template_id (fk)
├── created_at, updated_at
└── UNIQUE(user_id, template_id)

ranked_items
├── id (serial)
├── ranking_id (fk), movie_id (fk)
└── tier (0-5, maps to S-F)
```

### Social Tables

```
connection_request
├── sender_id (fk), receiver_id (fk)
└── created_at, PRIMARY KEY (sender_id, receiver_id)

user_connections
├── user_id_a (fk, smaller id)
├── user_id_b (fk, larger id)
└── PRIMARY KEY (user_id_a, user_id_b)

user_blocks
├── blocker_id (fk), blocked_id (fk)
└── created_at, PRIMARY KEY (blocker_id, blocked_id)

messages
├── id (serial)
├── sender_id (fk)
├── receiver_id (fk)
├── content
├── is_read (boolean)
└── created_at

notifications
├── id (serial)
├── user_id (fk)
├── type (enum)
├── actor_id (fk)
├── is_read (boolean)
└── created_at
```

## API Endpoints

### Public

| Method | Path                 | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Create account           |
| POST   | `/api/auth/login`    | Authenticate, set cookie |
| POST   | `/api/auth/logout`   | Clear cookie             |
| GET    | `/api/config/tmdb`   | TMDB image configuration |

### Protected (requires auth cookie)

| Method | Path                                | Description                           |
| ------ | ----------------------------------- | ------------------------------------- |
| GET    | `/api/user/me`                      | Current user info                     |
| GET    | `/api/tierlist/list`                | List templates with ranking status    |
| GET    | `/api/tierlist/:id`                 | Template details with user's rankings |
| POST   | `/api/tierlist/:id`                 | Save tier list ranking                |
| GET    | `/api/kin/list`                     | Paginated similar users               |
| GET    | `/api/kin/compare`                  | Detailed comparison with target user  |
| GET    | `/api/kin/categories`               | Available filter categories           |
| GET    | `/api/messages/:targetId`           | Conversation history                  |
| POST   | `/api/messages/:targetId`           | Send message                          |
| GET    | `/api/messages/conversations`       | List all conversations                |
| GET    | `/api/connection/:targetId/status`  | Connection state                      |
| POST   | `/api/connection/:targetId/ask`     | Send/accept request                   |
| DELETE | `/api/connection/:targetId/reject`  | Reject request                        |
| DELETE | `/api/connection/:targetId/cancel`  | Remove connection                     |
| POST   | `/api/connection/:targetId/block`   | Block user                            |
| DELETE | `/api/connection/:targetId/unblock` | Unblock user                          |
| GET    | `/api/notifications`                | Get and mark as read                  |
| GET    | `/api/notifications/quantity`       | Unread count                          |

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ with pgvector extension
- TMDB API key (for seeding)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd Kindred

# Backend
cd backend
cp ../.env.example .env   # or create .env with required vars (see below)
npm install
npm run build             # Required before db:seed / db:clean (dist/)
npm run db:seed           # Full seed: TMDB + templates + demo users (needs TMDB_API_KEY)
npm run dev               # Starts on :3001 (or PORT from .env)
```

To drop **only** accounts and activity but keep movie catalog and tierlist templates, after `npm run build`: `npm run db:clean` (see [Database scripts](#database-scripts)).

```bash
# Frontend (separate terminal)
cd frontend
npm install
npm run dev               # Starts on :5173; set VITE_API_URL if backend not at same host
```

### Database scripts

| Script | Command | What it does |
| ------ | ------- | ------------ |
| **Seed** | `npm run db:seed` | Full dataset via `db/seed.ts` (uses `seed/clear.ts` first — wipes **including** templates/movies, then repopulates). Requires `TMDB_API_KEY`. |
| **Clean** | `npm run db:clean` | `db/clean.ts` — removes **users** and all dependent rows (rankings, messages, notifications, connections). **Keeps** movies, directors, genres, `tierlist_templates`, `template_movies`, `tmdb_config`. Run after `npm run build`. |
| **Dev (no build)** | `npx tsx db/clean.ts` | Same as `db:clean` using TypeScript directly (needs `tsx` / dev install). |

### Environment Variables

See root **`.env.example`** for a commented template. Summary:

**Backend** (e.g. `backend/.env`, or variables on the API service in Railway):

| Variable                | Required | Purpose |
| ----------------------- | -------- | ------- |
| `DATABASE_URL`          | Yes (hosted) | PostgreSQL connection string (Railway Postgres plugin provides this). |
| `JWT_SECRET`            | Yes      | Secret for signing JWTs in the `token` cookie. |
| `JWT_EXPIRY`            | No       | Token lifetime inside the JWT; default `1h`. Cookie max age is configured in code (`authConfig`). |
| `TMDB_API_KEY`          | For seed & sync | Movie metadata; sync job logs a warning if missing. |
| `FRONTEND_URL`          | Yes (hosted) | **Allowed SPA origin(s)** for CORS with credentials. Must equal the browser `Origin` (e.g. `https://myapp.up.railway.app`). **Comma-separated** for multiple URLs (preview + production). Trailing `/` is optional and stripped. Default local: `http://localhost:5173`. |
| `CROSS_SITE_COOKIES`    | When SPA ≠ API host | If the user loads the UI from a **different hostname** than the API, set to `true`, `TRUE`, `1`, or `yes` so the session cookie uses `SameSite=None; Secure`. Omit or false when same-site (e.g. single Docker host proxying `/api`). |
| `PORT`                  | No       | Listen port; default `3001`. Many hosts set `PORT` automatically. |
| `NODE_ENV`              | No       | `development` / `production` / `test`. Affects cookie `Secure` in default (non–cross-site) mode and error verbosity. |
| `SYNC_INTERVAL_MINUTES` | No       | TMDB sync cadence; default `1440` (24h). |

**Frontend (Vite — build time):**

| Variable        | Purpose |
| --------------- | ------- |
| `VITE_API_URL`  | Base URL for the API (include `/api` if that is your mount path). Default `/api` (relative), which only works when the HTML is served from the same host as the API or a reverse proxy forwards `/api`. **Split Railway services:** set to the public API URL, e.g. `https://your-backend.up.railway.app/api`. |

**Cookie + CORS checklist (split frontend/backend URLs):**

1. API has `FRONTEND_URL` exactly matching the site users open in the browser.
2. API has `CROSS_SITE_COOKIES` truthy so `Set-Cookie` is not dropped on cross-origin responses.
3. Both sides use **HTTPS** in production (`Secure` cookies).
4. Frontend axios uses `withCredentials: true` (already set in `frontend/src/api.ts`).
5. Rebuild/redeploy the frontend after changing `VITE_API_URL`.

**Docker / Compose:** root `.env` supplies Postgres credentials, `JWT_SECRET`, `TMDB_API_KEY`, `VITE_API_URL`, `FRONTEND_URL`, `SYNC_INTERVAL_MINUTES`, and optional `CROSS_SITE_COOKIES` if you ever front the SPA from a different host than the API.

### Hosted deployment (e.g. Railway, Fly.io, Render)

The app is **not** tied to a single host. Any platform that provides:

- A **Node** service for the backend with `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (exact SPA origin(s), comma-separated if needed), **`CROSS_SITE_COOKIES=true`** when the SPA is on another hostname, `PORT` (often injected by the host), and optional `TMDB_API_KEY` / `SYNC_INTERVAL_MINUTES`.
- A **PostgreSQL** database with the `vector` extension (Railway Postgres templates often work; run `database.sql` / migrations as you do locally).
- A **static** or **Node** frontend built with `VITE_API_URL` pointing at the public API base (e.g. `https://your-api.up.railway.app/api`), then redeployed whenever that URL changes.

Example public UI: [kindred.up.railway.app](https://kindred.up.railway.app) — configure the same env semantics there or in Docker; no Railway-specific code paths are required.

**One-off DB clean on a host** (after deploy artifacts exist):

```bash
# From backend service shell / release command, with DATABASE_URL set:
npm run build && npm run db:clean
```

### Docker Deployment

```bash
# Copy .env.example to .env at project root and set:
# POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET, TMDB_API_KEY,
# VITE_API_URL (e.g. http://localhost/api), FRONTEND_URL, SYNC_INTERVAL_MINUTES

docker compose up -d
```

Optional — wipe user data only (keeps catalog + templates), from host with the backend image built:

```bash
docker compose exec backend node dist/db/clean.js
```

Services will be available at:

- Frontend: http://localhost
- Backend API: http://localhost/api
- Database: localhost:5432 (remove port mapping in production)

## Project Structure

```
Kindred/
├── .env.example                # Env template (Docker + optional local)
├── backend/
│   ├── src/server.ts           # Express app entry
│   ├── routes/                 # Route definitions
│   ├── controllers/            # Request handlers
│   ├── services/               # Business logic
│   │   ├── vectorService.ts    # Profile vector calculation
│   │   ├── kinService.ts       # Similarity queries
│   │   ├── configService.ts    # TMDB config
│   │   └── jobs/               # TMDB sync service
│   ├── jobs/                   # Cron setup (e.g. tmdbSyncJob.ts)
│   ├── middleware/             # Auth middleware
│   ├── db/                     # db.ts, database.sql, seed.ts, clean.ts
│   ├── config/                 # authConfig
│   ├── errors/                 # Custom error classes
│   ├── utils/                  # tokenUtils, authValidation
│   ├── types/                  # TypeScript interfaces
│   └── tests/                  # Unit and integration tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── layout/             # Layout, Topbar, Navbar, Footer
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── auth/           # AuthProvider, AuthForm, ProtectedRoute, AuthContext
│   │   │   ├── kin/            # Kin cards, affinity labels
│   │   │   ├── messages/       # Conversation, KinMessaging, skeletons
│   │   │   ├── notifications/  # NotificationDropdown
│   │   │   ├── connections/    # ConnectionStatusButton
│   │   │   └── tierlist/       # DnD/Tap tier list module
│   │   ├── shared/
│   │   │   ├── context/        # TmdbConfigProvider
│   │   │   ├── lib/            # cn(), tw (Tailwind presets)
│   │   │   └── ui/             # ErrorMessage, TemplateCard, skeletons
│   │   ├── hooks/
│   │   ├── theme/
│   │   └── types/
│   └── nginx.conf              # if present
└── docker-compose.yml
```

## License

MIT
