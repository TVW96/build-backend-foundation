import "dotenv/config";

import { DataSource } from "typeorm";

import { UpdateUsersForMarketplace1788060000000 } from "./migrations/1788060000000-update-users-for-marketplace.js";
import { SplitUserMailingAddress1788146400000 } from "./migrations/1788146400000-split-user-mailing-address.js";
import { AddUserAddresses1788232800000 } from "./migrations/1788232800000-add-user-addresses.js";
import { AddMediaStorageSchema1788319200000 } from "./migrations/1788319200000-add-media-storage-schema.js";
import { ConsolidateEntityImages1788405600000 } from "./migrations/1788405600000-consolidate-entity-images.js";

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  migrations: [
    UpdateUsersForMarketplace1788060000000,
    SplitUserMailingAddress1788146400000,
    AddUserAddresses1788232800000,
    AddMediaStorageSchema1788319200000,
    ConsolidateEntityImages1788405600000,
  ],
});
