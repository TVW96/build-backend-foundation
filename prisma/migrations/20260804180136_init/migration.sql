-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('USER', 'DEVELOPER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'REMOVED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SINGLE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'CANCELLED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "auth_users" (
    "auth_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("auth_user_id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "profile_id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_role_id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "role" "UserRoleType" NOT NULL DEFAULT 'USER',
    "assigned_by_auth_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "catalog_products" (
    "product_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "series" TEXT,
    "volume_number" INTEGER,
    "edition" TEXT,
    "isbn" TEXT,
    "author" TEXT,
    "publisher" TEXT,
    "language" TEXT,
    "publication_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "condition_notes" TEXT,
    "availability" "InventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
    "acquisition_price" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "listings" (
    "listing_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "listing_type" "ListingType" NOT NULL DEFAULT 'SINGLE',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listing_items" (
    "listing_item_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "listing_items_pkey" PRIMARY KEY ("listing_item_id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "media_asset_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "object_path" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "alt_text" TEXT,
    "product_id" TEXT,
    "item_id" TEXT,
    "listing_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("media_asset_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_auth_user_id_key" ON "profiles"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_auth_user_id_role_key" ON "user_roles"("auth_user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_products_isbn_key" ON "catalog_products"("isbn");

-- CreateIndex
CREATE INDEX "catalog_products_title_idx" ON "catalog_products"("title");

-- CreateIndex
CREATE INDEX "catalog_products_series_idx" ON "catalog_products"("series");

-- CreateIndex
CREATE INDEX "catalog_products_publisher_idx" ON "catalog_products"("publisher");

-- CreateIndex
CREATE INDEX "catalog_products_volume_number_idx" ON "catalog_products"("volume_number");

-- CreateIndex
CREATE INDEX "inventory_items_owner_id_idx" ON "inventory_items"("owner_id");

-- CreateIndex
CREATE INDEX "inventory_items_product_id_idx" ON "inventory_items"("product_id");

-- CreateIndex
CREATE INDEX "inventory_items_condition_idx" ON "inventory_items"("condition");

-- CreateIndex
CREATE INDEX "listings_status_created_at_idx" ON "listings"("status", "created_at");

-- CreateIndex
CREATE INDEX "listings_seller_id_idx" ON "listings"("seller_id");

-- CreateIndex
CREATE INDEX "listings_price_idx" ON "listings"("price");

-- CreateIndex
CREATE INDEX "listings_listing_type_idx" ON "listings"("listing_type");

-- CreateIndex
CREATE INDEX "listing_items_item_id_idx" ON "listing_items"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_items_listing_id_item_id_key" ON "listing_items"("listing_id", "item_id");

-- CreateIndex
CREATE INDEX "media_assets_owner_id_idx" ON "media_assets"("owner_id");

-- CreateIndex
CREATE INDEX "media_assets_product_id_idx" ON "media_assets"("product_id");

-- CreateIndex
CREATE INDEX "media_assets_item_id_idx" ON "media_assets"("item_id");

-- CreateIndex
CREATE INDEX "media_assets_listing_id_idx" ON "media_assets"("listing_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_users"("auth_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_users"("auth_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "profiles"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_items" ADD CONSTRAINT "listing_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_items" ADD CONSTRAINT "listing_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog_products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("listing_id") ON DELETE SET NULL ON UPDATE CASCADE;
