import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { InventoryStatus } from '../../../generated/prisma/client';

export class CreateInventoryItemDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  ownerId!: string;

  @IsString()
  @MaxLength(50)
  condition!: string;

  @IsOptional()
  @IsString()
  conditionNotes?: string | null;

  @IsOptional()
  @IsEnum(InventoryStatus)
  availability?: InventoryStatus;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  acquisitionPrice?: number | null;
}
