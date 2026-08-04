# Project Instructions

Setup and operating instructions for `build-backend-foundation`, the NestJS + Prisma backend for the Manga Marketplace domain (Phase 1).

## Prerequisites

- Node.js and npm
- PostgreSQL running locally (or reachable) on `localhost:5432`

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Create/update `.env` (and `.env.local` if used) with a single Prisma connection string:

```
DATABASE_URL="postgresql://<user>@localhost:5432/manga_marketplace?schema=public"
```

## 3. Generate the Prisma client

```bash
npx prisma generate
```

The client is generated to `generated/prisma` (import from `generated/prisma/client`, not `generated/prisma`).

## 4. Apply database migrations

```bash
npx prisma migrate dev
```

This creates the database schema (enums, tables, constraints, indexes) defined in [prisma/schema.prisma](../prisma/schema.prisma).

> `prisma migrate reset` drops and recreates the schema and must only be run against a local/dev database with explicit confirmation — never production.

## 5. Run the app

```bash
npm run start:dev
```

## 6. Run tests

```bash
npm run build     # type-check / compile
npm test          # unit tests
npm run test:e2e  # end-to-end tests (requires a running database)
```

## Project structure

- `src/` — NestJS modules: `catalog-products`, `inventory-items`, `listings`, `auth`, `profiles`, `media`, plus `database/` (Prisma service).
- `prisma/schema.prisma` — single source of truth for the database schema.
- `prisma/migrations/` — applied migration history.
