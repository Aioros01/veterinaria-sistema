import * as dotenv from 'dotenv';

dotenv.config();

// Mock Redis Cache - No actual Redis connection
class RedisCache {
  private defaultTTL: number = 3600;
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();

  constructor() {
    // No Redis connection - using in-memory cache
    console.log('📦 Using in-memory cache (Redis disabled for performance)');
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = this.memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    this.memoryCache.delete(key);
    return null;
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  async flush(): Promise<void> {
    this.memoryCache.clear();
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }

  async close(): Promise<void> {
    this.memoryCache.clear();
  }
}

export const cache = new RedisCache();

export const CacheKeys = {
  USER: (id: string) => `user:${id}`,
  PET: (id: string) => `pet:${id}`,
  PETS_BY_OWNER: (ownerId: string) => `pets:owner:${ownerId}`,
  APPOINTMENTS: (date: string) => `appointments:${date}`,
  APPOINTMENT: (id: string) => `appointment:${id}`,
  MEDICAL_HISTORY: (petId: string) => `medical_history:${petId}`,
  VACCINATIONS: (petId: string) => `vaccinations:${petId}`,
  INVENTORY: () => 'inventory:all',
  MEDICINE: (id: string) => `medicine:${id}`,
  DASHBOARD_STATS: (userId: string) => `dashboard:${userId}`
};