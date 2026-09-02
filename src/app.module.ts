import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogProductsModule } from './catalog-products/catalog-products.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { ListingsModule } from './listings/listings.module';
import { MediaModule } from './media/media.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),

        autoLoadEntities: true,

        // Migrations preserve data backfills, partial indexes, and composite
        // integrity constraints that TypeORM's schema synchronizer cannot model.
        synchronize: false,
      }),
    }),

    CatalogProductsModule,
    UsersModule,
    InventoryItemsModule,
    ListingsModule,
    MediaModule,
  ],
})
export class AppModule {}
