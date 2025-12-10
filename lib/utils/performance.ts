/**
 * Performance monitoring utilities
 * Helps track slow operations and database queries
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private slowQueryThreshold = 1000; // 1 second

  /**
   * Start timing an operation
   * Returns a function to stop timing
   */
  startTimer(operation: string, metadata?: Record<string, any>) {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date(),
        metadata,
      });

      // Log slow operations
      if (duration > this.slowQueryThreshold) {
        console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms`, metadata);
      }

      return duration;
    };
  }

  /**
   * Time an async function
   */
  async timeAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; duration: number }> {
    const stopTimer = this.startTimer(operation, metadata);
    const result = await fn();
    const duration = stopTimer();
    
    return { result, duration };
  }

  /**
   * Time a synchronous function
   */
  timeSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): { result: T; duration: number } {
    const stopTimer = this.startTimer(operation, metadata);
    const result = fn();
    const duration = stopTimer();
    
    return { result, duration };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsForOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.operation === operation);
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(threshold: number = this.slowQueryThreshold): PerformanceMetric[] {
    return this.metrics.filter((m) => m.duration > threshold);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalOperations: number;
    averageDuration: number;
    slowOperations: number;
    operationBreakdown: Record<string, {
      count: number;
      totalDuration: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
    }>;
  } {
    const totalOperations = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalOperations > 0 ? totalDuration / totalOperations : 0;
    const slowOperations = this.metrics.filter(
      (m) => m.duration > this.slowQueryThreshold
    ).length;

    // Calculate per-operation stats
    const operationBreakdown: Record<string, {
      count: number;
      totalDuration: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
    }> = {};

    this.metrics.forEach((metric) => {
      if (!operationBreakdown[metric.operation]) {
        operationBreakdown[metric.operation] = {
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          maxDuration: 0,
          minDuration: Infinity,
        };
      }

      const stats = operationBreakdown[metric.operation];
      stats.count++;
      stats.totalDuration += metric.duration;
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
      stats.minDuration = Math.min(stats.minDuration, metric.duration);
    });

    // Calculate averages
    Object.values(operationBreakdown).forEach((stats) => {
      stats.avgDuration = stats.totalDuration / stats.count;
    });

    return {
      totalOperations,
      averageDuration: Math.round(averageDuration * 100) / 100,
      slowOperations,
      operationBreakdown,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(milliseconds: number): void {
    this.slowQueryThreshold = milliseconds;
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor();

/**
 * Decorator to automatically time async functions
 * Usage: const result = await measurePerformance('operationName', async () => { ... });
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const { result } = await perfMonitor.timeAsync(operation, fn, metadata);
  return result;
}

/**
 * Get a performance summary report
 */
export function getPerformanceReport(): string {
  const stats = perfMonitor.getStats();
  
  let report = "=== Performance Report ===\n\n";
  report += `Total Operations: ${stats.totalOperations}\n`;
  report += `Average Duration: ${stats.averageDuration.toFixed(2)}ms\n`;
  report += `Slow Operations: ${stats.slowOperations}\n\n`;
  
  report += "=== Operation Breakdown ===\n\n";
  
  // Sort by total duration (descending)
  const sortedOps = Object.entries(stats.operationBreakdown)
    .sort(([, a], [, b]) => b.totalDuration - a.totalDuration);
  
  sortedOps.forEach(([operation, opStats]) => {
    report += `${operation}:\n`;
    report += `  Count: ${opStats.count}\n`;
    report += `  Avg: ${opStats.avgDuration.toFixed(2)}ms\n`;
    report += `  Min: ${opStats.minDuration.toFixed(2)}ms\n`;
    report += `  Max: ${opStats.maxDuration.toFixed(2)}ms\n`;
    report += `  Total: ${opStats.totalDuration.toFixed(2)}ms\n\n`;
  });
  
  return report;
}

/**
 * Log performance report to console
 */
export function logPerformanceReport(): void {
  console.log(getPerformanceReport());
}
