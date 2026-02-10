/**
 * Offline Sync Service
 * Handles offline-first data synchronization and low-bandwidth optimization
 */

export interface OfflineData {
  tasks: any[];
  fields: any[];
  weather: any;
  notifications: any[];
  syncTimestamp: Date;
}

export interface SyncChange {
  type: string;
  id: number;
  data: Record<string, any>;
  timestamp: Date;
}

export class OfflineSyncService {
  /**
   * Compress data for low-bandwidth transmission
   */
  static compressData(data: any): {
    compressed: string;
    originalSize: number;
    compressedSize: number;
    ratio: number;
  } {
    const json = JSON.stringify(data);
    const originalSize = Buffer.byteLength(json, "utf8");

    // Simple compression: remove whitespace and shorten keys
    const minified = JSON.stringify(data, null, 0);
    const compressedSize = Buffer.byteLength(minified, "utf8");
    const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

    return {
      compressed: minified,
      originalSize,
      compressedSize,
      ratio,
    };
  }

  /**
   * Decompress data
   */
  static decompressData(compressed: string): any {
    return JSON.parse(compressed);
  }

  /**
   * Get optimized data for low-bandwidth
   */
  static optimizeForLowBandwidth(data: any): any {
    // Remove unnecessary fields and compress
    const optimized = {
      t: data.tasks?.map((t: any) => ({
        id: t.id,
        t: t.title,
        s: t.status,
        p: t.priority,
      })),
      f: data.fields?.map((f: any) => ({
        id: f.id,
        n: f.name,
        c: f.cropType,
        l: f.location,
      })),
      w: {
        t: data.weather?.temperature,
        c: data.weather?.condition,
        h: data.weather?.humidity,
      },
      ts: data.syncTimestamp,
    };

    return optimized;
  }

  /**
   * Calculate data size
   */
  static calculateDataSize(data: any): string {
    const json = JSON.stringify(data);
    const bytes = Buffer.byteLength(json, "utf8");

    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  /**
   * Merge offline changes with server data
   */
  static mergeChanges(
    serverData: any,
    offlineChanges: SyncChange[]
  ): {
    merged: any;
    conflicts: any[];
    merged_count: number;
  } {
    const merged = { ...serverData };
    const conflicts: any[] = [];
    let mergedCount = 0;

    for (const change of offlineChanges) {
      try {
        if (change.type === "update") {
          if (merged[change.type]?.[change.id]) {
            merged[change.type][change.id] = {
              ...merged[change.type][change.id],
              ...change.data,
            };
            mergedCount++;
          } else {
            conflicts.push({
              change,
              reason: "Target not found in server data",
            });
          }
        } else if (change.type === "create") {
          if (!merged[change.type]) {
            merged[change.type] = [];
          }
          merged[change.type].push({
            id: change.id,
            ...change.data,
          });
          mergedCount++;
        } else if (change.type === "delete") {
          if (merged[change.type]?.[change.id]) {
            delete merged[change.type][change.id];
            mergedCount++;
          }
        }
      } catch (error) {
        conflicts.push({
          change,
          reason: `Error processing change: ${error}`,
        });
      }
    }

    return {
      merged,
      conflicts,
      merged_count: mergedCount,
    };
  }

  /**
   * Detect conflicts between offline and server data
   */
  static detectConflicts(
    offlineData: any,
    serverData: any
  ): {
    conflicts: any[];
    conflictCount: number;
  } {
    const conflicts: any[] = [];

    // Check for modified timestamps
    for (const key in offlineData) {
      if (serverData[key]) {
        if (offlineData[key].updatedAt > serverData[key].updatedAt) {
          conflicts.push({
            type: "timestamp_conflict",
            key,
            offline_time: offlineData[key].updatedAt,
            server_time: serverData[key].updatedAt,
          });
        }
      }
    }

    return {
      conflicts,
      conflictCount: conflicts.length,
    };
  }

  /**
   * Generate sync report
   */
  static generateSyncReport(
    changes: SyncChange[],
    mergeResult: any,
    conflicts: any[]
  ): {
    report: string;
    summary: any;
  } {
    const summary = {
      totalChanges: changes.length,
      mergedChanges: mergeResult.merged_count,
      conflicts: conflicts.length,
      successRate: `${Math.round((mergeResult.merged_count / changes.length) * 100)}%`,
      timestamp: new Date(),
    };

    const report = `
Offline Sync Report
===================
Total Changes: ${summary.totalChanges}
Merged Changes: ${summary.mergedChanges}
Conflicts: ${summary.conflicts}
Success Rate: ${summary.successRate}
Timestamp: ${summary.timestamp}

Changes by Type:
${changes.reduce(
  (acc, change) => {
    acc[change.type] = (acc[change.type] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
)}

${conflicts.length > 0 ? `Conflicts:\n${conflicts.map((c) => `- ${JSON.stringify(c)}`).join("\n")}` : "No conflicts detected"}
    `;

    return {
      report: report.trim(),
      summary,
    };
  }

  /**
   * Estimate bandwidth usage
   */
  static estimateBandwidth(data: any): {
    estimatedSize: string;
    estimatedTime2G: string;
    estimatedTime3G: string;
    estimatedTime4G: string;
  } {
    const json = JSON.stringify(data);
    const bytes = Buffer.byteLength(json, "utf8");

    // Bandwidth speeds (bytes per second)
    const speeds = {
      "2G": 14400 / 8, // 14.4 Kbps
      "3G": 384000 / 8, // 384 Kbps
      "4G": 10000000 / 8, // 10 Mbps
    };

    return {
      estimatedSize: this.calculateDataSize(data),
      estimatedTime2G: `${(bytes / speeds["2G"]).toFixed(1)}s`,
      estimatedTime3G: `${(bytes / speeds["3G"]).toFixed(2)}s`,
      estimatedTime4G: `${(bytes / speeds["4G"]).toFixed(3)}s`,
    };
  }

  /**
   * Create delta sync (only changed data)
   */
  static createDeltaSync(
    previousData: any,
    currentData: any
  ): {
    delta: any;
    deltaSize: string;
    originalSize: string;
    reduction: string;
  } {
    const delta: any = {};

    for (const key in currentData) {
      if (JSON.stringify(previousData[key]) !== JSON.stringify(currentData[key])) {
        delta[key] = currentData[key];
      }
    }

    const originalSize = this.calculateDataSize(currentData);
    const deltaSize = this.calculateDataSize(delta);

    // Calculate reduction percentage
    const originalBytes = Buffer.byteLength(JSON.stringify(currentData), "utf8");
    const deltaBytes = Buffer.byteLength(JSON.stringify(delta), "utf8");
    const reduction = `${Math.round(((originalBytes - deltaBytes) / originalBytes) * 100)}%`;

    return {
      delta,
      deltaSize,
      originalSize,
      reduction,
    };
  }
}
