# Auto-Prioritizer Notes MVP

Task Loom is a fast, keyboard-friendly notes surface built with Next.js, Prisma, and Tailwind CSS. This first iteration focuses on high-quality capture, organization, and editing flows so we can wire in automated prioritization signals next.

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 8
- SQLite (bundled with Prisma)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

3. Initialize the database and seed sample data:

   ```bash
   pnpm db:push
   pnpm seed
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start Next.js dev server with hot reload     |
| `pnpm build`   | Build production bundle                      |
| `pnpm start`   | Run production server                        |
| `pnpm lint`    | ESLint via `next lint`                       |
| `pnpm test`    | Run Vitest unit tests                        |
| `pnpm e2e`     | Run Playwright end-to-end test suite         |
| `pnpm db:push` | Push Prisma schema to SQLite (no migrations) |
| `pnpm seed`    | Seed the database using `prisma/seed.ts`     |
| `pnpm format`  | Format using Prettier                        |

## Architecture Overview

- **Next.js App Router (TypeScript)** — Server components render the inbox, list, and editor views. A server action powers quick capture so the path revalidates automatically.
- **Data layer** — Prisma with SQLite stores notes and tasks plus a lightweight `Tag` model for shared tagging (SQLite lacks first-class array/JSON types). `lib/notes.ts` / `lib/tasks.ts` surface typed DTO helpers safe for client components.
- **API routes** — REST endpoints under `/api/notes` and `/api/tasks` enforce Zod validation, hydrate responses, and revalidate affected paths after mutations.
- **UI components** — Tailwind CSS drives the minimal, accessible interface. Keyboard workflows include quick add, list filtering, and editor shortcuts. Toasts surface optimistic feedback.
- **Utilities** — `utils/parseQuickAdd.ts` parses inline tags plus inline priority tokens (covered by Vitest). Markdown preview uses `marked`, while shared helpers format due dates, effort, and tag inputs.
- **Testing & CI** — Vitest covers parsing logic plus task validation rules; Playwright exercises the capture→search→edit→pin flow. GitHub Actions CI runs lint, Prisma validate (`db:push`), seed, unit tests, and Playwright.

## Data Flow

1. **Quick add** posts through a server action (`createQuickNoteAction`) that parses tags, validates input, persists via Prisma, and revalidates the inbox and list routes.
2. **Notes list** mounts `NotesListClient`, which debounces search/filter queries to `/api/notes`. Multi-select archive toggles update via PATCH and refresh the server-rendered data.
3. **Tasks list** uses `TaskListClient`, combining quick capture, filtering (status/tag/project), and list refreshes via `/api/tasks`.
4. **Editors** fetch notes/tasks server-side, then hydrate `NoteEditor` / `TaskEditor` for Markdown or rich task editing, tagging, completion, archive toggles, and delete—each calling REST APIs and refreshing caches.

Tags live in a lightweight `Tag` table joined to notes and tasks (SQLite doesn’t support `Json` columns). Helpers convert the relations into `string[]` for the UI.

## Tests & Screenshots

- Unit tests (Vitest):

  ```bash
  pnpm test
  ```

- End-to-end (Playwright):

  ```bash
  pnpm e2e
  ```

  The bundled test captures a full-page screenshot and attaches it to the Playwright report. To export artifacts, run with HTML reporting:

  ```bash
  pnpm e2e -- --reporter=html
  ```

  Screenshots live in the Playwright report (`playwright-report/`) or as attachments in CI.

## Docker Setup

Run the app with Docker Compose (PostgreSQL database included):

```bash
# 1. Build the images
docker compose build

# 2. Start the database
docker compose up -d db

# 3. Run migrations (creates tables)
docker compose --profile setup run --rm migrate

# 4. Seed the database (creates initial user)
docker compose --profile setup run --rm seed

# 5. Start the app
docker compose up -d app
```

The app runs at [http://localhost:3000](http://localhost:3000).

**Default credentials:**
- Email: `serhat@taskloom.app`
- Password: `serhat`

To customize, set `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` in your `.env` file before seeding.

### Docker Commands Reference

| Command | Description |
| ------- | ----------- |
| `docker compose up -d` | Start all services (db + app) |
| `docker compose down` | Stop all services |
| `docker compose logs -f app` | Follow app logs |
| `docker compose --profile setup run --rm migrate` | Run database migrations |
| `docker compose --profile setup run --rm seed` | Seed the database |

### Starting Fresh

To reset everything and start from scratch:

```bash
docker compose down -v  # Stop and remove volumes (deletes database)
docker compose build --no-cache  # Rebuild images
docker compose up -d db
docker compose --profile setup run --rm migrate
docker compose --profile setup run --rm seed
docker compose up -d app
```

## Checklist for Next Iteration

- [ ] Model tasks linked to notes and surface task status chips.
- [ ] Capture prioritization signals (tags, recency, metadata) for pipeline hooks.
- [ ] Prototype auto-prioritizer service and webhook backfill to update note priorities.
