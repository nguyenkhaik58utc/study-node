import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthMiddleware, LoggerMiddleware, TimeLoggerMiddleware } from '../../common/middleware/product.middleware';
import { ProdTokenConfigService, SandboxTokenConfigService } from '../token/token-config.interface';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from '../../s3/s3.service';

@Module({
   imports: [ConfigModule],
  controllers: [ProductController],
  providers: [ProductService, S3Service,
    {
      provide: 'TOKEN_CONFIG',
      useClass: process.env.NODE_ENV === 'production'
        ? ProdTokenConfigService
        : SandboxTokenConfigService,
    }],
})
export class ProductModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware, TimeLoggerMiddleware)
      .forRoutes('*'); 
  }
}
