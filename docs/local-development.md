# Local Development Guide

This document explains how to run the full TaskBloom stack locally using Docker Compose, and how to run individual services directly with `pnpm` for faster iteration.

---

## Prerequisites

| Tool | Minimum version | Install |
|---|---|---|
| Docker Desktop | 4.x | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | V2 (bundled with Docker Desktop) | included |
| Node.js | 22.x | [nodejs.org](https://nodejs.org/) |
| pnpm | 10.x | `corepack enable && corepack prepare pnpm@latest --activate` |

---

## Option A — Full Stack with Docker Compose

This is the recommended approach for running the complete stack (web server, background worker, and MySQL database) in a consistent, isolated environment.

### 1. Create your local environment file

Create a file named `.env` in the project root. The table below lists every variable the stack requires. Copy the variable names and fill in the values — do not commit this file to version control.

**Database (used by Docker Compose to initialise the MySQL container):**

| Variable | Default | Description |
|---|---|---|
| `DB_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `DB_NAME` | `taskbloom` | Database name |
| `DB_USER` | `taskbloom` | Application database user |
| `DB_PASSWORD` | `taskbloom_dev` | Application database password |

**Session and admin:**

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Signs session cookies. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_PASSWORD` | Yes | Password for the `/admin` dashboard |

**Manus OAuth (required for the user login flow):**

| Variable | Required | Description |
|---|---|---|
| `VITE_APP_ID` | Yes | Manus OAuth application ID — from your Manus project settings |
| `OAUTH_SERVER_URL` | Yes | Manus OAuth backend URL (default: `https://api.manus.im`) |
| `VITE_OAUTH_PORTAL_URL` | Yes | Manus login portal URL (default: `https://manus.im`) |
| `OWNER_OPEN_ID` | No | Your Manus Open ID — used for owner notifications |
| `OWNER_NAME` | No | Your display name — used in notification messages |

> For UI-only local development where you do not need the login flow, set `VITE_APP_ID=local-dev` and leave the other OAuth variables at their defaults.

**Manus built-in APIs (LLM, storage, notifications):**

| Variable | Required | Description |
|---|---|---|
| `BUILT_IN_FORGE_API_URL` | No | Manus internal API base URL (server-side) |
| `BUILT_IN_FORGE_API_KEY` | No | Bearer token for server-side Manus API calls |
| `VITE_FRONTEND_FORGE_API_URL` | No | Manus internal API base URL (client-side) |
| `VITE_FRONTEND_FORGE_API_KEY` | No | Bearer token for client-side Manus API calls |

> Leave these blank to disable AI task expansion, voice transcription, and owner notifications during local development.

**Analytics (optional):**

| Variable | Required | Description |
|---|---|---|
| `VITE_ANALYTICS_ENDPOINT` | No | Analytics ingest endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | No | Analytics website identifier |

### 2. Start the stack

```bash
docker compose up
```

Docker Compose will:
1. Pull the MySQL 8 image and initialise the `taskbloom` database.
2. Build the development image (`Dockerfile.dev`) — this installs all dependencies.
3. Start the `web` service (`pnpm dev`) on port 3000 with hot-reload.
4. Start the `worker` service (`pnpm worker:dev`) with hot-reload.

The web server is available at **http://localhost:3000**.

### 3. Run database migrations

On first run (or after schema changes), apply the Drizzle migrations from inside the running web container:

```bash
docker compose exec web pnpm db:push
```

### 4. Useful commands

```bash
# Start all services in the background
docker compose up -d

# View logs for a specific service
docker compose logs -f web
docker compose logs -f worker

# Restart a single service after config changes
docker compose restart web

# Stop all services
docker compose down

# Stop and remove volumes (wipes the database)
docker compose down -v

# Rebuild images after dependency changes (package.json / pnpm-lock.yaml)
docker compose build --no-cache web worker
```

---

## Option B — Local pnpm (no Docker for web/worker)

If you prefer to run the web server and worker directly on your machine, you can use the Docker Compose database only and run the application with `pnpm`.

### 1. Start only the database

```bash
docker compose up db
```

### 2. Set environment variables

Export the variables from your `.env` file, replacing the `db` hostname with `127.0.0.1`:

```bash
export DATABASE_URL="mysql://taskbloom:taskbloom_dev@127.0.0.1:3306/taskbloom"
export JWT_SECRET="your_jwt_secret"
export ADMIN_PASSWORD="your_admin_password"
# ... other variables as needed
```

Or use a tool like [`direnv`](https://direnv.net/) to load `.env` automatically.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run migrations

```bash
pnpm db:push
```

### 5. Start the web server and worker

In two separate terminals:

```bash
# Terminal 1 — web server with hot-reload
pnpm dev

# Terminal 2 — background worker with hot-reload
pnpm worker:dev
```

---

## Project Structure Reference

```
server/
  _core/          ← Framework plumbing (OAuth, tRPC context, env)
  routers/        ← tRPC domain routers (auth, user, tasks, admin, ...)
  db/             ← Database query helpers by domain
  workers/        ← Background job modules (streak, due-date reminders)
  shared/         ← Shared server-side constants (gamification)
  __tests__/      ← All Vitest test files

client/src/
  components/
    admin/        ← Admin dashboard components
    achievements/ ← Achievement panel
    layout/       ← DashboardLayout, DashboardHeader, MarketingNav
    shared/       ← ErrorBoundary, CookieConsent, SettingsDialog, ...
    tasks/        ← TaskCard, TaskList, AddTaskDialog, EditTaskDialog, ...
    ui/           ← shadcn/ui primitives (do not edit)
  pages/
    app/          ← Dashboard, Settings, Onboarding
    marketing/    ← Home, Mission, Pricing, Parents, Privacy, Terms
  types/
    dashboard.ts  ← Shared types and constants for dashboard components

docs/             ← Project documentation
drizzle/          ← Schema and migrations
```

---

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode during development
pnpm exec vitest

# TypeScript type check
pnpm check
```

---

## Connecting to the Database

When the `db` service is running, you can connect with any MySQL client using:

| Setting | Value |
|---|---|
| Host | `127.0.0.1` |
| Port | `3306` |
| Database | `taskbloom` (or `DB_NAME` from your `.env`) |
| User | `taskbloom` (or `DB_USER`) |
| Password | `taskbloom_dev` (or `DB_PASSWORD`) |

Recommended GUI clients: [TablePlus](https://tableplus.com/), [DBeaver](https://dbeaver.io/), or [MySQL Workbench](https://www.mysql.com/products/workbench/).
