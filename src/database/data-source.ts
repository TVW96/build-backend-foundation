import "dotenv/config";

import { DataSource } from "typeorm";

import { createDatabaseOptions } from "./database-options.js";
import { ApplicationSchemaBaseline1788492000000 } from "./migrations/1788492000000-application-schema-baseline.js";
import { SecureSupabaseSchema1788578400000 } from "./migrations/1788578400000-secure-supabase-schema.js";
import { SecureMigrationHistory1788664800000 } from "./migrations/1788664800000-secure-migration-history.js";

export default new DataSource({
  ...createDatabaseOptions(process.env, "migration"),
  migrations: [
    ApplicationSchemaBaseline1788492000000,
    SecureSupabaseSchema1788578400000,
    SecureMigrationHistory1788664800000,
  ],
});
