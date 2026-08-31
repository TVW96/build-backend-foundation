import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogProductsModule } from './catalog-products/catalog-products.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { ListingsModule } from './listings/listings.module';
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

        // Acceptable temporarily during early local development.
        // Replace with migrations before production.
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),

    CatalogProductsModule,
    UsersModule,
    InventoryItemsModule,
    ListingsModule,
  ],
})
export class AppModule {}
