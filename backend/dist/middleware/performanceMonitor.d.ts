import { Request, Response, NextFunction } from 'express';
export declare class PerformanceMonitor {
    private static formatTime;
    private static getTimestamp;
    static middleware(): (req: Request, res: Response, next: NextFunction) => void;
    static logDatabaseQuery(query: string, duration: number): void;
}
export declare function measureAsync<T>(operation: string, fn: () => Promise<T>, requestId?: string): Promise<T>;
//# sourceMappingURL=performanceMonitor.d.ts.map