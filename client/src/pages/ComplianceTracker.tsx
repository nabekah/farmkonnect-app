import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Camera, AlertTriangle, TrendingUp, CheckCircle, AlertCircle, Upload } from "lucide-react";

export default function ComplianceTracker() {
  const { user } = useAuth();
  const [selectedPrescription, setSelectedPrescription] = useState<number>(1);

  const complianceData = [
    { day: "Mon", compliance: 100 },
    { day: "Tue", compliance: 100 },
    { day: "Wed", compliance: 67 },
    { day: "Thu", compliance: 100 },
    { day: "Fri", compliance: 100 },
    { day: "Sat", compliance: 67 },
    { day: "Sun", compliance: 100 },
  ];

  const complianceDistribution = [
    { name: "High (90-100%)", value: 10 },
    { name: "Medium (70-89%)", value: 2 },
    { name: "Low (<70%)", value: 0 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  const prescriptions = [
    { id: 1, animal: "Bessie", medication: "Antibiotics", compliance: 98 },
    { id: 2, animal: "Daisy", medication: "Pain Reliever", compliance: 72 },
    { id: 3, animal: "Molly", medication: "Vitamins", compliance: 96 },
  ];

  const dailyRecords = [
    { date: "2026-02-08", dosesGiven: 3, dosesScheduled: 3, compliance: 100, notes: "All doses given on time" },
    { date: "2026-02-07", dosesGiven: 2, dosesScheduled: 3, compliance: 67, notes: "Missed morning dose" },
    { date: "2026-02-06", dosesGiven: 3, dosesScheduled: 3, compliance: 100, notes: "All doses given on time" },
  ];

  const alerts = [
    { id: 1, type: "low-compliance", severity: "high", message: "Daisy has low medication compliance (72%)", action: "Review" },
    { id: 2, type: "missed-dose", severity: "medium", message: "Luna missed 2 doses this week", action: "Contact" },
    { id: 3, type: "expiring", severity: "low", message: "Bessie prescription expires in 3 days", action: "Renew" },
  ];

  const insights = [
    { title: "Best Compliance Day", description: "Monday has the highest compliance rate at 92%" },
    { title: "Weekend Challenge", description: "Compliance drops to 84% on weekends" },
    { title: "Positive Trend", description: "Compliance has improved 5% over the last week" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescription Compliance Tracker</h1>
          <p className="text-gray-600">Monitor medication adherence with photo/video evidence</p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Evidence
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87.5%</div>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">10</div>
            <p className="text-xs text-gray-600">Animals (90-100%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">2</div>
            <p className="text-xs text-gray-600">Low compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Compliance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="compliance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={complianceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-600">Severity: {alert.severity}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={() => setSelectedPrescription(rx.id)}
                    className={`w-full text-left p-3 border rounded-lg transition ${
                      selectedPrescription === rx.id ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{rx.animal}</p>
                        <p className="text-sm text-gray-600">{rx.medication}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{rx.compliance}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Records</CardTitle>
              <CardDescription>Last 30 days of compliance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyRecords.map((record, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <p className="text-sm text-gray-600">{record.notes}</p>
                      </div>
                      <span className={`text-sm font-bold ${record.compliance === 100 ? "text-green-600" : "text-orange-600"}`}>
                        {record.compliance}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {record.dosesGiven} of {record.dosesScheduled} doses given
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Upload Compliance Evidence
              </CardTitle>
              <CardDescription>Add photos or videos of medication administration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500">Supported: JPEG, PNG, MP4 (max 50MB)</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recent Evidence</h4>
                {[
                  { date: "2026-02-08", type: "photo", animal: "Bessie" },
                  { date: "2026-02-07", type: "video", animal: "Daisy" },
                  { date: "2026-02-06", type: "photo", animal: "Molly" },
                ].map((evidence, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{evidence.animal}</p>
                      <p className="text-xs text-gray-600">{evidence.type.toUpperCase()} • {evidence.date}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{insight.title}</p>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Consider setting phone reminders for medication times",
                "Compliance is good, continue current schedule",
                "Monitor for any side effects that might affect compliance",
              ].map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
