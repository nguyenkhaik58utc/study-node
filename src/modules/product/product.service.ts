import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { delay } from '../../common/utils/product.util';
import type { TokenConfig } from '../token/token-config.interface';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProductService {
  private products: Product[] = [];

  constructor(
    @Inject('TOKEN_CONFIG') private config: TokenConfig,
    private configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async addProduct(product: Product) {
    await delay(1000);
    this.products.push(product);
    const createdProduct = await this.prisma.product.create({
      data: {
        name: product.name,
        quanlity: product.quanlity,
        price1: product.price1,
        price2: product.price2,
        imageUrl: product.imageUrl ?? '',
        createdBy: product.createdBy,
      },
    });
    return createdProduct;
  }

  async getAllProduct() {
    return await this.prisma.product.findMany();
  }

  async getProductById(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async removeProduct(id: number) {
    return await this.prisma.product.delete({ where: { id } });
  }

  async updateProduct(id: number, productDTO: Partial<Product>) {
    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          name: productDTO.name,
          quanlity: productDTO.quanlity,
          price1: productDTO.price1,
          price2: productDTO.price2,
          imageUrl: productDTO.imageUrl ?? '',
          updatedBy: productDTO.updatedBy,
        },
      });
      return { success: true, updated };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return { success: false, message: 'Product not found' };
      }
      throw error;
    }
  }
}
