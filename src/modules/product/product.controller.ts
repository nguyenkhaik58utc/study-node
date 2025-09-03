import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Res, UploadedFile, UseFilters, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from './entities/product.model';
import { TimeGuard } from '../../common/guards/product.guards';
import { LoggingInterceptor } from '../../common/interceptors/product.interceptors';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';


@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm trả về thành công.' })
  @UseGuards(TimeGuard)
  @UseInterceptors(LoggingInterceptor)
  @UseFilters(HttpExceptionFilter)
  async findAll() {
    return this.service.getAllProduct();
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
    const existing = await this.service.getProductById(dto.id);
    if (existing) {
      throw new ConflictException(`Product with id ${dto.id} already exists`);
    }
    const p = new Product(dto.id, dto.name, dto.price1, dto.price2);
    await this.service.addProduct(p);
    return { message: 'created', id: dto.id };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) dto: UpdateProductDto) {
    const existing = await this.service.getProductById(id);
    if (!existing) throw new NotFoundException('Product not found');

    const name = dto.name ?? existing.Name;
    const price1 = dto.price1 ?? existing.price1Value;
    const price2 = dto.price2 ?? existing.price2Value;

    const updated = new Product(id, name, price1, price2);
    const ok = await this.service.updateProduct(updated);
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
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    }
  })
}))
async uploadFile(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  const product = await this.service.getProductById(id);
  if (!product) throw new NotFoundException('Product not found');

  product.imageUrlValue = `/uploads/products/${file.filename}`;
  await this.service.updateProduct(product);

  return {
    message: 'Upload thành công',
    file: file.filename,
    url: product.imageUrlValue,
  };
}
@Get(':id/image')
@ApiOperation({ summary: 'Tải ảnh sản phẩm' })
@ApiParam({ name: 'id', type: Number })
async downloadImage(@Param('id', ParseIntPipe) id: number, @Res() res) {
  const product = await this.service.getProductById(id);
  if (!product || !product.imageUrlValue) throw new NotFoundException('Image not found');

  return res.sendFile(product.imageUrlValue, { root: '.' });
}

}
