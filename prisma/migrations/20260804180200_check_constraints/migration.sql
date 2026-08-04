-- Prisma's schema language has no native CHECK constraint support, so these
-- business rules from the integrity requirements are added via raw SQL.
ALTER TABLE "listings" ADD CONSTRAINT "listings_price_positive" CHECK ("price" > 0);
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_acquisition_price_non_negative" CHECK ("acquisition_price" IS NULL OR "acquisition_price" >= 0);
