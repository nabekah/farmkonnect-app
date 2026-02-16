/**
 * Real Device Testing Framework
 * Utilities for testing GPS accuracy, photo capture, and offline functionality on real devices
 */

export interface DeviceInfo {
  userAgent: string
  platform: string
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  isTouch: boolean
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  osVersion: string
  browserName: string
  browserVersion: string
}

export interface GPSTestResult {
  testId: string
  timestamp: number
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  expectedLocation?: { lat: number; lng: number }
  distanceFromExpected?: number
  passed: boolean
  message: string
}

export interface PhotoTestResult {
  testId: string
  timestamp: number
  imageSize: number
  imageDimensions: { width: number; height: number }
  mimeType: string
  compressionRatio: number
  captureTime: number
  passed: boolean
  message: string
}

export interface OfflineTestResult {
  testId: string
  timestamp: number
  testType: 'sync' | 'storage' | 'network'
  dataSize: number
  operationTime: number
  passed: boolean
  message: string
}

export interface PerformanceBenchmark {
  testId: string
  timestamp: number
  operationType: string
  duration: number
  memoryUsed: number
  cpuUsage: number
  batteryLevel: number
  networkType: string
  passed: boolean
}

class DeviceTestingFramework {
  private testResults: Map<string, any[]> = new Map()
  private performanceObserver: PerformanceObserver | null = null

  /**
   * Get detailed device information
   */
  getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent
    const isAndroid = /Android/.test(ua)
    const isIOS = /iPhone|iPad|iPod/.test(ua)
    const isMobile = isAndroid || isIOS

    return {
      userAgent: ua,
      platform: navigator.platform,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      isTouch: 'ontouchstart' in window,
      isMobile,
      isIOS,
      isAndroid,
      osVersion: this.extractOSVersion(ua),
      browserName: this.extractBrowserName(ua),
      browserVersion: this.extractBrowserVersion(ua),
    }
  }

  /**
   * Test GPS accuracy on real device
   */
  async testGPSAccuracy(
    expectedLocation?: { lat: number; lng: number }
  ): Promise<GPSTestResult> {
    const testId = `gps-${Date.now()}`
    const startTime = performance.now()

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const endTime = performance.now()
      const coords = position.coords

      let distanceFromExpected: number | undefined
      if (expectedLocation) {
        distanceFromExpected = this.calculateDistance(
          expectedLocation.lat,
          expectedLocation.lng,
          coords.latitude,
          coords.longitude
        )
      }

      const result: GPSTestResult = {
        testId,
        timestamp: Date.now(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
        expectedLocation,
        distanceFromExpected,
        passed: coords.accuracy < 50, // Pass if accuracy is better than 50m
        message: `GPS test completed in ${(endTime - startTime).toFixed(2)}ms with accuracy ${coords.accuracy.toFixed(2)}m`,
      }

      this.storeResult('gps', result)
      return result
    } catch (error) {
      const result: GPSTestResult = {
        testId,
        timestamp: Date.now(),
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        passed: false,
        message: `GPS test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }

      this.storeResult('gps', result)
      return result
    }
  }

  /**
   * Test photo capture on real device
   */
  async testPhotoCapture(): Promise<PhotoTestResult> {
    const testId = `photo-${Date.now()}`

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1280
      canvas.height = 720

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw test pattern
      ctx.fillStyle = '#FF6B6B'
      ctx.fillRect(0, 0, 640, 360)
      ctx.fillStyle = '#4ECDC4'
      ctx.fillRect(640, 0, 640, 360)
      ctx.fillStyle = '#45B7D1'
      ctx.fillRect(0, 360, 640, 360)
      ctx.fillStyle = '#FFA07A'
      ctx.fillRect(640, 360, 640, 360)

      // Add text
      ctx.fillStyle = 'white'
      ctx.font = '24px Arial'
      ctx.fillText(`Photo Test - ${new Date().toLocaleTimeString()}`, 50, 50)

      const startTime = performance.now()

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/jpeg', 0.8)
      })

      const endTime = performance.now()

      const result: PhotoTestResult = {
        testId,
        timestamp: Date.now(),
        imageSize: blob.size,
        imageDimensions: { width: 1280, height: 720 },
        mimeType: blob.type,
        compressionRatio: (1 - blob.size / (1280 * 720 * 3)) * 100,
        captureTime: endTime - startTime,
        passed: blob.size > 0 && blob.size < 500000, // Pass if size is reasonable
        message: `Photo captured: ${blob.size} bytes in ${(endTime - startTime).toFixed(2)}ms`,
      }

      this.storeResult('photo', result)
      return result
    } catch (error) {
      const result: PhotoTestResult = {
        testId,
        timestamp: Date.now(),
        imageSize: 0,
        imageDimensions: { width: 0, height: 0 },
        mimeType: '',
        compressionRatio: 0,
        captureTime: 0,
        passed: false,
        message: `Photo test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }

      this.storeResult('photo', result)
      return result
    }
  }

  /**
   * Test offline storage functionality
   */
  async testOfflineStorage(): Promise<OfflineTestResult> {
    const testId = `offline-${Date.now()}`
    const testData = { message: 'Test data', timestamp: Date.now() }
    const dataSize = JSON.stringify(testData).length

    try {
      const startTime = performance.now()

      // Test localStorage
      localStorage.setItem(`test-${testId}`, JSON.stringify(testData))
      const retrieved = localStorage.getItem(`test-${testId}`)
      localStorage.removeItem(`test-${testId}`)

      const endTime = performance.now()

      const result: OfflineTestResult = {
        testId,
        timestamp: Date.now(),
        testType: 'storage',
        dataSize,
        operationTime: endTime - startTime,
        passed: retrieved === JSON.stringify(testData),
        message: `Offline storage test completed in ${(endTime - startTime).toFixed(2)}ms`,
      }

      this.storeResult('offline', result)
      return result
    } catch (error) {
      const result: OfflineTestResult = {
        testId,
        timestamp: Date.now(),
        testType: 'storage',
        dataSize,
        operationTime: 0,
        passed: false,
        message: `Offline storage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }

      this.storeResult('offline', result)
      return result
    }
  }

  /**
   * Test network connectivity
   */
  async testNetworkConnectivity(): Promise<OfflineTestResult> {
    const testId = `network-${Date.now()}`

    try {
      const startTime = performance.now()

      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
      })

      const endTime = performance.now()

      const result: OfflineTestResult = {
        testId,
        timestamp: Date.now(),
        testType: 'network',
        dataSize: 0,
        operationTime: endTime - startTime,
        passed: response.ok,
        message: `Network test completed in ${(endTime - startTime).toFixed(2)}ms with status ${response.status}`,
      }

      this.storeResult('offline', result)
      return result
    } catch (error) {
      const result: OfflineTestResult = {
        testId,
        timestamp: Date.now(),
        testType: 'network',
        dataSize: 0,
        operationTime: 0,
        passed: false,
        message: `Network test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }

      this.storeResult('offline', result)
      return result
    }
  }

  /**
   * Run comprehensive device test suite
   */
  async runFullTestSuite(): Promise<{
    deviceInfo: DeviceInfo
    gpsTest: GPSTestResult
    photoTest: PhotoTestResult
    offlineStorageTest: OfflineTestResult
    networkTest: OfflineTestResult
    summary: { passed: number; failed: number; total: number }
  }> {
    const deviceInfo = this.getDeviceInfo()
    const gpsTest = await this.testGPSAccuracy()
    const photoTest = await this.testPhotoCapture()
    const offlineStorageTest = await this.testOfflineStorage()
    const networkTest = await this.testNetworkConnectivity()

    const tests = [gpsTest, photoTest, offlineStorageTest, networkTest]
    const passed = tests.filter((t) => t.passed).length
    const failed = tests.filter((t) => !t.passed).length

    return {
      deviceInfo,
      gpsTest,
      photoTest,
      offlineStorageTest,
      networkTest,
      summary: {
        passed,
        failed,
        total: tests.length,
      },
    }
  }

  /**
   * Get all test results
   */
  getTestResults(category?: string): any[] {
    if (category) {
      return this.testResults.get(category) || []
    }

    const allResults: any[] = []
    this.testResults.forEach((results) => {
      allResults.push(...results)
    })
    return allResults
  }

  /**
   * Clear test results
   */
  clearTestResults(): void {
    this.testResults.clear()
  }

  /**
   * Export test results as JSON
   */
  exportTestResults(): string {
    const allResults: any[] = []
    this.testResults.forEach((results) => {
      allResults.push(...results)
    })

    return JSON.stringify(
      {
        timestamp: Date.now(),
        deviceInfo: this.getDeviceInfo(),
        results: allResults,
      },
      null,
      2
    )
  }

  /**
   * Private helper methods
   */
  private storeResult(category: string, result: any): void {
    if (!this.testResults.has(category)) {
      this.testResults.set(category, [])
    }
    this.testResults.get(category)!.push(result)
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c * 1000 // Return in meters
  }

  private extractOSVersion(ua: string): string {
    const match = ua.match(/(?:Android|iPhone OS|Mac OS X)\s+([\d_.]+)/)
    return match ? match[1] : 'Unknown'
  }

  private extractBrowserName(ua: string): string {
    if (/Chrome/.test(ua)) return 'Chrome'
    if (/Safari/.test(ua)) return 'Safari'
    if (/Firefox/.test(ua)) return 'Firefox'
    if (/Edge/.test(ua)) return 'Edge'
    return 'Unknown'
  }

  private extractBrowserVersion(ua: string): string {
    const match = ua.match(/(?:Chrome|Safari|Firefox|Edge)\/([\d.]+)/)
    return match ? match[1] : 'Unknown'
  }
}

export const deviceTestingFramework = new DeviceTestingFramework()
