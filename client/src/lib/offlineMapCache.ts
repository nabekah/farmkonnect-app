/**
 * Offline Map Caching Service
 * Caches map tiles for offline access with automatic cleanup and expiration
 */

export interface MapTile {
  key: string
  url: string
  data: Blob
  timestamp: number
  zoom: number
  x: number
  y: number
  size: number
}

export interface CacheStats {
  totalTiles: number
  totalSize: number
  oldestTile: number
  newestTile: number
  averageTileSize: number
}

export interface DownloadProgress {
  downloaded: number
  total: number
  percentage: number
  currentTile: string
}

class OfflineMapCacheService {
  private dbName = 'farmkonnect_map_cache'
  private storeName = 'tiles'
  private db: IDBDatabase | null = null
  private cacheExpiration = 30 * 24 * 60 * 60 * 1000 // 30 days
  private maxCacheSize = 100 * 1024 * 1024 // 100 MB
  private downloadListeners: Set<(progress: DownloadProgress) => void> = new Set()

  /**
   * Initialize the cache database
   */
  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => {
        console.error('Failed to open IndexedDB')
        resolve(false)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(true)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('zoom', 'zoom', { unique: false })
        }
      }
    })
  }

  /**
   * Cache a map tile
   */
  async cacheTile(url: string, data: Blob, zoom: number, x: number, y: number): Promise<boolean> {
    if (!this.db) {
      console.warn('Database not initialized')
      return false
    }

    try {
      const key = this.generateTileKey(zoom, x, y)
      const tile: MapTile = {
        key,
        url,
        data,
        timestamp: Date.now(),
        zoom,
        x,
        y,
        size: data.size,
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(tile)

        request.onsuccess = () => {
          // Check cache size and cleanup if needed
          this.cleanupCacheIfNeeded()
          resolve(true)
        }

        request.onerror = () => {
          console.error('Failed to cache tile')
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Error caching tile:', error)
      return false
    }
  }

  /**
   * Get a cached tile
   */
  async getCachedTile(zoom: number, x: number, y: number): Promise<Blob | null> {
    if (!this.db) {
      console.warn('Database not initialized')
      return null
    }

    try {
      const key = this.generateTileKey(zoom, x, y)

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)

        request.onsuccess = () => {
          const tile = request.result as MapTile | undefined
          if (tile) {
            // Check if tile has expired
            if (Date.now() - tile.timestamp > this.cacheExpiration) {
              // Delete expired tile
              this.deleteTile(key)
              resolve(null)
            } else {
              resolve(tile.data)
            }
          } else {
            resolve(null)
          }
        }

        request.onerror = () => {
          console.error('Failed to retrieve cached tile')
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error retrieving cached tile:', error)
      return null
    }
  }

  /**
   * Download and cache map tiles for a region
   */
  async downloadMapRegion(
    bounds: { minZoom: number; maxZoom: number; north: number; south: number; east: number; west: number },
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const tiles: Array<{ zoom: number; x: number; y: number }> = []

    // Generate tile coordinates for the region
    for (let zoom = bounds.minZoom; zoom <= bounds.maxZoom; zoom++) {
      const minTile = this.latlngToTile(bounds.north, bounds.west, zoom)
      const maxTile = this.latlngToTile(bounds.south, bounds.east, zoom)

      for (let x = Math.min(minTile.x, maxTile.x); x <= Math.max(minTile.x, maxTile.x); x++) {
        for (let y = Math.min(minTile.y, maxTile.y); y <= Math.max(minTile.y, maxTile.y); y++) {
          tiles.push({ zoom, x, y })
        }
      }
    }

    const total = tiles.length
    let downloaded = 0

    for (const tile of tiles) {
      try {
        const url = this.getTileUrl(tile.zoom, tile.x, tile.y)
        const response = await fetch(url)

        if (response.ok) {
          const blob = await response.blob()
          await this.cacheTile(url, blob, tile.zoom, tile.x, tile.y)
        }

        downloaded++

        if (onProgress) {
          const progress: DownloadProgress = {
            downloaded,
            total,
            percentage: (downloaded / total) * 100,
            currentTile: `Z${tile.zoom} X${tile.x} Y${tile.y}`,
          }
          onProgress(progress)
          this.notifyDownloadProgress(progress)
        }
      } catch (error) {
        console.warn(`Failed to download tile Z${tile.zoom} X${tile.x} Y${tile.y}:`, error)
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    if (!this.db) {
      return {
        totalTiles: 0,
        totalSize: 0,
        oldestTile: 0,
        newestTile: 0,
        averageTileSize: 0,
      }
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const tiles = request.result as MapTile[]

        if (tiles.length === 0) {
          resolve({
            totalTiles: 0,
            totalSize: 0,
            oldestTile: 0,
            newestTile: 0,
            averageTileSize: 0,
          })
          return
        }

        const totalSize = tiles.reduce((sum, tile) => sum + tile.size, 0)
        const timestamps = tiles.map((t) => t.timestamp)

        resolve({
          totalTiles: tiles.length,
          totalSize,
          oldestTile: Math.min(...timestamps),
          newestTile: Math.max(...timestamps),
          averageTileSize: totalSize / tiles.length,
        })
      }

      request.onerror = () => {
        console.error('Failed to get cache stats')
        resolve({
          totalTiles: 0,
          totalSize: 0,
          oldestTile: 0,
          newestTile: 0,
          averageTileSize: 0,
        })
      }
    })
  }

  /**
   * Clear all cached tiles
   */
  async clearCache(): Promise<void> {
    if (!this.db) {
      console.warn('Database not initialized')
      return
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => {
        console.log('Cache cleared')
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to clear cache')
        resolve()
      }
    })
  }

  /**
   * Delete a specific tile
   */
  private async deleteTile(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }

  /**
   * Cleanup cache if it exceeds max size or has expired tiles
   */
  private async cleanupCacheIfNeeded(): Promise<void> {
    const stats = await this.getCacheStats()

    if (stats.totalSize > this.maxCacheSize) {
      // Remove oldest tiles until cache size is acceptable
      await this.removeOldestTiles(Math.ceil(stats.totalTiles * 0.1)) // Remove 10% of tiles
    }

    // Remove expired tiles
    await this.removeExpiredTiles()
  }

  /**
   * Remove oldest tiles
   */
  private async removeOldestTiles(count: number): Promise<void> {
    if (!this.db) return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('timestamp')
      const request = index.openCursor()

      let removed = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result

        if (cursor && removed < count) {
          cursor.delete()
          removed++
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => resolve()
    })
  }

  /**
   * Remove expired tiles
   */
  private async removeExpiredTiles(): Promise<void> {
    if (!this.db) return

    const now = Date.now()
    const expiration = this.cacheExpiration

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result

        if (cursor) {
          const tile = cursor.value as MapTile
          if (now - tile.timestamp > expiration) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => resolve()
    })
  }

  /**
   * Helper methods
   */
  private generateTileKey(zoom: number, x: number, y: number): string {
    return `${zoom}-${x}-${y}`
  }

  private getTileUrl(zoom: number, x: number, y: number): string {
    // Using OpenStreetMap tiles as default
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
  }

  private latlngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const n = Math.pow(2, zoom)
    const x = Math.floor(((lng + 180) / 360) * n)
    const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n)
    return { x, y }
  }

  private notifyDownloadProgress(progress: DownloadProgress): void {
    this.downloadListeners.forEach((listener) => listener(progress))
  }

  /**
   * Subscribe to download progress updates
   */
  onDownloadProgress(callback: (progress: DownloadProgress) => void): () => void {
    this.downloadListeners.add(callback)
    return () => this.downloadListeners.delete(callback)
  }
}

export const offlineMapCacheService = new OfflineMapCacheService()
