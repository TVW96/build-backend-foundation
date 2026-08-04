# Prisma Scaffolding Commands

Commands used, in order, to scaffold and apply the Prisma schema in this NestJS project. Verified against the actual commands executed in this chat session.

## 1. Install Prisma

```bash
npm uninstall typeorm @nestjs/typeorm pg
npm install prisma --save-dev
npm install @prisma/client
```

## 2. Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

## 3. Validate and format the schema

```bash
npx prisma format
npx prisma validate
```

## 4. Generate the Prisma client

```bash
npx prisma generate
```

## 5. Reset the local database (removed stale TypeORM tables)

Required explicit user consent, passed through the `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` environment variable:

```bash
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="Yes, reset the database" npx prisma migrate reset --force
```

## 6. Create and apply the initial migration

```bash
npx prisma migrate dev --name init
```

## 7. Add a follow-up migration for CHECK constraints

Prisma's schema language has no native `CHECK` constraint support, so these were added via a raw SQL migration:

```bash
mkdir -p prisma/migrations/20260804180200_check_constraints
cat > prisma/migrations/20260804180200_check_constraints/migration.sql << 'EOF'
-- Prisma's schema language has no native CHECK constraint support, so these
-- business rules from the integrity requirements are added via raw SQL.
ALTER TABLE "listings" ADD CONSTRAINT "listings_price_positive" CHECK ("price" > 0);
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_acquisition_price_non_negative" CHECK ("acquisition_price" IS NULL OR "acquisition_price" >= 0);
EOF
npx prisma migrate dev --name check_constraints
```

## 8. Scaffold auth/profiles/media modules

```bash
npx nest g module auth --no-spec && npx nest g service auth --no-spec --flat && npx nest g controller auth --no-spec --flat
npx nest g service auth --no-spec
npx nest g controller auth --no-spec
npx nest g module profiles --no-spec
npx nest g service profiles --no-spec
npx nest g controller profiles --no-spec
npx nest g module media --no-spec
npx nest g service media --no-spec
npx nest g controller media --no-spec
```

> Note: the first `auth` service/controller generation used `--flat`, which placed files at `src/` root and wired them into `AppModule` incorrectly. Those files were deleted and regenerated without `--flat`.
