import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import {
  InventoryStatus,
  ListingStatus,
  ListingType,
  Prisma,
} from '../../generated/prisma/client';
import { CreateListingDto } from './dto/create-listing.dto';

const listingWithItemsInclude = {
  listingItems: { include: { inventoryItem: true } },
} satisfies Prisma.ListingInclude;

type ListingWithItems = Prisma.ListingGetPayload<{
  include: typeof listingWithItemsInclude;
}>;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    sellerId: string,
    createListingDto: CreateListingDto,
  ): Promise<ListingWithItems> {
    return this.prisma.$transaction(async (tx) => {
      // Lock the requested rows so a concurrent request cannot claim them
      // between the read and the update below.
      await tx.$queryRaw`
        SELECT item_id FROM inventory_items
        WHERE item_id = ANY(${createListingDto.itemIds}::uuid[])
        FOR UPDATE
      `;

      const inventoryItems = await tx.inventoryItem.findMany({
        where: { itemId: { in: createListingDto.itemIds } },
      });

      this.validateRequestedItems(
        inventoryItems,
        createListingDto.itemIds,
        sellerId,
      );

      const listing = await tx.listing.create({
        data: {
          sellerId,
          title: createListingDto.title,
          description: createListingDto.description ?? null,
          price: createListingDto.price.toFixed(2),
          status: ListingStatus.ACTIVE,
          listingType:
            inventoryItems.length > 1
              ? ListingType.BUNDLE
              : ListingType.SINGLE,
        },
      });

      await tx.listingItem.createMany({
        data: inventoryItems.map((inventoryItem) => ({
          listingId: listing.listingId,
          itemId: inventoryItem.itemId,
        })),
      });

      await tx.inventoryItem.updateMany({
        where: { itemId: { in: inventoryItems.map((item) => item.itemId) } },
        data: { availability: InventoryStatus.RESERVED },
      });

      return this.findOneWithRelations(listing.listingId, tx);
    });
  }

  async findAll(): Promise<ListingWithItems[]> {
    return this.prisma.listing.findMany({
      include: listingWithItemsInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(listingId: string): Promise<ListingWithItems> {
    return this.findOneWithRelations(listingId);
  }

  async removeItem(
    listingId: string,
    itemId: string,
    sellerId: string,
  ): Promise<ListingWithItems> {
    return this.prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findFirst({
        where: { listingId, sellerId },
        include: listingWithItemsInclude,
      });

      if (!listing) {
        throw new NotFoundException('Listing not found.');
      }

      if (listing.listingItems.length <= 1) {
        throw new BadRequestException(
          'A listing must contain at least one inventory item.',
        );
      }

      const listingItem = listing.listingItems.find(
        (currentListingItem) =>
          currentListingItem.inventoryItem.itemId === itemId,
      );

      if (!listingItem) {
        throw new NotFoundException(
          'The inventory item is not part of this listing.',
        );
      }

      await tx.listingItem.delete({
        where: { listingItemId: listingItem.listingItemId },
      });

      await tx.inventoryItem.update({
        where: { itemId: listingItem.inventoryItem.itemId },
        data: { availability: InventoryStatus.AVAILABLE },
      });

      return this.findOneWithRelations(listingId, tx);
    });
  }

  private async findOneWithRelations(
    listingId: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<ListingWithItems> {
    const listing = await client.listing.findUnique({
      where: { listingId },
      include: listingWithItemsInclude,
    });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    return listing;
  }

  private validateRequestedItems(
    inventoryItems: Array<{
      itemId: string;
      ownerId: string;
      availability: InventoryStatus;
    }>,
    requestedItemIds: string[],
    sellerId: string,
  ): void {
    if (inventoryItems.length !== requestedItemIds.length) {
      throw new BadRequestException(
        'One or more inventory items do not exist.',
      );
    }

    const itemNotOwnedBySeller = inventoryItems.find(
      (inventoryItem) => inventoryItem.ownerId !== sellerId,
    );

    if (itemNotOwnedBySeller) {
      throw new BadRequestException(
        'You may only list inventory items that you own.',
      );
    }

    const unavailableItem = inventoryItems.find(
      (inventoryItem) => inventoryItem.availability !== InventoryStatus.AVAILABLE,
    );

    if (unavailableItem) {
      throw new BadRequestException(
        `Inventory item ${unavailableItem.itemId} is not available.`,
      );
    }
  }
}
