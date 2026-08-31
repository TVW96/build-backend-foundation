import "dotenv/config";
import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";

import { AppModule } from "../../app.module";
import { getSeedSummary, persistSeeds } from "./seed-data";
import { assertLocalResetTarget } from "./seed-reset-safety";

const logger = new Logger("DatabaseSeedReset");

async function resetAndSeedDatabase(): Promise<void> {
  const target = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    host: process.env.DB_HOST ?? "",
    database: process.env.DB_NAME ?? "",
  };

  // Guard before Nest initializes TypeORM so an unsafe target is never opened
  // or synchronized by this destructive command.
  assertLocalResetTarget(target);

  const application = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = application.get(DataSource);

    logger.warn(
      `Completely resetting local database "${target.database}" on "${target.host}".`,
    );

    await dataSource.dropDatabase();
    await dataSource.synchronize();
    await dataSource.transaction(persistSeeds);

    logger.log(`Reset complete. Seeded ${getSeedSummary()}.`);
  } finally {
    await application.close();
  }
}

void resetAndSeedDatabase().catch((error: unknown) => {
  const details = error instanceof Error ? error.stack : String(error);

  logger.error("Local database reset failed.", details);
  process.exitCode = 1;
});
