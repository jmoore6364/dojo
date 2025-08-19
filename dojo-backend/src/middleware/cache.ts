import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cache.service';

interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  invalidateOn?: string[];
}

export const cache = (options: CacheOptions = {}) => {
  const { ttl = 300, keyPrefix = 'api' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cached = await cacheService.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Cache middleware error:', error);
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      cacheService.set(key, JSON.stringify(data), ttl).catch(err => {
        console.error('Failed to cache response:', err);
      });
      return originalJson(data);
    };

    next();
  };
};

export const invalidateCache = (patterns: string[]) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const pattern of patterns) {
        await cacheService.invalidatePattern(pattern);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
    next();
  };
};

export const clearUserCache = async (userId: string) => {
  await cacheService.invalidatePattern(`user:${userId}:*`);
  await cacheService.invalidatePattern(`api:*/users/${userId}*`);
};

export const clearOrganizationCache = async (orgId: string) => {
  await cacheService.invalidatePattern(`org:${orgId}:*`);
  await cacheService.invalidatePattern(`api:*/organizations/${orgId}*`);
};

export const clearSchoolCache = async (schoolId: string) => {
  await cacheService.invalidatePattern(`school:${schoolId}:*`);
  await cacheService.invalidatePattern(`api:*/schools/${schoolId}*`);
};