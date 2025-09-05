import { Inject, Injectable } from '@nestjs/common';
import { Product } from './entities/product.model';
import { delay } from '../../common/utils/product.util';
import type { TokenConfig } from '../token/token-config.interface';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { promises as fs } from 'fs';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductService {
  private products: Product[] = [];

  constructor(
    @Inject('TOKEN_CONFIG') private config: TokenConfig,
    private configService: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.loadProductsFromFile().then((products) => {
      this.products = products;
    });
  }
  private getFilePath() {
    return join(process.cwd(), 'uploads', 'products', 'product.txt');
  }

  async loadProductsFromFile(): Promise<Product[]> {
    const filePath = this.getFilePath();

    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(this.getFilePath().replace(/product\.txt$/, ''), {
        recursive: true,
      });
      await fs.writeFile(filePath, '', 'utf-8');
      this.products = [];
      return this.products;
    }

    const content = await fs.readFile(this.getFilePath(), 'utf-8');

    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');

    this.products = lines.map((line) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [id, Name, quanlity, price1, price2, imageUrl] = line.split('/');
      const product = new Product(
        Number(id),
        Name,
        Number(price1).toFixed() as unknown as number,
        Number(price2).toFixed() as unknown as number,
        Number(quanlity),
        String(imageUrl)
      );
      return product;
    });
    return this.products.map(p => plainToInstance(Product, p));
  }

  async saveProductsToFile(products: Product[]): Promise<void> {
    const filePath = this.getFilePath();
    console.log('products', this.products);

    const content = products
      .map(
        (p) =>
          `${p.Id}/${p.Name}/${p.quanlity}/${p.price1Value}/${p.price2Value}/${p.imageUrlValue ?? ''}`,
      )
      .join('\n');

    await fs.writeFile(filePath, content, 'utf-8');
    this.products = products;
  }

  async addProduct(product: Product): Promise<void> {
    await delay(1000);
    this.products.push(product);
    await this.saveProductsToFile(this.products);
  }

  async getAllProduct(): Promise<Product[]> {
    console.log(`key=${this.config.apiKey}, secret=${this.config.secret}`);
    const apiKey = this.configService.get<string>('API_KEY');
    const secret = this.configService.get<string>('SECRET');
    console.log(`with key=${apiKey}, secret=${secret}`);
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
      product.price2Value = productDTO.price2Value;
      product.quanlity = 0;
      product.imageUrlValue = productDTO.imageUrlValue;
      await this.saveProductsToFile(this.products);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
