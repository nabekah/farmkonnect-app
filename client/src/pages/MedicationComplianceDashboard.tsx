import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, Download, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Medication Compliance Dashboard
 * Tracks medication adherence and compliance metrics
 */
export default function MedicationComplianceDashboard() {
  const { user } = useAuth();
  const [selectedFarmId] = useState(1);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  // Fetch compliance dashboard
  const { data: dashboard, isLoading: dashboardLoading } = trpc.medicationCompliance.getDashboard.useQuery(
    { farmId: selectedFarmId },
    { enabled: !!selectedFarmId }
  );

  // Fetch compliance alerts
  const { data: alerts = [], isLoading: alertsLoading } = trpc.medicationCompliance.getAlerts.useQuery(
    { farmId: selectedFarmId },
    { enabled: !!selectedFarmId }
  );

  // Fetch compliance records for selected prescription
  const { data: complianceRecords = [] } = trpc.medicationCompliance.getByPrescription.useQuery(
    { prescriptionId: selectedPrescriptionId || 1 },
    { enabled: !!selectedPrescriptionId }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'administered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Please log in to view compliance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medication Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">Track medication adherence and compliance metrics for your farm</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Key Metrics */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{dashboard.averageCompliance}%</div>
              <p className="text-xs text-gray-500 mt-1">Farm-wide compliance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Animals on Medication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.totalAnimalsOnMedication}</div>
              <p className="text-xs text-gray-500 mt-1">Currently medicated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Perfect Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{dashboard.animalsWithPerfectCompliance}</div>
              <p className="text-xs text-gray-500 mt-1">100% adherence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Missed Doses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{dashboard.recentMissedDoses}</div>
              <p className="text-xs text-gray-500 mt-1">Recent missed doses</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <div key={alert.id} className={`border rounded-lg p-4 flex items-start gap-3 ${getSeverityColor(alert.severity)}`}>
              {alert.severity === 'critical' ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{alert.animalName}</h3>
                <p className="text-sm mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="animals">By Animal</TabsTrigger>
          <TabsTrigger value="records">Compliance Records</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Compliance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trend</CardTitle>
                <CardDescription>Farm-wide compliance over time</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboard.complianceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="compliance" stroke="#3b82f6" name="Compliance %" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Animal Compliance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Animal Compliance Status</CardTitle>
                <CardDescription>Compliance by animal</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard && (
                  <div className="space-y-3">
                    {dashboard.animalComplianceBreakdown.map((animal: any) => (
                      <div key={animal.animalId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{animal.animalName}</p>
                          <p className="text-sm text-gray-500">{animal.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                animal.compliance >= 90
                                  ? 'bg-green-500'
                                  : animal.compliance >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${animal.compliance}%` }}
                            />
                          </div>
                          <span className="font-semibold w-12 text-right">{animal.compliance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Animals Tab */}
        <TabsContent value="animals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance by Animal</CardTitle>
              <CardDescription>Individual animal compliance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard && (
                <div className="space-y-4">
                  {dashboard.animalComplianceBreakdown.map((animal: any) => (
                    <div key={animal.animalId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{animal.animalName}</h3>
                          <p className="text-sm text-gray-600">Compliance Status: {animal.status}</p>
                        </div>
                        <Badge
                          className={
                            animal.compliance >= 90
                              ? 'bg-green-100 text-green-800'
                              : animal.compliance >= 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {animal.compliance}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            animal.compliance >= 90
                              ? 'bg-green-500'
                              : animal.compliance >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${animal.compliance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Administration Records</CardTitle>
              <CardDescription>Detailed compliance records</CardDescription>
            </CardHeader>
            <CardContent>
              {complianceRecords.length > 0 ? (
                <div className="space-y-3">
                  {complianceRecords.map((record: any) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{record.medicationName}</p>
                          <p className="text-sm text-gray-600">
                            Scheduled: {new Date(record.scheduledDate).toLocaleDateString()} at {record.scheduledTime}
                          </p>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>

                      {record.status === 'administered' && (
                        <div className="text-sm text-gray-600 mb-2">
                          <p>Administered: {new Date(record.administeredDate).toLocaleDateString()} at {record.administeredTime}</p>
                          <p>Dosage Given: {record.dosageGiven}</p>
                          {record.notes && <p>Notes: {record.notes}</p>}
                        </div>
                      )}

                      {record.status === 'missed' && (
                        <p className="text-sm text-red-600 mb-2">Dose was missed</p>
                      )}

                      <div className="flex gap-2">
                        {record.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">
                              Mark as Administered
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              Mark as Missed
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No compliance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
