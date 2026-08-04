# Dependency Commands

Commands used to install and remove project dependencies while migrating this project from TypeORM to Prisma.

## Removed (TypeORM)

```bash
npm uninstall typeorm @nestjs/typeorm pg
```

## Installed (Prisma)

```bash
npm install prisma --save-dev
npm install @prisma/client
npm install dotenv
```
