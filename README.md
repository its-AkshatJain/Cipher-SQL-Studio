# CipherSQL Studio

A browser-based SQL learning platform where students practice SQL queries against pre-configured assignments with real-time execution, intelligent AI hints, and per-user progress tracking.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js + Vite | Fast SPA with HMR for development |
| Styling | Vanilla SCSS | Evaluates fundamental CSS skills — variables, mixins, nesting, partials, BEM |
| Editor | Monaco Editor | VS Code-grade SQL editing in the browser |
| Backend | Node.js + Express.js | Lightweight REST API, easy PostgreSQL/MongoDB integration |
| Sandbox DB | PostgreSQL (Neon) | Real SQL execution — not a simulation |
| Persistence DB | MongoDB Atlas | Flexible schema for assignments and user progress |
| AI Hints | Gemini 2.0 Flash | Fast LLM for context-aware hints (not solutions) |
| Auth | Clerk | Managed auth — per-user progress tracking without building auth from scratch |

---

## Architecture

```
Frontend (React/Vite)
    ↕ REST API (Axios)
Backend (Express.js)
    ├── PostgreSQL (Neon)   ← Query execution sandbox
    ├── MongoDB Atlas       ← Assignments + UserProgress
    └── Gemini API          ← Hint generation
```

### Data Flow

```
1. User selects assignment  →  GET /api/assignments/:id  →  MongoDB
2. Load sample data         →  Displayed from MongoDB sampleTables field
3. User writes SQL query    →  POST /api/execute { sql, pgSchema }
4. Execute query            →  SET search_path TO asgn_xxx; (isolated schema)
                            →  PostgreSQL returns result rows
5. Answer checked           →  Frontend compares rows vs expectedOutput
6. Request hint             →  POST /api/execute/hint  →  Gemini API
7. Save progress            →  POST /api/progress  →  MongoDB UserProgress
```

### PostgreSQL Sandboxing

Each assignment has its own isolated PostgreSQL **schema** (`asgn_high_salary`, `asgn_dept_count`, etc.). When a query runs, the backend sets `SET LOCAL search_path TO <schema>` so students write plain table names like `SELECT * FROM employees` without conflicts between assignments. All queries run inside a **transaction that is rolled back**, so students can't permanently mutate data.

---

## Project Structure

```
CipherSQL Studio/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB + PostgreSQL connection
│   │   ├── models/         # Assignment.js, UserProgress.js
│   │   ├── routes/         # assignment, query, progress routes
│   │   ├── services/       # query.service.js, llm.service.js
│   │   └── utils/          # seed-mongo.js, seed-pg.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar
│   │   ├── pages/          # AssignmentsPage, AttemptPage, AboutPage
│   │   ├── services/       # api.js (AssignmentService, QueryService, ProgressService)
│   │   ├── constants/      # API endpoints, getSessionId
│   │   └── styles/         # main.scss, partials (_variables, _mixins)
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster
- A [Google AI Studio](https://aistudio.google.com) Gemini API key
- A [Clerk](https://clerk.com) application (for auth)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Cipher SQL Studio"
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
```

#### Seed the databases

```bash
# Seed MongoDB with 4 assignments
npm run seed:mongo

# Seed PostgreSQL with isolated schemas + sample data
npm run seed:pg
```

#### Start the backend

```bash
npm run dev   # runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# Fill in VITE_API_BASE_URL and VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev   # runs on http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/

# PostgreSQL (Neon recommended)
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT (legacy, reserved)
JWT_SECRET=your_secret_here

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Features

### Core (Required)

- **Assignment Listing** — Shows all assignments with difficulty badge, time estimate, and per-user solved/unsolved state
- **Sample Data Viewer** — Full table rows with column types shown in the sidebar
- **Monaco SQL Editor** — Syntax highlighting, autosave to MongoDB
- **Query Execution** — Real PostgreSQL execution in an isolated schema per assignment
- **Results Panel** — Tabular display; drag-to-resize between editor and results
- **Answer Checking** — Compares result rows vs `expectedOutput`; shows detailed feedback (row count mismatch, missing columns, etc.)
- **AI Hints** — Gemini 2.0 Flash generates guidance without revealing the solution
- **Error Feedback** — SQL errors displayed inline

### Optional (Implemented)

- **Clerk Authentication** — Sign in with Google/email; per-user progress tracked in MongoDB
- **Progress Persistence** — Query drafts and completion state saved per user per assignment
- **Progress Bar** — Homepage shows `X / N solved` with animated fill

---

## Evaluation Notes

- **Vanilla SCSS**: All styling uses `.module.scss` files with `$variables`, `@mixin`, nesting, and `@use`/`@forward` partials. No utility frameworks.
- **Mobile-first**: Breakpoints at 320px, 641px, 1024px, 1281px using `respond-to()` mixin.
- **LLM Prompt Engineering**: Prompt explicitly instructs Gemini to give hints only — it includes the question, schema, and current query, and forbids giving the complete answer.
- **Security**: Query validation blocks `DROP`, `TRUNCATE`, `ALTER`; all queries run in a rolled-back transaction; schema name validated against a whitelist before being used in `SET search_path`.
