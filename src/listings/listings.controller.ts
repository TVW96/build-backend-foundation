import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { CreateListingDto } from './dto/create-listing.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
  ) {}

  @Post('seller/:sellerId')
  create(
    @Param('sellerId') sellerId: string,
    @Body() createListingDto: CreateListingDto,
  ) {
    return this.listingsService.create(sellerId, createListingDto);
  }

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  @Get(':listingId')
  findOne(@Param('listingId') listingId: string) {
    return this.listingsService.findOne(listingId);
  }

  @Delete(':listingId/items/:itemId')
  removeItem(
    @Param('listingId') listingId: string,
    @Param('itemId') itemId: string,
  ) {
    // Temporary value until authentication is implemented.
    const sellerId = '00000000-0000-4000-8000-000000000001';

    return this.listingsService.removeItem(
      listingId,
      itemId,
      sellerId,
    );
  }
}