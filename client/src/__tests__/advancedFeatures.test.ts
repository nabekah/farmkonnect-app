import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { deviceTestingFramework } from '@/lib/deviceTesting'
import { pushNotificationService } from '@/lib/pushNotifications'
import { offlineMapCacheService } from '@/lib/offlineMapCache'

/**
 * Comprehensive tests for Real Device Testing, Push Notifications, and Offline Map Caching
 */

describe('Advanced Mobile Features', () => {
  beforeEach(async () => {
    // Initialize services
    await deviceTestingFramework.initialize?.()
  })

  afterEach(() => {
    // Cleanup
    deviceTestingFramework.clearTestResults?.()
  })

  describe('Real Device Testing Framework', () => {
    it('should get device information', () => {
      const deviceInfo = deviceTestingFramework.getDeviceInfo()

      expect(deviceInfo).toBeDefined()
      expect(deviceInfo.userAgent).toBeTruthy()
      expect(deviceInfo.platform).toBeTruthy()
      expect(deviceInfo.screenWidth).toBeGreaterThan(0)
      expect(deviceInfo.screenHeight).toBeGreaterThan(0)
      expect(deviceInfo.devicePixelRatio).toBeGreaterThan(0)
      expect(typeof deviceInfo.isTouch).toBe('boolean')
      expect(typeof deviceInfo.isMobile).toBe('boolean')
    })

    it('should detect device type correctly', () => {
      const deviceInfo = deviceTestingFramework.getDeviceInfo()

      if (deviceInfo.isMobile) {
        expect(deviceInfo.isIOS || deviceInfo.isAndroid).toBe(true)
      }
    })

    it('should extract browser information', () => {
      const deviceInfo = deviceTestingFramework.getDeviceInfo()

      expect(deviceInfo.browserName).toBeTruthy()
      expect(['Chrome', 'Safari', 'Firefox', 'Edge', 'Unknown']).toContain(deviceInfo.browserName)
    })

    it('should test offline storage', async () => {
      const result = await deviceTestingFramework.testOfflineStorage()

      expect(result).toBeDefined()
      expect(result.testId).toBeTruthy()
      expect(result.testType).toBe('storage')
      expect(result.operationTime).toBeGreaterThanOrEqual(0)
      expect(result.passed).toBe(true)
    })

    it('should test network connectivity', async () => {
      const result = await deviceTestingFramework.testNetworkConnectivity()

      expect(result).toBeDefined()
      expect(result.testId).toBeTruthy()
      expect(result.testType).toBe('network')
      expect(result.operationTime).toBeGreaterThanOrEqual(0)
    })

    it('should store and retrieve test results', async () => {
      await deviceTestingFramework.testOfflineStorage()

      const results = deviceTestingFramework.getTestResults('offline')

      expect(results).toHaveLength(1)
      expect(results[0].testType).toBe('storage')
    })

    it('should export test results as JSON', () => {
      const exported = deviceTestingFramework.exportTestResults()

      expect(exported).toBeTruthy()
      const parsed = JSON.parse(exported)
      expect(parsed.timestamp).toBeTruthy()
      expect(parsed.deviceInfo).toBeDefined()
      expect(Array.isArray(parsed.results)).toBe(true)
    })
  })

  describe('Push Notifications System', () => {
    it('should get default notification preferences', () => {
      const prefs = pushNotificationService.getPreferences()

      expect(prefs).toBeDefined()
      expect(prefs.enabled).toBe(true)
      expect(prefs.taskAssignments).toBe(true)
      expect(prefs.taskUpdates).toBe(true)
      expect(prefs.taskReminders).toBe(true)
      expect(prefs.soundEnabled).toBe(true)
      expect(prefs.vibrationEnabled).toBe(true)
    })

    it('should update notification preferences', () => {
      pushNotificationService.setPreferences({
        enabled: false,
        soundEnabled: false,
      })

      const prefs = pushNotificationService.getPreferences()

      expect(prefs.enabled).toBe(false)
      expect(prefs.soundEnabled).toBe(false)
      expect(prefs.taskAssignments).toBe(true) // Should remain unchanged
    })

    it('should handle quiet hours', () => {
      pushNotificationService.setPreferences({
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      })

      const prefs = pushNotificationService.getPreferences()

      expect(prefs.quietHoursStart).toBe('22:00')
      expect(prefs.quietHoursEnd).toBe('08:00')
    })

    it('should maintain notification history', async () => {
      // Clear history first
      pushNotificationService.clearNotificationHistory()

      let history = pushNotificationService.getNotificationHistory()
      expect(history).toHaveLength(0)

      // Note: Actual notification sending would require service worker
      // This tests the history tracking mechanism
      history = pushNotificationService.getNotificationHistory()
      expect(Array.isArray(history)).toBe(true)
    })

    it('should clear notification history', () => {
      pushNotificationService.clearNotificationHistory()

      const history = pushNotificationService.getNotificationHistory()

      expect(history).toHaveLength(0)
    })

    it('should persist preferences to localStorage', () => {
      const testPrefs = {
        enabled: false,
        taskAssignments: false,
        soundEnabled: false,
      }

      pushNotificationService.setPreferences(testPrefs)

      // Verify localStorage was updated
      const stored = localStorage.getItem('notificationPreferences')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.enabled).toBe(false)
      expect(parsed.taskAssignments).toBe(false)
      expect(parsed.soundEnabled).toBe(false)
    })
  })

  describe('Offline Map Caching', () => {
    it('should initialize map cache', async () => {
      const initialized = await offlineMapCacheService.initialize()

      expect(typeof initialized).toBe('boolean')
    })

    it('should get cache statistics', async () => {
      await offlineMapCacheService.initialize()

      const stats = await offlineMapCacheService.getCacheStats()

      expect(stats).toBeDefined()
      expect(typeof stats.totalTiles).toBe('number')
      expect(typeof stats.totalSize).toBe('number')
      expect(typeof stats.averageTileSize).toBe('number')
      expect(stats.totalTiles).toBeGreaterThanOrEqual(0)
    })

    it('should cache a map tile', async () => {
      await offlineMapCacheService.initialize()

      const testBlob = new Blob(['test tile data'], { type: 'image/png' })
      const url = 'https://example.com/tile.png'

      const cached = await offlineMapCacheService.cacheTile(url, testBlob, 10, 512, 512)

      expect(cached).toBe(true)
    })

    it('should retrieve cached tile', async () => {
      await offlineMapCacheService.initialize()

      const testBlob = new Blob(['test tile data'], { type: 'image/png' })
      const url = 'https://example.com/tile.png'

      await offlineMapCacheService.cacheTile(url, testBlob, 10, 512, 512)

      const retrieved = await offlineMapCacheService.getCachedTile(10, 512, 512)

      expect(retrieved).toBeDefined()
      expect(retrieved?.size).toBe(testBlob.size)
    })

    it('should return null for non-existent tile', async () => {
      await offlineMapCacheService.initialize()

      const retrieved = await offlineMapCacheService.getCachedTile(99, 999, 999)

      expect(retrieved).toBeNull()
    })

    it('should clear all cached tiles', async () => {
      await offlineMapCacheService.initialize()

      // Cache a tile first
      const testBlob = new Blob(['test tile data'], { type: 'image/png' })
      await offlineMapCacheService.cacheTile('https://example.com/tile.png', testBlob, 10, 512, 512)

      // Clear cache
      await offlineMapCacheService.clearCache()

      // Verify cache is empty
      const stats = await offlineMapCacheService.getCacheStats()
      expect(stats.totalTiles).toBe(0)
      expect(stats.totalSize).toBe(0)
    })

    it('should subscribe to download progress', (done) => {
      const progressUpdates: any[] = []

      const unsubscribe = offlineMapCacheService.onDownloadProgress((progress) => {
        progressUpdates.push(progress)
      })

      expect(typeof unsubscribe).toBe('function')

      unsubscribe()
      done()
    })

    it('should handle multiple cached tiles', async () => {
      await offlineMapCacheService.initialize()

      const testBlob = new Blob(['test tile data'], { type: 'image/png' })

      // Cache multiple tiles
      for (let i = 0; i < 5; i++) {
        await offlineMapCacheService.cacheTile(
          `https://example.com/tile-${i}.png`,
          testBlob,
          10,
          512 + i,
          512 + i
        )
      }

      const stats = await offlineMapCacheService.getCacheStats()

      expect(stats.totalTiles).toBe(5)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.averageTileSize).toBeGreaterThan(0)
    })
  })

  describe('Integration Tests', () => {
    it('should run full device test suite', async () => {
      const results = await deviceTestingFramework.runFullTestSuite?.()

      if (results) {
        expect(results.deviceInfo).toBeDefined()
        expect(results.summary).toBeDefined()
        expect(typeof results.summary.passed).toBe('number')
        expect(typeof results.summary.failed).toBe('number')
        expect(typeof results.summary.total).toBe('number')
      }
    })

    it('should handle notification preferences and device info together', async () => {
      const deviceInfo = deviceTestingFramework.getDeviceInfo()
      const notificationPrefs = pushNotificationService.getPreferences()

      expect(deviceInfo).toBeDefined()
      expect(notificationPrefs).toBeDefined()

      // Verify they work together
      if (deviceInfo.isMobile) {
        expect(notificationPrefs.enabled).toBe(true)
      }
    })

    it('should handle map caching and device testing together', async () => {
      await offlineMapCacheService.initialize()

      const deviceInfo = deviceTestingFramework.getDeviceInfo()
      const cacheStats = await offlineMapCacheService.getCacheStats()

      expect(deviceInfo).toBeDefined()
      expect(cacheStats).toBeDefined()

      // Verify compatibility
      expect(cacheStats.totalTiles).toBeGreaterThanOrEqual(0)
    })

    it('should handle all three features in sequence', async () => {
      // 1. Get device info
      const deviceInfo = deviceTestingFramework.getDeviceInfo()
      expect(deviceInfo).toBeDefined()

      // 2. Set notification preferences
      pushNotificationService.setPreferences({ enabled: true })
      const notificationPrefs = pushNotificationService.getPreferences()
      expect(notificationPrefs.enabled).toBe(true)

      // 3. Initialize map cache
      await offlineMapCacheService.initialize()
      const cacheStats = await offlineMapCacheService.getCacheStats()
      expect(cacheStats).toBeDefined()

      // All three should work together
      expect(deviceInfo).toBeDefined()
      expect(notificationPrefs).toBeDefined()
      expect(cacheStats).toBeDefined()
    })
  })

  describe('Performance Tests', () => {
    it('should get device info quickly', () => {
      const startTime = performance.now()

      const deviceInfo = deviceTestingFramework.getDeviceInfo()

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(deviceInfo).toBeDefined()
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should get cache stats efficiently', async () => {
      await offlineMapCacheService.initialize()

      const startTime = performance.now()

      const stats = await offlineMapCacheService.getCacheStats()

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(stats).toBeDefined()
      expect(duration).toBeLessThan(500) // Should complete in less than 500ms
    })

    it('should handle notification preference updates quickly', () => {
      const startTime = performance.now()

      pushNotificationService.setPreferences({
        enabled: false,
        soundEnabled: false,
        vibrationEnabled: false,
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })
  })
})
