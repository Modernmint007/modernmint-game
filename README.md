# Modern Mint

Frontend authentication flow and backend API for the **Modern Mint** multiplayer strategy game platform.

---

## Repository Structure

```
modernmint/
├── frontend/                    # Next.js 15 application (App Router)
│   ├── src/
│   │   ├── app/                 # Pages & layouts
│   │   │   ├── page.tsx         # Splash screen → /menu (3 s)
│   │   │   ├── menu/page.tsx    # Main menu
│   │   │   ├── login/page.tsx   # Login  → /menu on success
│   │   │   ├── signup/page.tsx  # Signup → /menu on success
│   │   │   ├── verify/page.tsx  # Email verification (future)
│   │   │   └── tutorial/page.tsx
│   │   ├── components/
│   │   │   ├── Logo.tsx         # Animated hex wordmark
│   │   │   ├── PageBackground.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx   # 4 variants + loading state
│   │   │       ├── Card.tsx     # Glassmorphism card
│   │   │       └── Input.tsx    # Label / error / hint
│   │   └── lib/
│   │       ├── api.ts           # Typed fetch client (ApiError)
│   │       ├── auth.ts          # Session helpers (localStorage)
│   │       └── validations.ts   # Zod schemas
│   ├── public/
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── package.json
│   └── .env.local.example       # → copy to .env.local
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── server.ts            # Entry point — starts server, pings DB
│   │   ├── app.ts               # Express app, CORS, body parsers
│   │   ├── config/
│   │   │   └── database.ts      # pg Pool singleton
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── utils/
│   │   │   ├── hash.ts          # bcryptjs helpers
│   │   │   └── jwt.ts           # sign / verify token
│   │   ├── services/
│   │   │   └── auth.service.ts  # Signup / login business logic
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # requireAuth (Bearer token)
│   │   │   └── error.middleware.ts  # Global JSON error handler
│   │   └── routes/
│   │       ├── auth.routes.ts   # POST /signup  POST /login
│   │       └── index.ts         # /api/* + GET /api/health
│   ├── scripts/
│   │   └── init-db.js           # One-time schema setup utility
│   ├── .env.example             # → copy to .env
│   ├── package.json
│   └── tsconfig.json
│
├── db/
│   └── schema.sql               # PostgreSQL schema (users table)
│
├── docs/                        # Architecture guides & contributor notes
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon) via `pg` |
| Auth | bcryptjs (password hashing) + JWT |

---

## Environment Setup

### Frontend — `frontend/.env.local`

```bash
cp frontend/.env.local.example frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend — `backend/.env`

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Neon / any PostgreSQL connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE

# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<at_least_64_random_chars>
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

---

## Running Locally

### 1 — Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2 — Initialise the database (run once)

```bash
cd backend
npm run db:init
```

Expected output:
```
Connecting to database…
Applying schema…
✓ Schema applied.
Tables: users
✓ Database ready.
```

### 3 — Start the backend (terminal 1)

```bash
cd backend
npm run dev
```

Expected output:
```
[DB]     Connected — server time: 2026-...
[Server] Modern Mint API running on http://localhost:5000
```

### 4 — Start the frontend (terminal 2)

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000**

---

## API Reference

Base URL: `http://localhost:5000`

| Method | Path | Body | Success |
|---|---|---|---|
| `POST` | `/api/auth/signup` | `{ username, email, password }` | `201 { success, data: { token, user } }` |
| `POST` | `/api/auth/login` | `{ email, password }` | `200 { success, data: { token, user } }` |
| `GET` | `/api/health` | — | `200 { status: "ok" }` |

All protected routes accept `Authorization: Bearer <token>`.
The `requireAuth` middleware in `backend/src/middleware/auth.middleware.ts` is ready to guard any new route.

### Error shape

```json
{ "success": false, "message": "Human-readable reason." }
```

---

## Application Flow

```
/ (Splash, 3 s)
   └─→ /menu
          ├─→ /login  ──[POST /api/auth/login]──→ /menu
          ├─→ /signup ──[POST /api/auth/signup]─→ /menu
          └─→ /tutorial  (placeholder)
```

---

## Security Notes

- Passwords hashed with **bcryptjs** at 12 salt rounds.
- JWTs signed with **HS256**, expire in **7 days**.
- Wrong-credential responses use a **generic 401** message — no email enumeration.
- Duplicate email/username returns **409** with a field-specific message.
- Session stored in `localStorage` (`mm_token`, `mm_user`).
  Replace with httpOnly cookies before a public production launch.
