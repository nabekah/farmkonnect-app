import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { offlineMapCacheService, CacheStats, DownloadProgress } from '@/lib/offlineMapCache'
import { Download, Trash2, MapPin, HardDrive } from 'lucide-react'

export default function OfflineMapViewer() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [mapBounds, setMapBounds] = useState({
    minZoom: 10,
    maxZoom: 16,
    north: 6.6,
    south: 6.4,
    east: -0.1,
    west: -0.3,
  })

  useEffect(() => {
    const initCache = async () => {
      const initialized = await offlineMapCacheService.initialize()
      if (initialized) {
        const stats = await offlineMapCacheService.getCacheStats()
        setCacheStats(stats)
      }
    }

    initCache()

    // Subscribe to download progress
    const unsubscribe = offlineMapCacheService.onDownloadProgress((progress) => {
      setDownloadProgress(progress)
    })

    return unsubscribe
  }, [])

  const handleDownloadMaps = async () => {
    setIsDownloading(true)
    setDownloadProgress(null)

    try {
      await offlineMapCacheService.downloadMapRegion(mapBounds, (progress) => {
        setDownloadProgress(progress)
      })

      // Update cache stats
      const stats = await offlineMapCacheService.getCacheStats()
      setCacheStats(stats)
    } catch (error) {
      console.error('Failed to download maps:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cached maps?')) {
      await offlineMapCacheService.clearCache()
      setCacheStats({
        totalTiles: 0,
        totalSize: 0,
        oldestTile: 0,
        newestTile: 0,
        averageTileSize: 0,
      })
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Offline Map Caching
          </CardTitle>
          <CardDescription>Download and cache map tiles for offline access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cache Statistics */}
          {cacheStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-slate-900">{cacheStats.totalTiles}</div>
                  <p className="text-xs text-slate-600 mt-1">Cached Tiles</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-slate-900">{formatBytes(cacheStats.totalSize)}</div>
                  <p className="text-xs text-slate-600 mt-1">Total Size</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-slate-900">{formatBytes(cacheStats.averageTileSize)}</div>
                  <p className="text-xs text-slate-600 mt-1">Avg Tile Size</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {cacheStats.totalSize > 0 ? Math.round((cacheStats.totalSize / (100 * 1024 * 1024)) * 100) : 0}%
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Cache Usage</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Download Progress */}
          {isDownloading && downloadProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">
                  Downloading {downloadProgress.currentTile}
                </p>
                <Badge className="bg-blue-100 text-blue-800">
                  {downloadProgress.downloaded} / {downloadProgress.total}
                </Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 text-right">{downloadProgress.percentage.toFixed(1)}% complete</p>
            </div>
          )}

          {/* Map Bounds Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-slate-900">Download Region</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Min Zoom</label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={mapBounds.minZoom}
                  onChange={(e) => setMapBounds({ ...mapBounds, minZoom: parseInt(e.target.value) })}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Max Zoom</label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={mapBounds.maxZoom}
                  onChange={(e) => setMapBounds({ ...mapBounds, maxZoom: parseInt(e.target.value) })}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">North Latitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={mapBounds.north}
                  onChange={(e) => setMapBounds({ ...mapBounds, north: parseFloat(e.target.value) })}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">South Latitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={mapBounds.south}
                  onChange={(e) => setMapBounds({ ...mapBounds, south: parseFloat(e.target.value) })}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">East Longitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={mapBounds.east}
                  onChange={(e) => setMapBounds({ ...mapBounds, east: parseFloat(e.target.value) })}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">West Longitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={mapBounds.west}
                  onChange={(e) => setMapBounds({ ...mapBounds, west: parseFloat(e.target.value) })}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Configure the geographic region and zoom levels for offline map caching. Default coordinates are set for
              Accra, Ghana area.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleDownloadMaps}
              disabled={isDownloading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Maps'}
            </Button>

            <Button
              onClick={handleClearCache}
              disabled={isDownloading || !cacheStats || cacheStats.totalTiles === 0}
              variant="outline"
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <HardDrive className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Offline Map Storage</p>
                <p className="mt-1">
                  Downloaded maps are stored locally on your device and will be available even without internet connection.
                  Maps are automatically removed after 30 days.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
