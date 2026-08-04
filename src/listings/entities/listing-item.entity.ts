import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Listing } from './listing.entity';
import { InventoryItem } from '../../inventory-items/entities/inventory-item.entity';

@Entity({ name: 'listing_items' })
@Index(['listing', 'inventoryItem'], { unique: true })
export class ListingItem {
  @PrimaryGeneratedColumn('uuid', {
    name: 'listing_item_id',
  })
  listingItemId: string;

  @ManyToOne(() => Listing, (listing) => listing.listingItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @ManyToOne(
    () => InventoryItem,
    (inventoryItem) => inventoryItem.listingItems,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'item_id' })
  inventoryItem: InventoryItem;
}