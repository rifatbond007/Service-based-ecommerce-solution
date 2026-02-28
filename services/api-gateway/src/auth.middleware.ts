import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly publicPaths = [
    '/api/users',
    '/api/auth/login',
    '/api/auth/register',
    '/api/products',
    '/api/health',
    '/health',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;

    if (this.isPublicPath(path, req.method)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Unauthorized - No token provided', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production');
      (req as any).user = decoded;
      next();
    } catch (error) {
      throw new HttpException('Unauthorized - Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  private isPublicPath(path: string, method: string): boolean {
    if (method === 'GET' && path.startsWith('/api/products')) {
      return true;
    }
    return this.publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(publicPath + '/')
    );
  }
}
