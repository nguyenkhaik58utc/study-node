/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${req.method}] ${req.url}`);
    next();
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request & { headers: any }, res: Response, next: NextFunction) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  next();
}
}
