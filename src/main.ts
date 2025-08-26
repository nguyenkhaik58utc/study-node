import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ProductModule } from './modules/product/product.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('CRUD Product (in-memory) với Swagger')
    .setVersion('1.0.0')
    .addTag('products')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(3000);
  console.log(`🚀 Server chạy: http://localhost:3000`);
  console.log(`📘 Swagger:     http://localhost:3000/api`);
}
bootstrap();
