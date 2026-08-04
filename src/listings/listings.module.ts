import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryItem } from '../inventory-items/entities/inventory-item.entity';
import { Listing } from './entities/listing.entity';
import { ListingItem } from './entities/listing-item.entity';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Listing,
      ListingItem,
      InventoryItem,
    ]),
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}