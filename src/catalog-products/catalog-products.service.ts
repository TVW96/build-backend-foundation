import { Injectable } from '@nestjs/common';
import { CreateCatalogProductDto } from './dto/create-catalog-product.dto';
import { UpdateCatalogProductDto } from './dto/update-catalog-product.dto';

@Injectable()
export class CatalogProductsService {
  create(createCatalogProductDto: CreateCatalogProductDto) {
    return 'This action adds a new catalogProduct';
  }

  findAll() {
    return `This action returns all catalogProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} catalogProduct`;
  }

  update(id: number, updateCatalogProductDto: UpdateCatalogProductDto) {
    return `This action updates a #${id} catalogProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} catalogProduct`;
  }
}
