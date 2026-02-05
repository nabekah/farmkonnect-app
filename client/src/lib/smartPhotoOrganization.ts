/**
 * Smart Photo Organization System
 * Auto-tags photos by activity type, location, date, and worker with filter presets
 */

export interface PhotoTag {
  id: string;
  name: string;
  category: 'activity' | 'location' | 'date' | 'worker' | 'custom';
  color: string;
  confidence: number; // 0-1 for auto-detected tags
  isAutoDetected: boolean;
  createdAt: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  tags: string[]; // Tag IDs
  createdAt: number;
  usageCount: number;
}

export interface PhotoMetadata {
  photoId: number;
  tags: PhotoTag[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: number;
  workerId: number;
  workerName: string;
  activityType?: string;
}

export class SmartPhotoOrganizationService {
  private static photoMetadata: Map<number, PhotoMetadata> = new Map();
  private static filterPresets: Map<string, FilterPreset> = new Map();
  private static autoTagRules: Map<string, any> = new Map();

  // Activity type keywords for auto-tagging
  private static activityKeywords = {
    planting: ['plant', 'seed', 'sow', 'transplant', 'seedling'],
    irrigation: ['water', 'irrigation', 'sprinkler', 'drip', 'flooding'],
    fertilizing: ['fertiliz', 'nutrient', 'compost', 'manure', 'nitrogen'],
    weeding: ['weed', 'remove', 'pull', 'hoe', 'clearing'],
    harvesting: ['harvest', 'pick', 'gather', 'collect', 'yield'],
    pestControl: ['pest', 'insect', 'disease', 'spray', 'fungicide'],
    pruning: ['prune', 'trim', 'cut', 'branch', 'canopy'],
    inspection: ['inspect', 'check', 'assess', 'monitor', 'survey'],
  };

  /**
   * Initialize metadata for a photo
   */
  static initializeMetadata(
    photoId: number,
    workerId: number,
    workerName: string,
    timestamp: number
  ): PhotoMetadata {
    const metadata: PhotoMetadata = {
      photoId,
      tags: [],
      timestamp,
      workerId,
      workerName,
    };

    this.photoMetadata.set(photoId, metadata);
    return metadata;
  }

  /**
   * Auto-tag photo based on activity description
   */
  static autoTagPhoto(
    photoId: number,
    activityDescription: string,
    location?: { latitude: number; longitude: number; address?: string }
  ): PhotoTag[] {
    const metadata = this.photoMetadata.get(photoId);
    if (!metadata) return [];

    const autoTags: PhotoTag[] = [];
    const descriptionLower = activityDescription.toLowerCase();

    // Auto-detect activity type
    for (const [activity, keywords] of Object.entries(this.activityKeywords)) {
      const matched = keywords.some((keyword) => descriptionLower.includes(keyword));
      if (matched) {
        const tag: PhotoTag = {
          id: `tag-${photoId}-${activity}`,
          name: activity.charAt(0).toUpperCase() + activity.slice(1),
          category: 'activity',
          color: this.getCategoryColor('activity'),
          confidence: 0.85,
          isAutoDetected: true,
          createdAt: Date.now(),
        };
        autoTags.push(tag);
        metadata.activityType = activity;
      }
    }

    // Add location tag
    if (location) {
      metadata.location = location;
      const locationTag: PhotoTag = {
        id: `tag-${photoId}-location`,
        name: location.address || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`,
        category: 'location',
        color: this.getCategoryColor('location'),
        confidence: 1.0,
        isAutoDetected: true,
        createdAt: Date.now(),
      };
      autoTags.push(locationTag);
    }

    // Add date tag
    const dateTag: PhotoTag = {
      id: `tag-${photoId}-date`,
      name: new Date(metadata.timestamp).toLocaleDateString(),
      category: 'date',
      color: this.getCategoryColor('date'),
      confidence: 1.0,
      isAutoDetected: true,
      createdAt: Date.now(),
    };
    autoTags.push(dateTag);

    // Add worker tag
    const workerTag: PhotoTag = {
      id: `tag-${photoId}-worker`,
      name: metadata.workerName,
      category: 'worker',
      color: this.getCategoryColor('worker'),
      confidence: 1.0,
      isAutoDetected: true,
      createdAt: Date.now(),
    };
    autoTags.push(workerTag);

    // Add all auto-tags to metadata
    metadata.tags.push(...autoTags);

    return autoTags;
  }

  /**
   * Add custom tag to photo
   */
  static addCustomTag(
    photoId: number,
    tagName: string,
    color?: string
  ): PhotoTag | null {
    const metadata = this.photoMetadata.get(photoId);
    if (!metadata) return null;

    const tag: PhotoTag = {
      id: `tag-${photoId}-${Date.now()}`,
      name: tagName,
      category: 'custom',
      color: color || this.getCategoryColor('custom'),
      confidence: 1.0,
      isAutoDetected: false,
      createdAt: Date.now(),
    };

    metadata.tags.push(tag);
    return tag;
  }

  /**
   * Remove tag from photo
   */
  static removeTag(photoId: number, tagId: string): boolean {
    const metadata = this.photoMetadata.get(photoId);
    if (!metadata) return false;

    const index = metadata.tags.findIndex((t) => t.id === tagId);
    if (index === -1) return false;

    metadata.tags.splice(index, 1);
    return true;
  }

  /**
   * Get all tags for a photo
   */
  static getPhotoTags(photoId: number): PhotoTag[] {
    const metadata = this.photoMetadata.get(photoId);
    return metadata ? [...metadata.tags] : [];
  }

  /**
   * Create filter preset
   */
  static createFilterPreset(
    name: string,
    description: string,
    tagIds: string[]
  ): FilterPreset {
    const preset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      tags: tagIds,
      createdAt: Date.now(),
      usageCount: 0,
    };

    this.filterPresets.set(preset.id, preset);
    return preset;
  }

  /**
   * Get all filter presets
   */
  static getFilterPresets(): FilterPreset[] {
    return Array.from(this.filterPresets.values());
  }

  /**
   * Apply filter preset
   */
  static applyFilterPreset(presetId: string, allPhotos: PhotoMetadata[]): PhotoMetadata[] {
    const preset = this.filterPresets.get(presetId);
    if (!preset) return [];

    // Increment usage count
    preset.usageCount++;

    // Filter photos that have all tags in the preset
    return allPhotos.filter((photo) => {
      const photoTagIds = photo.tags.map((t) => t.id);
      return preset.tags.every((tagId) => photoTagIds.includes(tagId));
    });
  }

  /**
   * Search photos by tags
   */
  static searchPhotosByTags(
    allPhotos: PhotoMetadata[],
    tagNames: string[],
    matchAll: boolean = false
  ): PhotoMetadata[] {
    const tagNamesLower = tagNames.map((t) => t.toLowerCase());

    return allPhotos.filter((photo) => {
      const photoTagNames = photo.tags.map((t) => t.name.toLowerCase());

      if (matchAll) {
        return tagNamesLower.every((tagName) =>
          photoTagNames.some((photoTag) => photoTag.includes(tagName))
        );
      } else {
        return tagNamesLower.some((tagName) =>
          photoTagNames.some((photoTag) => photoTag.includes(tagName))
        );
      }
    });
  }

  /**
   * Get photos by activity type
   */
  static getPhotosByActivity(
    allPhotos: PhotoMetadata[],
    activityType: string
  ): PhotoMetadata[] {
    return allPhotos.filter((photo) => photo.activityType === activityType);
  }

  /**
   * Get photos by date range
   */
  static getPhotosByDateRange(
    allPhotos: PhotoMetadata[],
    startDate: Date,
    endDate: Date
  ): PhotoMetadata[] {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return allPhotos.filter(
      (photo) => photo.timestamp >= startTime && photo.timestamp <= endTime
    );
  }

  /**
   * Get photos by worker
   */
  static getPhotosByWorker(
    allPhotos: PhotoMetadata[],
    workerId: number
  ): PhotoMetadata[] {
    return allPhotos.filter((photo) => photo.workerId === workerId);
  }

  /**
   * Get photos by location (within radius)
   */
  static getPhotosByLocation(
    allPhotos: PhotoMetadata[],
    latitude: number,
    longitude: number,
    radiusKm: number = 1
  ): PhotoMetadata[] {
    return allPhotos.filter((photo) => {
      if (!photo.location) return false;

      const distance = this.calculateDistance(
        latitude,
        longitude,
        photo.location.latitude,
        photo.location.longitude
      );

      return distance <= radiusKm;
    });
  }

  /**
   * Get tag statistics
   */
  static getTagStatistics(allPhotos: PhotoMetadata[]): {
    totalTags: number;
    tagsByCategory: Record<string, number>;
    mostUsedTags: Array<{ name: string; count: number }>;
    autoDetectedPercentage: number;
  } {
    const tagCounts = new Map<string, number>();
    const categoryCount = new Map<string, number>();
    let autoDetectedCount = 0;
    let totalTags = 0;

    allPhotos.forEach((photo) => {
      photo.tags.forEach((tag) => {
        totalTags++;
        tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1);
        categoryCount.set(tag.category, (categoryCount.get(tag.category) || 0) + 1);

        if (tag.isAutoDetected) {
          autoDetectedCount++;
        }
      });
    });

    const mostUsedTags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalTags,
      tagsByCategory: Object.fromEntries(categoryCount),
      mostUsedTags,
      autoDetectedPercentage: totalTags > 0 ? Math.round((autoDetectedCount / totalTags) * 100) : 0,
    };
  }

  /**
   * Export tags as CSV
   */
  static exportTagsAsCSV(allPhotos: PhotoMetadata[]): string {
    const rows = ['PhotoID,Tags,Category,Confidence,IsAutoDetected'];

    allPhotos.forEach((photo) => {
      photo.tags.forEach((tag) => {
        rows.push(
          `${photo.photoId},"${tag.name}",${tag.category},${tag.confidence},${tag.isAutoDetected}`
        );
      });
    });

    return rows.join('\n');
  }

  // Private helper methods

  private static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      activity: '#FF6B6B',
      location: '#4ECDC4',
      date: '#45B7D1',
      worker: '#FFA07A',
      custom: '#98D8C8',
    };

    return colors[category] || '#95E1D3';
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

/**
 * React Hook for Smart Photo Organization
 */
export function useSmartPhotoOrganization(photos: PhotoMetadata[]) {
  const [filteredPhotos, setFilteredPhotos] = React.useState<PhotoMetadata[]>(photos);
  const [presets, setPresets] = React.useState<FilterPreset[]>([]);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    setPresets(SmartPhotoOrganizationService.getFilterPresets());
    const tagStats = SmartPhotoOrganizationService.getTagStatistics(photos);
    setStats(tagStats);
  }, [photos]);

  return {
    filteredPhotos,
    presets,
    stats,
    searchByTags: (tagNames: string[], matchAll: boolean = false) => {
      const results = SmartPhotoOrganizationService.searchPhotosByTags(
        photos,
        tagNames,
        matchAll
      );
      setFilteredPhotos(results);
      return results;
    },
    filterByActivity: (activityType: string) => {
      const results = SmartPhotoOrganizationService.getPhotosByActivity(photos, activityType);
      setFilteredPhotos(results);
      return results;
    },
    filterByDateRange: (startDate: Date, endDate: Date) => {
      const results = SmartPhotoOrganizationService.getPhotosByDateRange(
        photos,
        startDate,
        endDate
      );
      setFilteredPhotos(results);
      return results;
    },
    filterByWorker: (workerId: number) => {
      const results = SmartPhotoOrganizationService.getPhotosByWorker(photos, workerId);
      setFilteredPhotos(results);
      return results;
    },
    filterByLocation: (latitude: number, longitude: number, radiusKm?: number) => {
      const results = SmartPhotoOrganizationService.getPhotosByLocation(
        photos,
        latitude,
        longitude,
        radiusKm
      );
      setFilteredPhotos(results);
      return results;
    },
    applyPreset: (presetId: string) => {
      const results = SmartPhotoOrganizationService.applyFilterPreset(presetId, photos);
      setFilteredPhotos(results);
      return results;
    },
    createPreset: (name: string, description: string, tagIds: string[]) => {
      const preset = SmartPhotoOrganizationService.createFilterPreset(name, description, tagIds);
      setPresets((prev) => [...prev, preset]);
      return preset;
    },
    exportAsCSV: () => SmartPhotoOrganizationService.exportTagsAsCSV(photos),
    resetFilters: () => {
      setFilteredPhotos(photos);
    },
  };
}

import React from 'react';
