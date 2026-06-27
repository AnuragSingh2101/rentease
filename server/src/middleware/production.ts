import { Request, Response, NextFunction } from 'express';


const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 300;

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const ipData = ipRequestMap.get(ip);

  if (!ipData) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (now > ipData.resetTime) {
    ipData.count = 1;
    ipData.resetTime = now + LIMIT_WINDOW_MS;
    next();
    return;
  }

  ipData.count++;
  if (ipData.count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    });
    return;
  }

  next();
};


export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
};


export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
};
