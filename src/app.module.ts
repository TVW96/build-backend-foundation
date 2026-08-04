import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { CatalogProductsModule } from './catalog-products/catalog-products.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { ListingsModule } from './listings/listings.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,

    CatalogProductsModule,
    InventoryItemsModule,
    ListingsModule,
    AuthModule,
    ProfilesModule,
    MediaModule,
  ],
})
export class AppModule {}