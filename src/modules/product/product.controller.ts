import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from './entities/product.model';
import { TimeGuard } from '../../common/guards/product.guards';
import { LoggingInterceptor } from '../../common/interceptors/product.interceptors';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { S3Service } from './../../s3/s3.service';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Response } from 'express';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('products')
@Controller('products')
export class ProductController {
  private s3 = new S3Client({ region: process.env.AWS_REGION });
  constructor(
    private readonly service: ProductService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm trả về thành công.',
  })
  @UseGuards(TimeGuard)
  @UseInterceptors(LoggingInterceptor)
  @UseFilters(HttpExceptionFilter)
  async findAll() {
    return this.service.loadProductsFromFile();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy sản phẩm theo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tìm thấy sản phẩm.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const found = await this.service.getProductById(id);
    if (!found) throw new NotFoundException('Product not found');
    return found;
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới sản phẩm' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Tạo thành công.' })
  async create(@Body(new ValidationPipe()) dto: CreateProductDto) {
    console.log('CreateProductDto', dto);
    const existing = await this.service.getProductById(dto.id);
    if (existing) {
      throw new ConflictException(`Product with id ${dto.id} already exists`);
    }
    const p = new Product(dto.id, dto.name, (dto.price2 * 1.1).toFixed() as unknown as number, dto.price2, dto.quanlity, "");
    await this.service.addProduct(p);
    return { message: 'created', id: dto.id };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) dto: UpdateProductDto,
  ) {
    const existing = await this.service.getProductById(id);
    if (!existing) throw new NotFoundException('Product not found');

    const name = dto.name ?? existing.Name;
    const price2 = dto.price2 ?? existing.price2Value;
    const price1 = (price2 * 1.1).toFixed() as unknown as number;
    const quanlity = dto.quanlity ?? existing.quanlity;
    const imageurl = dto.imageUrl ?? existing.imageUrlValue;

    const updated = new Product(id, name, price1, price2, quanlity, imageurl);
    const ok = await this.service.updateProduct(updated);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.service.saveProductsToFile(await this.service.getAllProduct());
    return { updated: ok };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const ok = await this.service.removeProduct(id);
    if (!ok) throw new NotFoundException('Product not found');
    return { deleted: true };
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload ảnh cho sản phẩm' })
  @ApiParam({ name: 'id', type: Number })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const product = await this.service.getProductById(id);
    if (!product) throw new NotFoundException('Product not found');

    const result = await this.s3Service.uploadFile(
      file,
      process.env.AWS_S3_BUCKET!,
    );
    product.imageUrlValue = result.url;
    await this.service.updateProduct(product);

    return {
      message: 'Upload thành công',
      file: file.filename,
      url: product.imageUrlValue,
    };
  }

  @Get(':id/image')
  @ApiOperation({ summary: 'Tải ảnh sản phẩm (private từ S3)' })
  @ApiParam({ name: 'id', type: Number })
  async downloadImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const product = await this.service.getProductById(id);
    if (!product?.imageUrlValue) {
      throw new NotFoundException('Image not found');
    }
    const filename: string = product.imageUrlValue.split('/').pop()!;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: product.imageUrlValue,
    });

    try {
      const s3Response = await this.s3.send(command);
      const stream = s3Response.Body as any;

      res.setHeader(
        'Content-Type',
        s3Response.ContentType || 'application/octet-stream',
      );
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${product.imageUrlValue.split('/').pop()}"`,
      );

      stream.pipe(res);
      const localPath = join(process.cwd(), 'uploads', 'products', filename);

      const fileWriter = createWriteStream(localPath);

      await new Promise((resolve, reject) => {
        stream.pipe(fileWriter).on('finish', resolve).on('error', reject);
      });

      return res.sendFile(localPath);
    } catch (err) {
      throw new NotFoundException('File not found in S3:' + err.message);
    }
  }
}
