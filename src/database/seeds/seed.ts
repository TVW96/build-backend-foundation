import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DataSource, EntityManager } from "typeorm";

import { AppModule } from "../../app.module";
import { CatalogProduct } from "../../catalog-products/entities/catalog-product.entity";
import { InventoryItem } from "../../inventory-items/entities/inventory-item.entity";
import { ListingItem } from "../../listings/entities/listing-item.entity";
import { Listing } from "../../listings/entities/listing.entity";
import { catalogProductSeeds } from "./catalog-products.seed";
import { inventoryItemSeeds } from "./inventory-items.seed";
import { listingItemSeeds, listingSeeds } from "./listings.seed";

const logger = new Logger("DatabaseSeed");

async function persistSeeds(manager: EntityManager): Promise<void> {
  // Save in dependency order so the same seed works when foreign keys are enabled.
  await manager.getRepository(CatalogProduct).save(catalogProductSeeds);
  await manager.getRepository(InventoryItem).save(inventoryItemSeeds);
  await manager.getRepository(Listing).save(listingSeeds);
  await manager.getRepository(ListingItem).save(listingItemSeeds);
}

async function seedDatabase(): Promise<void> {
  const application = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = application.get(DataSource);
    await dataSource.transaction(persistSeeds);

    logger.log(
      `Seeded ${catalogProductSeeds.length} catalog products, ` +
        `${inventoryItemSeeds.length} inventory items, ` +
        `${listingSeeds.length} listings, and ` +
        `${listingItemSeeds.length} listing items.`,
    );
  } finally {
    await application.close();
  }
}

void seedDatabase().catch((error: unknown) => {
  const details = error instanceof Error ? error.stack : String(error);

  logger.error("Database seeding failed.", details);
  process.exitCode = 1;
});
