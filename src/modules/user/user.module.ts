// src/user/user.module.ts
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerMiddleware, TimeLoggerMiddleware } from 'src/common/middleware/common.middleware';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(LoggerMiddleware, AuthMiddleware, TimeLoggerMiddleware)
        .forRoutes(UserController);
    }
}
