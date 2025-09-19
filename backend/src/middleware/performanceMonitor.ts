import { Request, Response, NextFunction } from 'express';

interface TimingLog {
  timestamp: string;
  message: string;
  duration?: number;
}

export class PerformanceMonitor {
  private static formatTime(ms: number): string {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  private static getTimestamp(): string {
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const requestId = Math.random().toString(36).substring(7);
      const method = req.method;
      const url = req.url;
      
      // Attach timing info to request
      (req as any).requestId = requestId;
      (req as any).startTime = startTime;
      (req as any).timings = [] as TimingLog[];
      
      // Log request start
      console.log(`\n${'='.repeat(80)}`);
      console.log(`${this.getTimestamp()} 🚀 REQUEST START [${requestId}]`);
      console.log(`📍 ${method} ${url}`);
      console.log(`⏰ Start Time: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(80)}`);
      
      // Helper function to log timing
      (req as any).logTiming = (message: string) => {
        const now = performance.now();
        const elapsed = now - startTime;
        const log: TimingLog = {
          timestamp: this.getTimestamp(),
          message,
          duration: elapsed
        };
        (req as any).timings.push(log);
        console.log(`${log.timestamp} ⏱️  [${requestId}] ${message} | Elapsed: ${this.formatTime(elapsed)}`);
      };
      
      // Override res.json to log response time
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        console.log(`\n${'-'.repeat(80)}`);
        console.log(`${PerformanceMonitor.getTimestamp()} ✅ REQUEST COMPLETE [${requestId}]`);
        console.log(`📊 Total Time: ${PerformanceMonitor.formatTime(totalTime)}`);
        
        // Show timing breakdown
        if ((req as any).timings && (req as any).timings.length > 0) {
          console.log(`\n📈 Timing Breakdown:`);
          let lastTime = 0;
          (req as any).timings.forEach((timing: TimingLog, index: number) => {
            const stepTime = timing.duration! - lastTime;
            console.log(`   ${index + 1}. ${timing.message}: ${PerformanceMonitor.formatTime(stepTime)}`);
            lastTime = timing.duration!;
          });
        }
        
        // Warnings for slow requests
        if (totalTime > 1000) {
          console.log(`\n⚠️  WARNING: Slow request detected! (${PerformanceMonitor.formatTime(totalTime)})`);
        }
        
        console.log(`${'='.repeat(80)}\n`);
        
        return originalJson(data);
      };
      
      next();
    };
  }
  
  static logDatabaseQuery(query: string, duration: number) {
    console.log(`${this.getTimestamp()} 🗄️  DB Query: ${query.substring(0, 100)}... | Time: ${this.formatTime(duration)}`);
    
    if (duration > 100) {
      console.log(`   ⚠️  Slow query detected!`);
    }
  }
}

// Export a function to measure async operations
export function measureAsync<T>(
  operation: string, 
  fn: () => Promise<T>,
  requestId?: string
): Promise<T> {
  const start = performance.now();
  console.log(`${PerformanceMonitor['getTimestamp']()} ⏱️  [${requestId || 'system'}] Starting: ${operation}`);
  
  return fn().then(
    (result) => {
      const duration = performance.now() - start;
      console.log(`${PerformanceMonitor['getTimestamp']()} ✅ [${requestId || 'system'}] Completed: ${operation} | Time: ${PerformanceMonitor['formatTime'](duration)}`);
      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      console.log(`${PerformanceMonitor['getTimestamp']()} ❌ [${requestId || 'system'}] Failed: ${operation} | Time: ${PerformanceMonitor['formatTime'](duration)}`);
      throw error;
    }
  );
}