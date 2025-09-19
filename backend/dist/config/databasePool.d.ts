import { DataSource } from 'typeorm';
export declare const OptimizedDataSource: DataSource;
export declare class DatabasePool {
    private static instance;
    private static connectionPromise;
    static getConnection(): Promise<DataSource>;
    private static connect;
    private static warmUpConnections;
    static closeConnection(): Promise<void>;
}
export declare const getOptimizedConnection: () => Promise<DataSource>;
//# sourceMappingURL=databasePool.d.ts.map