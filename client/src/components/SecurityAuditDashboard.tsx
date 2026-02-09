import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, TrendingUp, Users, Lock, Activity } from "lucide-react";

interface SecurityMetrics {
  date: string;
  loginAttempts: number;
  failedLogins: number;
  successfulLogins: number;
  suspiciousActivities: number;
  mfaUsageRate: number;
  complianceScore: number;
}

interface SecurityAuditDashboardProps {
  farmId: string;
}

export const SecurityAuditDashboard: React.FC<SecurityAuditDashboardProps> = ({ farmId }) => {
  // Mock data - in production this would come from the backend
  const metricsData: SecurityMetrics[] = [
    { date: "Mon", loginAttempts: 45, failedLogins: 3, successfulLogins: 42, suspiciousActivities: 1, mfaUsageRate: 95, complianceScore: 92 },
    { date: "Tue", loginAttempts: 52, failedLogins: 5, successfulLogins: 47, suspiciousActivities: 2, mfaUsageRate: 96, complianceScore: 91 },
    { date: "Wed", loginAttempts: 48, failedLogins: 2, successfulLogins: 46, suspiciousActivities: 0, mfaUsageRate: 97, complianceScore: 93 },
    { date: "Thu", loginAttempts: 61, failedLogins: 4, successfulLogins: 57, suspiciousActivities: 1, mfaUsageRate: 95, complianceScore: 92 },
    { date: "Fri", loginAttempts: 55, failedLogins: 3, successfulLogins: 52, suspiciousActivities: 2, mfaUsageRate: 98, complianceScore: 94 },
    { date: "Sat", loginAttempts: 32, failedLogins: 1, successfulLogins: 31, suspiciousActivities: 0, mfaUsageRate: 99, complianceScore: 95 },
    { date: "Sun", loginAttempts: 28, failedLogins: 1, successfulLogins: 27, suspiciousActivities: 0, mfaUsageRate: 100, complianceScore: 96 }
  ];

  const accessPatternData = [
    { name: "Peak Hours (9-17)", value: 65, color: "#3b82f6" },
    { name: "Off-Hours", value: 25, color: "#f59e0b" },
    { name: "Night", value: 10, color: "#ef4444" }
  ];

  const complianceMetrics = [
    { label: "MFA Adoption", value: 96, target: 100, status: "good" },
    { label: "Password Policy", value: 98, target: 100, status: "good" },
    { label: "Access Reviews", value: 92, target: 95, status: "warning" },
    { label: "Audit Logging", value: 100, target: 100, status: "good" }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">321</div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">19</div>
            <p className="text-xs text-gray-500">↓ 5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              MFA Enabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96%</div>
            <p className="text-xs text-gray-500">Users with MFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">93%</div>
            <p className="text-xs text-gray-500">ISO 27001</p>
          </CardContent>
        </Card>
      </div>

      {/* Login Attempts Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Login Activity Trend</CardTitle>
          <CardDescription>Weekly login attempts and failures</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="loginAttempts" stroke="#3b82f6" name="Total Attempts" />
              <Line type="monotone" dataKey="failedLogins" stroke="#ef4444" name="Failed Logins" />
              <Line type="monotone" dataKey="successfulLogins" stroke="#10b981" name="Successful" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Access Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Access Pattern Distribution</CardTitle>
            <CardDescription>When users access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={accessPatternData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {accessPatternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Metrics</CardTitle>
            <CardDescription>ISO 27001 compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <Badge variant={metric.status === "good" ? "default" : "secondary"}>
                      {metric.value}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${metric.status === "good" ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle>MFA Usage & Compliance Score Trend</CardTitle>
          <CardDescription>Weekly trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mfaUsageRate" fill="#10b981" name="MFA Usage %" />
              <Bar dataKey="complianceScore" fill="#3b82f6" name="Compliance Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
