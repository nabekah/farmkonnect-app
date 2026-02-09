import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, Calendar, Heart, Thermometer, Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function HealthRecordsDashboard() {
  const { user } = useAuth();
  const [selectedAnimalId, setSelectedAnimalId] = useState<number>(1);
  const [selectedFarmId, setSelectedFarmId] = useState<number>(1);

  // Mock data for demonstration
  const healthSummary = {
    lastCheckup: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextVaccination: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    activeIncidents: 0,
    recentMetrics: {
      weight: 465,
      temperature: 38.6,
      heartRate: 72,
      bodyConditionScore: 3.5,
    },
    vaccinationStatus: "up-to-date",
    healthRisk: "low",
    recommendations: [
      "Schedule routine checkup in 2 weeks",
      "Monitor weight gain",
      "Ensure proper nutrition",
    ],
  };

  const healthMetrics = [
    { date: "Week 1", weight: 450, temperature: 38.5, heartRate: 68 },
    { date: "Week 2", weight: 455, temperature: 38.4, heartRate: 70 },
    { date: "Week 3", weight: 460, temperature: 38.6, heartRate: 72 },
    { date: "Week 4", weight: 465, temperature: 38.6, heartRate: 71 },
    { date: "Week 5", weight: 468, temperature: 38.5, heartRate: 72 },
  ];

  const vaccinationData = [
    { name: "FMD", value: 42, coverage: 93.3 },
    { name: "Brucellosis", value: 40, coverage: 88.9 },
    { name: "Anthrax", value: 38, coverage: 84.4 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Health Records Dashboard</h1>
          <p className="text-gray-600">Monitor livestock health, vaccinations, and disease incidents</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Last Checkup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days ago</div>
            <p className="text-xs text-gray-600">Next: 2 weeks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Vaccinations Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-600">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">No active issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-gray-600">Low risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        {/* Health Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics Trend (Last 5 Weeks)</CardTitle>
              <CardDescription>Weight, Temperature, and Heart Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#3b82f6" name="Weight (kg)" />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#ef4444" name="Temp (°C)" />
                  <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#10b981" name="Heart Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Current Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-bold">465 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-bold">38.6°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heart Rate:</span>
                  <span className="font-bold">72 bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Body Condition:</span>
                  <span className="font-bold">3.5/5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {healthSummary.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vaccinations Tab */}
        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vaccination Coverage</CardTitle>
              <CardDescription>Farm-wide vaccination statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vaccinationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, coverage }) => `${name} ${coverage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vaccinationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Vaccinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { vaccine: "Foot and Mouth Disease", dueDate: "30 days", animal: "Bessie" },
                { vaccine: "Brucellosis", dueDate: "60 days", animal: "Daisy" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.vaccine}</p>
                    <p className="text-sm text-gray-600">{item.animal}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">Due in {item.dueDate}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disease Incidents</CardTitle>
              <CardDescription>Recent health issues and treatments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">No Active Incidents</span>
                </div>
                <p className="text-sm text-gray-600">All animals are healthy and disease-free</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { disease: "Mastitis", date: "30 days ago", animal: "Stella", status: "Recovered" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.disease}</p>
                    <p className="text-sm text-gray-600">{item.animal} - {item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{item.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
              <CardDescription>Complete health history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Vaccination", date: "7 days ago", vet: "Dr. Kwame Asante" },
                  { type: "Health Check", date: "14 days ago", vet: "Dr. Ama Boateng" },
                  { type: "Treatment", date: "30 days ago", vet: "Dr. Kwame Asante" },
                ].map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-gray-600">{record.vet}</p>
                    </div>
                    <span className="text-sm text-gray-600">{record.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
