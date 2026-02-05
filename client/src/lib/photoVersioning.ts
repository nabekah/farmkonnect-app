/**
 * Photo Versioning System
 * Tracks annotation history with ability to revert and compare versions
 */

export interface PhotoVersion {
  versionId: string;
  photoId: number;
  imageUrl: string;
  annotations: any[];
  createdBy: number;
  createdByName: string;
  createdAt: number;
  changeDescription: string;
  isCurrent: boolean;
  fileSize: number;
}

export interface PhotoVersionHistory {
  photoId: number;
  originalUrl: string;
  versions: PhotoVersion[];
  currentVersionId: string | null;
  createdAt: number;
  updatedAt: number;
}

export class PhotoVersioningService {
  private static histories: Map<number, PhotoVersionHistory> = new Map();
  private static maxVersionsPerPhoto = 20;

  /**
   * Initialize version history for a photo
   */
  static initializeHistory(photoId: number, originalUrl: string): PhotoVersionHistory {
    const history: PhotoVersionHistory = {
      photoId,
      originalUrl,
      versions: [],
      currentVersionId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.histories.set(photoId, history);
    return history;
  }

  /**
   * Create a new version from annotated image
   */
  static createVersion(
    photoId: number,
    imageUrl: string,
    annotations: any[],
    userId: number,
    userName: string,
    changeDescription: string,
    fileSize: number
  ): PhotoVersion {
    const history = this.histories.get(photoId);
    if (!history) {
      throw new Error('Photo history not found');
    }

    const version: PhotoVersion = {
      versionId: `v-${photoId}-${Date.now()}`,
      photoId,
      imageUrl,
      annotations: JSON.parse(JSON.stringify(annotations)), // Deep copy
      createdBy: userId,
      createdByName: userName,
      createdAt: Date.now(),
      changeDescription,
      isCurrent: true,
      fileSize,
    };

    // Mark previous current version as not current
    if (history.currentVersionId) {
      const prevVersion = history.versions.find((v) => v.versionId === history.currentVersionId);
      if (prevVersion) {
        prevVersion.isCurrent = false;
      }
    }

    history.versions.push(version);
    history.currentVersionId = version.versionId;
    history.updatedAt = Date.now();

    // Keep only last N versions
    if (history.versions.length > this.maxVersionsPerPhoto) {
      history.versions = history.versions.slice(-this.maxVersionsPerPhoto);
    }

    return version;
  }

  /**
   * Get specific version
   */
  static getVersion(photoId: number, versionId: string): PhotoVersion | null {
    const history = this.histories.get(photoId);
    if (!history) return null;

    return history.versions.find((v) => v.versionId === versionId) || null;
  }

  /**
   * Get all versions for a photo
   */
  static getVersionHistory(photoId: number): PhotoVersion[] {
    const history = this.histories.get(photoId);
    return history ? [...history.versions] : [];
  }

  /**
   * Revert to a specific version
   */
  static revertToVersion(
    photoId: number,
    versionId: string,
    userId: number,
    userName: string
  ): PhotoVersion | null {
    const history = this.histories.get(photoId);
    if (!history) return null;

    const targetVersion = history.versions.find((v) => v.versionId === versionId);
    if (!targetVersion) return null;

    // Create a new version as a revert
    const revertVersion: PhotoVersion = {
      versionId: `v-${photoId}-${Date.now()}`,
      photoId,
      imageUrl: targetVersion.imageUrl,
      annotations: JSON.parse(JSON.stringify(targetVersion.annotations)),
      createdBy: userId,
      createdByName: userName,
      createdAt: Date.now(),
      changeDescription: `Reverted to version from ${new Date(targetVersion.createdAt).toLocaleString()}`,
      isCurrent: true,
      fileSize: targetVersion.fileSize,
    };

    // Mark previous current version as not current
    if (history.currentVersionId) {
      const prevVersion = history.versions.find((v) => v.versionId === history.currentVersionId);
      if (prevVersion) {
        prevVersion.isCurrent = false;
      }
    }

    history.versions.push(revertVersion);
    history.currentVersionId = revertVersion.versionId;
    history.updatedAt = Date.now();

    return revertVersion;
  }

  /**
   * Compare two versions
   */
  static compareVersions(
    photoId: number,
    versionId1: string,
    versionId2: string
  ): {
    version1: PhotoVersion | null;
    version2: PhotoVersion | null;
    differences: {
      annotationsAdded: any[];
      annotationsRemoved: any[];
      annotationsModified: any[];
    };
  } {
    const history = this.histories.get(photoId);
    if (!history) {
      return {
        version1: null,
        version2: null,
        differences: {
          annotationsAdded: [],
          annotationsRemoved: [],
          annotationsModified: [],
        },
      };
    }

    const version1 = history.versions.find((v) => v.versionId === versionId1) || null;
    const version2 = history.versions.find((v) => v.versionId === versionId2) || null;

    if (!version1 || !version2) {
      return {
        version1: version1,
        version2: version2,
        differences: {
          annotationsAdded: [],
          annotationsRemoved: [],
          annotationsModified: [],
        },
      };
    }

    const ann1 = new Map(version1.annotations.map((a: any) => [a.id, a]));
    const ann2 = new Map(version2.annotations.map((a: any) => [a.id, a]));

    const differences = {
      annotationsAdded: Array.from(ann2.values()).filter((a) => !ann1.has(a.id)),
      annotationsRemoved: Array.from(ann1.values()).filter((a) => !ann2.has(a.id)),
      annotationsModified: Array.from(ann2.values()).filter((a) => {
        const original = ann1.get(a.id);
        return original && JSON.stringify(original) !== JSON.stringify(a);
      }),
    };

    return {
      version1: version1 || null,
      version2: version2 || null,
      differences,
    };
  }

  /**
   * Delete a specific version
   */
  static deleteVersion(photoId: number, versionId: string): boolean {
    const history = this.histories.get(photoId);
    if (!history) return false;

    const index = history.versions.findIndex((v) => v.versionId === versionId);
    if (index === -1) return false;

    // Cannot delete current version
    if (history.versions[index].isCurrent) {
      console.warn('Cannot delete current version');
      return false;
    }

    history.versions.splice(index, 1);
    history.updatedAt = Date.now();

    return true;
  }

  /**
   * Get version statistics
   */
  static getVersionStats(photoId: number): {
    totalVersions: number;
    totalSize: number;
    oldestVersion: PhotoVersion | null;
    newestVersion: PhotoVersion | null;
    averageAnnotationsPerVersion: number;
  } {
    const history = this.histories.get(photoId);
    if (!history || history.versions.length === 0) {
      return {
        totalVersions: 0,
        totalSize: 0,
        oldestVersion: null,
        newestVersion: null,
        averageAnnotationsPerVersion: 0,
      };
    }

    const versions = history.versions;
    const totalSize = versions.reduce((sum, v) => sum + v.fileSize, 0);
    const totalAnnotations = versions.reduce((sum, v) => sum + v.annotations.length, 0);

    return {
      totalVersions: versions.length,
      totalSize,
      oldestVersion: versions[0],
      newestVersion: versions[versions.length - 1],
      averageAnnotationsPerVersion: Math.round(totalAnnotations / versions.length),
    };
  }

  /**
   * Export version history as JSON
   */
  static exportHistory(photoId: number): string {
    const history = this.histories.get(photoId);
    if (!history) return '{}';

    return JSON.stringify(history, null, 2);
  }

  /**
   * Import version history from JSON
   */
  static importHistory(photoId: number, jsonData: string): boolean {
    try {
      const history = JSON.parse(jsonData) as PhotoVersionHistory;
      if (history.photoId !== photoId) {
        console.warn('Photo ID mismatch');
        return false;
      }

      this.histories.set(photoId, history);
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Clear all versions except current
   */
  static clearHistory(photoId: number): boolean {
    const history = this.histories.get(photoId);
    if (!history) return false;

    const currentVersion = history.versions.find((v) => v.isCurrent);
    if (currentVersion) {
      history.versions = [currentVersion];
      history.updatedAt = Date.now();
      return true;
    }

    return false;
  }
}

/**
 * React Hook for Photo Versioning
 */
export function usePhotoVersioning(photoId: number) {
  const [versions, setVersions] = React.useState<PhotoVersion[]>([]);
  const [currentVersion, setCurrentVersion] = React.useState<PhotoVersion | null>(null);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    // Initialize history
    PhotoVersioningService.initializeHistory(photoId, '');

    // Load versions
    const versionList = PhotoVersioningService.getVersionHistory(photoId);
    setVersions(versionList);

    const current = versionList.find((v) => v.isCurrent);
    setCurrentVersion(current || null);

    const versionStats = PhotoVersioningService.getVersionStats(photoId);
    setStats(versionStats);
  }, [photoId]);

  return {
    versions,
    currentVersion,
    stats,
    createVersion: (imageUrl: string, annotations: any[], userId: number, userName: string, description: string, fileSize: number) => {
      const newVersion = PhotoVersioningService.createVersion(
        photoId,
        imageUrl,
        annotations,
        userId,
        userName,
        description,
        fileSize
      );
      setVersions((prev) => [...prev, newVersion]);
      setCurrentVersion(newVersion);
      return newVersion;
    },
    revertToVersion: (versionId: string, userId: number, userName: string) => {
      const reverted = PhotoVersioningService.revertToVersion(photoId, versionId, userId, userName);
      if (reverted) {
        setVersions((prev) => [...prev, reverted]);
        setCurrentVersion(reverted);
      }
      return reverted;
    },
    compareVersions: (versionId1: string, versionId2: string) =>
      PhotoVersioningService.compareVersions(photoId, versionId1, versionId2),
    deleteVersion: (versionId: string) => {
      if (PhotoVersioningService.deleteVersion(photoId, versionId)) {
        setVersions((prev) => prev.filter((v) => v.versionId !== versionId));
        return true;
      }
      return false;
    },
    exportHistory: () => PhotoVersioningService.exportHistory(photoId),
    clearHistory: () => {
      if (PhotoVersioningService.clearHistory(photoId)) {
        const remaining = PhotoVersioningService.getVersionHistory(photoId);
        setVersions(remaining);
        return true;
      }
      return false;
    },
  };
}

import React from 'react';
