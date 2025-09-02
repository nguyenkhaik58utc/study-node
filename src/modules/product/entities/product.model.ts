import { PositiveNumber } from "src/common/decorators/product.decorator";

export type ID = number;

export interface IProduct {
  getInfo(): string;
}

export class Base {
  Id: ID;
  Name: string;
  constructor(id: number, name: string) {
    this.Id = id;
    this.Name = name;
  }
}

export class Product extends Base implements IProduct {
  @PositiveNumber
  public quanlity: number = 0;
  private price1: number;
  #price2: number;
  private imageUrl: string;

  constructor(id: number, name: string, price1: number, price2: number) {
    super(id, name);
    this.price1 = price1;
    this.#price2 = price2;
  }

  get price1Value(): number {
    return this.price1;
  }
  set price1Value(value: number) {
    this.price1 = value;
  }

  get price2Value(): number {
    return this.#price2;
  }
  set price2Value(value: number) {
    this.#price2 = value;
  }

  get imageUrlValue(): string {
    return this.imageUrl;
  }
  set imageUrlValue(value: string) {
    this.imageUrl = value;
  }

  getInfo(): string {
    return `${this.Name}`;
  }
}
