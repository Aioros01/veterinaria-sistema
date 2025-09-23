declare class KeepAwakeService {
    private intervalId;
    private baseUrl;
    constructor();
    start(): void;
    private pingServer;
    stop(): void;
}
export declare const keepAwakeService: KeepAwakeService;
export {};
//# sourceMappingURL=keepAwake.d.ts.map