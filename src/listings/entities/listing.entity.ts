import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ListingItem } from './listing-item.entity';

export enum ListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'listings' })
export class Listing {
  @PrimaryGeneratedColumn('uuid', {
    name: 'listing_id',
  })
  listingId: string;

  @Column({
    name: 'seller_id',
    type: 'uuid',
  })
  sellerId: string;

  @Column({
    type: 'varchar',
    length: 160,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  price: string;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.DRAFT,
  })
  status: ListingStatus;

  @OneToMany(() => ListingItem, (listingItem) => listingItem.listing)
  listingItems: ListingItem[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}