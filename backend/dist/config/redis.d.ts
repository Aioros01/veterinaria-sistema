declare class RedisCache {
    private defaultTTL;
    private memoryCache;
    constructor();
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    flush(): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    generateKey(...parts: string[]): string;
    close(): Promise<void>;
}
export declare const cache: RedisCache;
export declare const CacheKeys: {
    USER: (id: string) => string;
    PET: (id: string) => string;
    PETS_BY_OWNER: (ownerId: string) => string;
    APPOINTMENTS: (date: string) => string;
    APPOINTMENT: (id: string) => string;
    MEDICAL_HISTORY: (petId: string) => string;
    VACCINATIONS: (petId: string) => string;
    INVENTORY: () => string;
    MEDICINE: (id: string) => string;
    DASHBOARD_STATS: (userId: string) => string;
};
export {};
//# sourceMappingURL=redis.d.ts.map