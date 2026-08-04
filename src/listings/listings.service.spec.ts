import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { InventoryStatus, ListingStatus } from '../../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  let service: ListingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateRequestedItems', () => {
    const sellerId = 'seller-1';

    const buildItem = (
      overrides: Partial<{
        itemId: string;
        ownerId: string;
        availability: InventoryStatus;
      }> = {},
    ) => ({
      itemId: 'item-1',
      ownerId: sellerId,
      availability: InventoryStatus.AVAILABLE,
      ...overrides,
    });

    const invoke = (
      items: ReturnType<typeof buildItem>[],
      requestedItemIds: string[],
    ) =>
      (
        service as unknown as {
          validateRequestedItems: (
            inventoryItems: ReturnType<typeof buildItem>[],
            requestedItemIds: string[],
            sellerId: string,
          ) => void;
        }
      ).validateRequestedItems(items, requestedItemIds, sellerId);

    it('does not throw when all requested items exist, are owned, and available', () => {
      const items = [buildItem(), buildItem({ itemId: 'item-2' })];

      expect(() => invoke(items, ['item-1', 'item-2'])).not.toThrow();
    });

    it('throws when one or more requested items do not exist', () => {
      const items = [buildItem()];

      expect(() => invoke(items, ['item-1', 'item-2'])).toThrow(
        BadRequestException,
      );
    });

    it('throws when an item is not owned by the seller', () => {
      const items = [buildItem({ ownerId: 'another-seller' })];

      expect(() => invoke(items, ['item-1'])).toThrow(BadRequestException);
    });

    it('throws when an item is unavailable', () => {
      const items = [buildItem({ availability: InventoryStatus.RESERVED })];

      expect(() => invoke(items, ['item-1'])).toThrow(BadRequestException);
    });
  });

  describe('findOneWithRelations', () => {
    it('throws NotFoundException when listing is missing', async () => {
      const findUnique = jest.fn().mockResolvedValue(null);

      const mockedService = service as unknown as {
        prisma: { listing: { findUnique: typeof findUnique } };
        findOneWithRelations: (listingId: string) => Promise<unknown>;
      };

      mockedService.prisma = { listing: { findUnique } };

      await expect(
        mockedService.findOneWithRelations('missing-listing'),
      ).rejects.toThrow(NotFoundException);

      expect(findUnique).toHaveBeenCalled();
    });
  });

  describe('create payload mapping', () => {
    it('sets listing defaults and formats price to two decimals', async () => {
      const createListingDto: CreateListingDto = {
        title: 'Example Listing',
        itemIds: ['item-1'],
        price: 42,
      };

      const inventoryItems = [
        {
          itemId: 'item-1',
          ownerId: 'seller-1',
          availability: InventoryStatus.AVAILABLE,
        },
      ];

      const listingCreate = jest
        .fn()
        .mockResolvedValue({ listingId: 'listing-1' });
      const listingFindUnique = jest
        .fn()
        .mockResolvedValue({ listingId: 'listing-1' });
      const listingItemCreateMany = jest
        .fn()
        .mockResolvedValue({ count: inventoryItems.length });
      const inventoryItemFindMany = jest
        .fn()
        .mockResolvedValue(inventoryItems);
      const inventoryItemUpdateMany = jest
        .fn()
        .mockResolvedValue({ count: inventoryItems.length });

      const tx = {
        $queryRaw: jest.fn().mockResolvedValue(undefined),
        listing: {
          create: listingCreate,
          findUnique: listingFindUnique,
        },
        listingItem: {
          createMany: listingItemCreateMany,
        },
        inventoryItem: {
          findMany: inventoryItemFindMany,
          updateMany: inventoryItemUpdateMany,
        },
      };

      const mockedService = service as unknown as {
        prisma: {
          $transaction: (
            callback: (tx: unknown) => Promise<unknown>,
          ) => Promise<unknown>;
        };
      };

      mockedService.prisma = {
        $transaction: (callback) => callback(tx),
      };

      await service.create('seller-1', createListingDto);

      expect(listingCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sellerId: 'seller-1',
            title: 'Example Listing',
            description: null,
            price: '42.00',
            status: ListingStatus.ACTIVE,
          }),
        }),
      );
    });
  });
});

