import { Module } from '@nestjs/common';
import { CatalogProductsService } from './catalog-products.service';
import { CatalogProductsController } from './catalog-products.controller';

@Module({
  controllers: [CatalogProductsController],
  providers: [CatalogProductsService],
})
export class CatalogProductsModule {}
