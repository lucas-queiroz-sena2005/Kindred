# Kindred

Full-stack web application that matches users based on cinematic preferences using vector similarity search. Users rank films in tier lists; the system extracts feature vectors from these rankings and computes taste compatibility via cosine similarity on PostgreSQL with the `pgvector` extension.

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
│  │ Service     │ │ Service     │ │ Daily at 00:00 UTC             ││
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

Where `k=3` (dampening factor). This shrinks scores toward zero when sample size is small.

5. **Persist** the 256-dimension vector to `users.profile_vector`

### Read Path (Similarity Search)

The Kin page retrieves compatible users via:

```sql
SELECT
  other.id,
  other.username,
  GREATEST(0, (1 - (other.profile_vector <=> current_user.profile_vector))) AS similarity_score
FROM users other
WHERE other.id != $current_user_id
  AND other.profile_vector IS NOT NULL
ORDER BY similarity_score DESC
LIMIT $limit OFFSET $offset
```

The `<=>` operator computes cosine distance. Subtracting from 1 converts to similarity (0–1 range).

### Segment-Based Comparison

Users can filter by feature category:

```sql
-- Genre similarity only (indices 0-18)
((other.profile_vector::real[])[0:18])::vector
  <=>
((current.profile_vector::real[])[0:18])::vector
```

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

- JWT tokens stored in `httpOnly` cookies (prevents XSS token theft)
- Token expiry configurable via `JWT_EXPIRY` env var (default: 1h)
- Cookie max age: 72 hours
- Password hashing: bcrypt with 10 salt rounds

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

**Daily Sync** (cron job at 00:00 UTC):

1. Calls `/movie/changes` endpoint to get IDs modified in last 24h
2. Filters to only locally-stored movies
3. Updates `title`, `poster_path`, `last_sync` for changed records
4. Refreshes image CDN configuration

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

movies
├── id (serial)
├── tmdb_id (unique)
├── title
├── poster_path
├── release_year
├── decade (computed)
└── last_sync

tierlist_templates
├── id (serial)
├── title
└── description

template_movies (junction)
├── template_id (fk)
└── movie_id (fk)

user_rankings
├── id (serial)
├── user_id (fk)
├── template_id (fk)
├── updated_at
└── UNIQUE(user_id, template_id)

ranked_items
├── id (serial)
├── ranking_id (fk)
├── movie_id (fk)
└── tier (0-5, maps to S-F)
```

### Social Tables

```
user_connections
├── user_id_a (fk, smaller id)
├── user_id_b (fk, larger id)
└── created_at

connection_request
├── sender_id (fk)
├── receiver_id (fk)
└── created_at

user_blocks
├── blocker_id (fk)
├── blocked_id (fk)
└── created_at

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
cd kindred

# Backend setup
cd backend
cp .env.example .env  # Configure DATABASE_URL, JWT_SECRET, TMDB_API_KEY
npm install
npm run db:seed       # Populate database with TMDB data
npm run dev           # Starts on :3001

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev           # Starts on :5173
```

### Environment Variables

**Backend** (`/backend/.env`):

```
DATABASE_URL=postgresql://user:pass@localhost:5432/kindred
JWT_SECRET=<random-string>
JWT_EXPIRY=1h
TMDB_API_KEY=<tmdb-api-key>
```

### Docker Deployment

```bash
# Create .env at project root with:
# POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET

docker compose up -d
```

Services will be available at:

- Frontend: http://localhost
- Backend API: http://localhost/api
- Database: localhost:5432 (remove port mapping in production)

## Project Structure

```
kindred/
├── backend/
│   ├── src/server.ts           # Express app entry
│   ├── routes/                 # Route definitions
│   ├── controllers/            # Request handlers
│   ├── services/               # Business logic
│   │   ├── vectorService.ts    # Profile vector calculation
│   │   ├── kinService.ts       # Similarity queries
│   │   └── jobs/               # Cron job services
│   ├── middleware/             # Auth middleware
│   ├── db/                     # Database connection, seeds
│   ├── config/                 # Auth config
│   ├── errors/                 # Custom error classes
│   └── types/                  # TypeScript interfaces
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Route definitions
│   │   ├── api.ts              # Axios instance, API functions
│   │   ├── components/         # Shared components
│   │   ├── pages/              # Route components
│   │   ├── features/
│   │   │   └── tierlist/       # Tier list feature module
│   │   │       ├── components/ # DnD and Tap interfaces
│   │   │       ├── context/    # Page-level state
│   │   │       └── util/       # State transformers
│   │   ├── hooks/              # Custom hooks
│   │   ├── context/            # Global contexts
│   │   └── types/              # TypeScript interfaces
│   └── nginx.conf              # Production proxy config
└── docker-compose.yml
```

## License

MIT
