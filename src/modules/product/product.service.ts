import { Inject, Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { delay } from '../../common/utils/product.util';
import type { TokenConfig } from '../token/token-config.interface';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  private products: Product[] = [];

  constructor(
    @Inject('TOKEN_CONFIG') private config: TokenConfig,
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
  }

  async addProduct(product: Product) {
    await delay(1000);
    this.products.push(product);
    await this.prisma.product.create({
      data: {
        name: product.name,
        quanlity: product.quanlity,
        price1: product.price1,
        price2: product.price2,
        imageUrl: product.imageUrl ?? '',
        createdBy: 2,
      },
    });
  }

  async getAllProduct() {
    console.log(`key=${this.config.apiKey}, secret=${this.config.secret}`);
    const apiKey = this.configService.get<string>('API_KEY');
    const secret = this.configService.get<string>('SECRET');
    console.log(`with key=${apiKey}, secret=${secret}`);
    this.products = await this.prisma.product.findMany();
  }

  async getProductById(id: number) {
    return this.prisma.product.findUnique({
      where: { id }
    });
  }

  async removeProduct(id: number) {
    return await this.prisma.product.delete({ where: { id } });
  }

  async updateProduct(id: number, productDTO: Product) {
    await this.prisma.product.update({
      where: { id },
      data: {
        name: productDTO.name,
        quanlity: productDTO.quanlity,
        price1: productDTO.price1,
        price2: productDTO.price2,
        imageUrl: productDTO.imageUrl ?? '',
        createdBy: 2,
      },
    });
  }
}
