import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../database/prisma.service';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

describe('ListingsController', () => {
  let controller: ListingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [ListingsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    controller = module.get<ListingsController>(ListingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
