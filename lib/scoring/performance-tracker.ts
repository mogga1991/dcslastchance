/**
 * Performance tracking for property-opportunity matching
 * 🚀 PERF-004: Instrumentation and observability
 */

import type { MatchStats } from './match-properties';

export interface ChunkMetric {
  chunkIndex: number;
  propertiesInChunk: number;
  durationMs: number;
  avgMsPerProperty: number;
  memoryUsageMB: number;
}

export interface PerformanceMetrics {
  totalDurationMs: number;
  propertiesPerSecond: number;
  opportunitiesProcessedPerSecond: number;
  calculationsPerSecond: number;

  chunkMetrics: ChunkMetric[];

  earlyTerminationRate: number;
  memoryUsageMB: number;
  peakMemoryUsageMB: number;
}

interface ChunkTrackingData {
  chunkIndex: number;
  propertiesCount: number;
  startTime: number;
  startMemory: number;
}

export class PerformanceTracker {
  private startTime: number;
  private startMemory: number;
  private chunkMetrics: ChunkMetric[] = [];
  private peakMemory: number = 0;

  constructor() {
    this.startTime = Date.now();
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    this.startMemory = memUsage;
    this.peakMemory = memUsage;
  }

  /**
   * Start tracking a chunk
   */
  startChunk(chunkIndex: number, propertiesCount: number): ChunkTrackingData {
    const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    if (currentMemory > this.peakMemory) {
      this.peakMemory = currentMemory;
    }

    return {
      chunkIndex,
      propertiesCount,
      startTime: Date.now(),
      startMemory: currentMemory,
    };
  }

  /**
   * End tracking a chunk and record metrics
   */
  endChunk(chunkData: ChunkTrackingData): void {
    const duration = Date.now() - chunkData.startTime;
    const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    if (currentMemory > this.peakMemory) {
      this.peakMemory = currentMemory;
    }

    this.chunkMetrics.push({
      chunkIndex: chunkData.chunkIndex,
      propertiesInChunk: chunkData.propertiesCount,
      durationMs: duration,
      avgMsPerProperty: chunkData.propertiesCount > 0 ? duration / chunkData.propertiesCount : 0,
      memoryUsageMB: currentMemory,
    });
  }

  /**
   * Calculate final performance metrics
   */
  getMetrics(stats: MatchStats): PerformanceMetrics {
    const totalDuration = Date.now() - this.startTime;
    const propertiesCount = this.chunkMetrics.reduce((sum, c) => sum + c.propertiesInChunk, 0);
    const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    if (currentMemory > this.peakMemory) {
      this.peakMemory = currentMemory;
    }

    return {
      totalDurationMs: totalDuration,
      propertiesPerSecond: totalDuration > 0 ? (propertiesCount / totalDuration) * 1000 : 0,
      opportunitiesProcessedPerSecond: totalDuration > 0 ? (stats.processed / totalDuration) * 1000 : 0,
      calculationsPerSecond: totalDuration > 0 ? ((stats.processed - stats.earlyTerminated) / totalDuration) * 1000 : 0,

      chunkMetrics: this.chunkMetrics,

      earlyTerminationRate: stats.processed > 0 ? stats.earlyTerminated / stats.processed : 0,
      memoryUsageMB: currentMemory,
      peakMemoryUsageMB: this.peakMemory,
    };
  }

  /**
   * Log performance metrics to console
   */
  logMetrics(metrics: PerformanceMetrics, stats: MatchStats): void {
    console.log(`
🎯 Performance Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Performance:
  Total Duration: ${metrics.totalDurationMs}ms
  Properties/sec: ${metrics.propertiesPerSecond.toFixed(2)}
  Opportunities/sec: ${metrics.opportunitiesProcessedPerSecond.toFixed(2)}
  Calculations/sec: ${metrics.calculationsPerSecond.toFixed(2)}

Memory:
  Current: ${metrics.memoryUsageMB.toFixed(2)} MB
  Peak: ${metrics.peakMemoryUsageMB.toFixed(2)} MB
  Delta: ${(metrics.peakMemoryUsageMB - this.startMemory).toFixed(2)} MB

Efficiency:
  Early Termination Rate: ${(metrics.earlyTerminationRate * 100).toFixed(1)}%
  Matches Found: ${stats.matched}
  Computation Saved: ${stats.processed > 0 ? Math.round((stats.earlyTerminated / stats.processed) * 100) : 0}%

Chunk Performance:
${this.formatChunkMetrics(metrics.chunkMetrics)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  /**
   * Format chunk metrics for logging
   */
  private formatChunkMetrics(chunks: ChunkMetric[]): string {
    if (chunks.length === 0) return '  No chunks processed';

    if (chunks.length <= 5) {
      // Show all chunks if there are 5 or fewer
      return chunks
        .map(c =>
          `  Chunk ${c.chunkIndex + 1}: ${c.durationMs}ms (${c.avgMsPerProperty.toFixed(1)}ms/prop, ${c.memoryUsageMB.toFixed(1)}MB)`
        )
        .join('\n');
    } else {
      // Show summary if more than 5 chunks
      const totalChunks = chunks.length;
      const avgDuration = chunks.reduce((sum, c) => sum + c.durationMs, 0) / totalChunks;
      const avgPerProperty = chunks.reduce((sum, c) => sum + c.avgMsPerProperty, 0) / totalChunks;
      const avgMemory = chunks.reduce((sum, c) => sum + c.memoryUsageMB, 0) / totalChunks;
      const slowestChunk = chunks.reduce((max, c) => c.durationMs > max.durationMs ? c : max, chunks[0]);
      const fastestChunk = chunks.reduce((min, c) => c.durationMs < min.durationMs ? c : min, chunks[0]);

      return `  Total Chunks: ${totalChunks}
  Average: ${avgDuration.toFixed(1)}ms/chunk (${avgPerProperty.toFixed(1)}ms/prop, ${avgMemory.toFixed(1)}MB)
  Fastest: Chunk ${fastestChunk.chunkIndex + 1} (${fastestChunk.durationMs}ms)
  Slowest: Chunk ${slowestChunk.chunkIndex + 1} (${slowestChunk.durationMs}ms)`;
    }
  }
}
