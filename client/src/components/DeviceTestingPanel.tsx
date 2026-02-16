import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deviceTestingFramework, DeviceInfo, GPSTestResult, PhotoTestResult, OfflineTestResult } from '@/lib/deviceTesting'
import { Smartphone, MapPin, Camera, Wifi, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function DeviceTestingPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [gpsResult, setGpsResult] = useState<GPSTestResult | null>(null)
  const [photoResult, setPhotoResult] = useState<PhotoTestResult | null>(null)
  const [offlineResult, setOfflineResult] = useState<OfflineTestResult | null>(null)
  const [networkResult, setNetworkResult] = useState<OfflineTestResult | null>(null)
  const [testSummary, setTestSummary] = useState<{ passed: number; failed: number; total: number } | null>(null)

  const handleRunTests = async () => {
    setIsRunning(true)
    try {
      const results = await deviceTestingFramework.runFullTestSuite()

      setDeviceInfo(results.deviceInfo)
      setGpsResult(results.gpsTest)
      setPhotoResult(results.photoTest)
      setOfflineResult(results.offlineStorageTest)
      setNetworkResult(results.networkTest)
      setTestSummary(results.summary)
    } catch (error) {
      console.error('Test suite failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleExportResults = () => {
    const data = deviceTestingFramework.exportTestResults()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `device-test-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearResults = () => {
    deviceTestingFramework.clearTestResults()
    setDeviceInfo(null)
    setGpsResult(null)
    setPhotoResult(null)
    setOfflineResult(null)
    setNetworkResult(null)
    setTestSummary(null)
  }

  const TestResultBadge = ({ passed }: { passed: boolean }) => (
    <Badge className={passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {passed ? (
        <>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          PASSED
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3 mr-1" />
          FAILED
        </>
      )}
    </Badge>
  )

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Testing Framework
          </CardTitle>
          <CardDescription>Test GPS accuracy, photo capture, and offline functionality on real devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRunTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
              {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </Button>
            <Button onClick={handleExportResults} disabled={!testSummary} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
            <Button onClick={handleClearResults} disabled={!testSummary} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Results
            </Button>
          </div>

          {/* Test Summary */}
          {testSummary && (
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{testSummary.passed}</div>
                    <p className="text-sm text-slate-600">Passed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{testSummary.failed}</div>
                    <p className="text-sm text-slate-600">Failed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{testSummary.total}</div>
                    <p className="text-sm text-slate-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Device Information */}
          {deviceInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Device Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-slate-600">Platform</p>
                    <p className="text-slate-900">{deviceInfo.platform}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">OS Version</p>
                    <p className="text-slate-900">{deviceInfo.osVersion}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Browser</p>
                    <p className="text-slate-900">
                      {deviceInfo.browserName} {deviceInfo.browserVersion}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Screen Size</p>
                    <p className="text-slate-900">
                      {deviceInfo.screenWidth}x{deviceInfo.screenHeight}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Device Type</p>
                    <p className="text-slate-900">{deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Touch Support</p>
                    <p className="text-slate-900">{deviceInfo.isTouch ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GPS Test Results */}
          {gpsResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    GPS Accuracy Test
                  </CardTitle>
                  <TestResultBadge passed={gpsResult.passed} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-slate-600">Latitude</p>
                    <p className="text-slate-900">{gpsResult.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Longitude</p>
                    <p className="text-slate-900">{gpsResult.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Accuracy</p>
                    <p className="text-slate-900">{gpsResult.accuracy.toFixed(2)}m</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Altitude</p>
                    <p className="text-slate-900">
                      {gpsResult.altitude ? `${gpsResult.altitude.toFixed(2)}m` : 'N/A'}
                    </p>
                  </div>
                  {gpsResult.distanceFromExpected && (
                    <div>
                      <p className="font-semibold text-slate-600">Distance from Expected</p>
                      <p className="text-slate-900">{gpsResult.distanceFromExpected.toFixed(2)}m</p>
                    </div>
                  )}
                </div>
                <p className="text-slate-600 mt-2">{gpsResult.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Photo Test Results */}
          {photoResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photo Capture Test
                  </CardTitle>
                  <TestResultBadge passed={photoResult.passed} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-slate-600">Image Size</p>
                    <p className="text-slate-900">{(photoResult.imageSize / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Dimensions</p>
                    <p className="text-slate-900">
                      {photoResult.imageDimensions.width}x{photoResult.imageDimensions.height}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Compression Ratio</p>
                    <p className="text-slate-900">{photoResult.compressionRatio.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Capture Time</p>
                    <p className="text-slate-900">{photoResult.captureTime.toFixed(2)}ms</p>
                  </div>
                </div>
                <p className="text-slate-600 mt-2">{photoResult.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Offline Storage Test Results */}
          {offlineResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Offline Storage Test</CardTitle>
                  <TestResultBadge passed={offlineResult.passed} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-slate-600">Data Size</p>
                    <p className="text-slate-900">{offlineResult.dataSize} bytes</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">Operation Time</p>
                    <p className="text-slate-900">{offlineResult.operationTime.toFixed(2)}ms</p>
                  </div>
                </div>
                <p className="text-slate-600 mt-2">{offlineResult.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Network Test Results */}
          {networkResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Network Connectivity Test
                  </CardTitle>
                  <TestResultBadge passed={networkResult.passed} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-slate-600">Response Time</p>
                    <p className="text-slate-900">{networkResult.operationTime.toFixed(2)}ms</p>
                  </div>
                </div>
                <p className="text-slate-600 mt-2">{networkResult.message}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
