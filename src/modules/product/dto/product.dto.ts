import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive, IsDefined } from 'class-validator';

export class CreateProductDto {

  @ApiProperty({ example: 'Laptop Gaming' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  @IsDefined()
  quanlity!: number

  @ApiProperty({ example: 1599.99 })
  @IsNumber()
  @IsPositive()
  @IsDefined()
  price1!: number;

  @ApiProperty({ example: 1699.99 })
  @IsNumber()
  @IsPositive()
  @IsDefined()
  price2!: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  imageUrl: string;
}
