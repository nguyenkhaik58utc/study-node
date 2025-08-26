import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.model';
import { delay } from 'src/common/utils/product.util';

@Injectable()
export class ProductService {
  private products: Product[] = [];

  async addProduct(product: Product): Promise<void> {
    await delay(1000);
    this.products.push(product);
  }

  async getAllProduct(): Promise<Product[]> {
    return Promise.resolve(this.products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return Promise.resolve(this.products.find((x) => x.Id === id));
  }

  async removeProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex((x) => x.Id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async updateProduct(productDTO: Product): Promise<boolean> {
    await delay(1000);
    const product = this.products.find((x) => x.Id === productDTO.Id);
    if (product) {
      product.Name = productDTO.Name;
      product.price1Value = productDTO.price1Value;
      product.price2Value = productDTO.price1Value;
      product.quanlity = 0;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
