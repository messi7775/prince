# Prince Net — Base44 Dev Environment

## Overview

PNPM monorepo: NestJS API (`apps/api`) + Vite/React web (`apps/web`) + shared packages (`packages/types`, `packages/validation`, `packages/config`). PostgreSQL database. No external SaaS dependencies.

## Running

```bash
docker compose -f docker-compose.base44.yml up -d
```

- **Web** (preview entry): host port 3000 → container 5173 (Vite dev server)
- **API**: internal port 3000 (NestJS), proxied through Vite (`/api` → `http://api:3000`)
- **DB**: PostgreSQL 15 (internal, user/db: `prince`/`prince_net`)

## Services

| Service | Role |
|---------|------|
| `db` | PostgreSQL 15, healthchecked via `pg_isready` |
| `install-deps` | One-shot: `pnpm install --frozen-lockfile && pnpm build:packages`, then exits |
| `api` | Depends on install-deps + db; runs prisma generate → migrate deploy → seed → `nest start --watch` |
| `web` | Depends on install-deps; runs `vite` dev server |

## Startup order

1. `db` starts and becomes healthy
2. `install-deps` runs `pnpm install` + builds shared packages (`packages/*` → `dist/`), exits
3. `api` starts: prisma generate → migrate deploy → seed → nest watch
4. `web` starts: vite dev server (can start in parallel with api, only needs deps)

## Required env vars

- `JWT_SECRET` (≥32 chars), `CSRF_SECRET` (≥16 chars), `ADMIN_PASSWORD` (≥12 chars) — generated development placeholders delivered via `/run/base44/app.env`; fallback placeholders in `.env.base44-defaults`
- `DATABASE_URL` — set inline in compose (points to `db` service)
- `CORS_ORIGIN`, `BACKUP_DIR`, `ADMIN_EMAIL` — set inline in compose
- `API_PROXY_TARGET` — set to `http://api:3000` for the web container's Vite proxy

## Key files

- `apps/api/prisma/schema.prisma` — Prisma schema, output to `src/generated/prisma/`
- `apps/api/src/config/env.validation.ts` — Zod env validation (defines required vars)
- `apps/web/vite.config.ts` — Vite config; proxy target configurable via `API_PROXY_TARGET` env
- `apps/api/src/health/health.controller.ts` — health endpoint at `/api/v1/health`

## Fixes applied during setup

- **Missing backups module**: `apps/api/src/backups/` was imported in `app.module.ts` but the directory didn't exist. Created `backups.module.ts`, `backups.controller.ts`, `backups.service.ts` implementing `GET /backups`, `POST /backups`, `POST /backups/:id/restore` with advisory locks and proper transaction isolation (RepeatableRead for create, Serializable for restore).
- **Vite proxy target**: `apps/web/vite.config.ts` proxy target changed to read `API_PROXY_TARGET` env var (defaults to `http://localhost:3000`) so the Vite dev server can proxy to the API container in Docker.

## Notes

- Shared packages (`types`, `validation`, `config`) must be built before API starts (CommonJS `dist/`); web imports them via Vite aliases from source.
- Prisma client is generated to `apps/api/src/generated/prisma/` (gitignored) — regenerated on each container start.
- Vite proxy provides single-origin wiring; browser never talks to the API directly, so CORS_ORIGIN is not critical.
- `CHOKIDAR_USEPOLLING=true` is set for file-watch reliability in bind-mounted containers.
- Admin login: `admin@prince-net.local` / value of `ADMIN_PASSWORD` secret.
