import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Shield,
  LogOut,
  History,
  Settings,
  Zap,
} from "lucide-react";

/**
 * Biometric Authentication Component
 * Fingerprint/face recognition with offline PIN backup
 */
export const BiometricAuthentication: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "login" | "register" | "status" | "logs" | "settings"
  >("login");
  const [authMethod, setAuthMethod] = useState<"fingerprint" | "face" | "pin" | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [pin, setPin] = useState("");

  // Mock data
  const biometricStatus = {
    fingerprintRegistered: true,
    faceRegistered: true,
    pinBackupSet: true,
    lastAuthMethod: "fingerprint",
    lastAuthTime: "30 minutes ago",
    authAttempts: 0,
    failedAttempts: 0,
    accountLocked: false,
  };

  const authLogs = [
    {
      id: 1,
      method: "fingerprint",
      status: "success",
      matchScore: 92.5,
      timestamp: "30 minutes ago",
      device: "Samsung Galaxy S21",
    },
    {
      id: 2,
      method: "face",
      status: "success",
      matchScore: 88.3,
      timestamp: "2 hours ago",
      device: "iPhone 13",
    },
    {
      id: 3,
      method: "offline_pin",
      status: "success",
      timestamp: "1 day ago",
      device: "Offline Mode",
    },
  ];

  const handleScan = (method: "fingerprint" | "face") => {
    setAuthMethod(method);
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      console.log("PIN submitted:", pin);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Biometric Authentication</h1>
            <p className="text-gray-600 mt-1">Secure access with fingerprint, face, or offline PIN</p>
          </div>
          <Shield className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("login")}
            variant={viewMode === "login" ? "default" : "outline"}
            className={viewMode === "login" ? "bg-blue-600 text-white" : ""}
          >
            <Lock className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button
            onClick={() => setViewMode("register")}
            variant={viewMode === "register" ? "default" : "outline"}
            className={viewMode === "register" ? "bg-blue-600 text-white" : ""}
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            Register
          </Button>
          <Button
            onClick={() => setViewMode("status")}
            variant={viewMode === "status" ? "default" : "outline"}
            className={viewMode === "status" ? "bg-blue-600 text-white" : ""}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Status
          </Button>
          <Button
            onClick={() => setViewMode("logs")}
            variant={viewMode === "logs" ? "default" : "outline"}
            className={viewMode === "logs" ? "bg-blue-600 text-white" : ""}
          >
            <History className="w-4 h-4 mr-2" />
            Logs
          </Button>
          <Button
            onClick={() => setViewMode("settings")}
            variant={viewMode === "settings" ? "default" : "outline"}
            className={viewMode === "settings" ? "bg-blue-600 text-white" : ""}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Login View */}
        {viewMode === "login" && (
          <div className="space-y-6">
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-6">Choose authentication method</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Fingerprint */}
                <Card
                  className={`p-6 cursor-pointer transition-all ${
                    authMethod === "fingerprint"
                      ? "border-2 border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:shadow-lg"
                  }`}
                  onClick={() => handleScan("fingerprint")}
                >
                  <Fingerprint className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                  <p className="font-bold text-gray-900">Fingerprint</p>
                  <p className="text-xs text-gray-600 mt-2">Fast & Secure</p>
                </Card>

                {/* Face Recognition */}
                <Card
                  className={`p-6 cursor-pointer transition-all ${
                    authMethod === "face"
                      ? "border-2 border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:shadow-lg"
                  }`}
                  onClick={() => handleScan("face")}
                >
                  <Eye className="w-12 h-12 mx-auto text-green-600 mb-3" />
                  <p className="font-bold text-gray-900">Face ID</p>
                  <p className="text-xs text-gray-600 mt-2">Hands-free</p>
                </Card>

                {/* Offline PIN */}
                <Card
                  className={`p-6 cursor-pointer transition-all ${
                    authMethod === "pin"
                      ? "border-2 border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:shadow-lg"
                  }`}
                  onClick={() => setAuthMethod("pin")}
                >
                  <Lock className="w-12 h-12 mx-auto text-orange-600 mb-3" />
                  <p className="font-bold text-gray-900">Offline PIN</p>
                  <p className="text-xs text-gray-600 mt-2">No Connection</p>
                </Card>
              </div>

              {/* Scanning State */}
              {isScanning && (
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {authMethod === "fingerprint" && "Place your finger on the scanner..."}
                    {authMethod === "face" && "Position your face in the frame..."}
                  </p>
                </div>
              )}

              {/* PIN Input */}
              {authMethod === "pin" && (
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">Enter your 4-digit PIN</p>
                  <div className="flex gap-2 justify-center mb-4">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        type="password"
                        maxLength={1}
                        value={pin[i] || ""}
                        onChange={(e) => {
                          const newPin = pin.split("");
                          newPin[i] = e.target.value;
                          setPin(newPin.join(""));
                        }}
                        className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {authMethod && !isScanning && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                    onClick={authMethod === "pin" ? handlePinSubmit : undefined}
                  >
                    {authMethod === "pin" ? "Verify PIN" : "Authenticate"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => {
                      setAuthMethod(null);
                      setPin("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>

            {/* Success Message */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-gray-900">Last Authentication</p>
                  <p className="text-sm text-gray-600">{biometricStatus.lastAuthTime} via {biometricStatus.lastAuthMethod}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Register View */}
        {viewMode === "register" && (
          <div className="space-y-4">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="font-bold text-gray-900 mb-2">Register New Biometric</p>
              <p className="text-sm text-gray-600">Add fingerprint or face recognition for faster authentication</p>
            </Card>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Available Methods</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-bold text-gray-900">Fingerprint</p>
                      <p className="text-xs text-gray-600">Register your fingerprint</p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Register</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-gray-900">Face Recognition</p>
                      <p className="text-xs text-gray-600">Register your face</p>
                    </div>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Register</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-bold text-gray-900">Backup PIN</p>
                      <p className="text-xs text-gray-600">Set offline backup PIN</p>
                    </div>
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700">Set PIN</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Status View */}
        {viewMode === "status" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-gray-600 text-xs">Fingerprint</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {biometricStatus.fingerprintRegistered ? "✓" : "✗"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-gray-600 text-xs">Face ID</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {biometricStatus.faceRegistered ? "✓" : "✗"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-gray-600 text-xs">Backup PIN</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {biometricStatus.pinBackupSet ? "✓" : "✗"}
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Security Status</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed Attempts</span>
                  <span className="font-bold text-gray-900">{biometricStatus.failedAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Locked</span>
                  <span className="font-bold text-green-600">No</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Logs View */}
        {viewMode === "logs" && (
          <div className="space-y-3">
            {authLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {log.method === "fingerprint" && <Fingerprint className="w-5 h-5 text-blue-600" />}
                    {log.method === "face" && <Eye className="w-5 h-5 text-green-600" />}
                    {log.method === "offline_pin" && <Lock className="w-5 h-5 text-orange-600" />}
                    <div>
                      <p className="font-bold text-gray-900 capitalize">{log.method.replace("_", " ")}</p>
                      <p className="text-xs text-gray-600">{log.device}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{log.timestamp}</p>
                    <p className="text-sm font-bold text-green-600">Success</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Settings View */}
        {viewMode === "settings" && (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Authentication Settings</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <p className="text-gray-900">Require Biometric for Sensitive Operations</p>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <p className="text-gray-900">Enable Offline PIN Backup</p>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <p className="text-gray-900">Auto-lock After 5 Minutes</p>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-3">Danger Zone</p>
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Revoke All Biometric Data
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricAuthentication;
