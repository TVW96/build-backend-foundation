const LOCAL_DATABASE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "postgres",
]);

export type DatabaseResetTarget = {
  nodeEnv: string;
  host: string;
  database: string;
};

export function assertLocalResetTarget(target: DatabaseResetTarget): void {
  if (target.nodeEnv.toLowerCase() === "production") {
    throw new Error("seed-reset is disabled when NODE_ENV=production.");
  }

  if (!LOCAL_DATABASE_HOSTS.has(target.host.toLowerCase())) {
    throw new Error(
      `seed-reset refused non-local database host: ${target.host}`,
    );
  }

  const isProjectDatabase = target.database === "manga_marketplace";
  const isTestDatabase = target.database.endsWith("_test");

  if (!isProjectDatabase && !isTestDatabase) {
    throw new Error(
      `seed-reset refused unexpected database name: ${target.database}`,
    );
  }
}
