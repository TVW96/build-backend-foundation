import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ListingItem } from '../../listings/entities/listing-item.entity';

export enum InventoryAvailability {
  AVAILABLE = 'available',
  LISTED = 'listed',
  SOLD = 'sold',
  UNAVAILABLE = 'unavailable',
}

@Entity({ name: 'inventory_items' })
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid', {
    name: 'item_id',
  })
  itemId: string;

  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Column({
    name: 'owner_id',
    type: 'uuid',
  })
  ownerId: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  condition: string;

  @Column({
    name: 'condition_notes',
    type: 'text',
    nullable: true,
  })
  conditionNotes: string | null;

  @Column({
    type: 'enum',
    enum: InventoryAvailability,
    default: InventoryAvailability.AVAILABLE,
  })
  availability: InventoryAvailability;

  @Column({
    name: 'acquisition_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  acquisitionPrice: string | null;

  @Column({
    name: 'seller_photo_path',
    type: 'varchar',
    nullable: true,
  })
  sellerPhotoPath: string | null;

  @OneToMany(
    () => ListingItem,
    (listingItem) => listingItem.inventoryItem,
  )
  listingItems: ListingItem[];
}