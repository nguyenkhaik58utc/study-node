import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthMiddleware, LoggerMiddleware, TimeLoggerMiddleware } from 'src/common/middleware/product.middleware';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware, TimeLoggerMiddleware)
      .forRoutes('*'); 
  }
}
