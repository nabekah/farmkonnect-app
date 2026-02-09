import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, FileText, MessageSquare, Plus } from "lucide-react";

export default function VeterinaryDashboard() {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("directory");

  // Fetch farms
  const { data: farms } = trpc.farms.list.useQuery();

  // Fetch veterinarian directory
  const { data: vets } = trpc.vetDirectory.searchVeterinarians.useQuery({
    specialization: undefined,
    region: undefined,
    telemedicineOnly: false,
  });

  // Fetch upcoming appointments
  const { data: appointments } = trpc.telemedicineManagement.getUpcomingAppointments.useQuery({
    farmId: selectedFarmId,
    daysAhead: 30,
  });

  // Fetch active prescriptions
  const { data: prescriptions } = trpc.prescriptionManagement.getActivePrescriptions.useQuery({
    farmId: selectedFarmId,
  });

  // Fetch prescription summary
  const { data: prescriptionSummary } = trpc.prescriptionManagement.getPrescriptionSummary.useQuery({
    farmId: selectedFarmId,
  });

  // Fetch appointment stats
  const { data: appointmentStats } = trpc.telemedicineManagement.getAppointmentStats.useQuery({
    farmId: selectedFarmId,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Veterinary Management</h1>
          <p className="text-slate-600">Manage veterinary appointments, prescriptions, and communications</p>
        </div>

        {/* Farm Selector */}
        {farms && farms.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{prescriptionSummary?.activePrescriptions || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{appointmentStats?.scheduledAppointments || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Vets Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{vets?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Verified veterinarians</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Prescription Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">GHS {prescriptionSummary?.totalCost || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Total spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory">Vet Directory</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="communications">Messages</TabsTrigger>
          </TabsList>

          {/* Vet Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Find Veterinarians</CardTitle>
                <CardDescription>Search and connect with verified veterinarians</CardDescription>
              </CardHeader>
              <CardContent>
                {vets && vets.length > 0 ? (
                  <div className="space-y-4">
                    {vets.slice(0, 5).map((vet) => (
                      <div key={vet.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{vet.clinicName}</h3>
                            <p className="text-sm text-slate-600">{vet.specialization}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-500">★ {vet.rating}</div>
                            <p className="text-xs text-slate-500">{vet.totalReviews} reviews</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div>📍 {vet.clinicCity}, {vet.clinicRegion}</div>
                          <div>📞 {vet.clinicPhone}</div>
                          <div>💰 GHS {vet.consultationFee} per consultation</div>
                          <div>{vet.yearsOfExperience} years experience</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Appointment
                          </Button>
                          {vet.telemedicineAvailable && (
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Telemedicine
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No veterinarians found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled veterinary appointments</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{apt.reason}</h3>
                            <p className="text-sm text-slate-600">
                              {new Date(apt.appointmentDate).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">Duration: {apt.duration} minutes</p>
                        {apt.telemedicineLink && (
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Join Telemedicine
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Prescriptions</CardTitle>
                <CardDescription>Medications prescribed by veterinarians</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions && prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{rx.medicationName}</h3>
                            <p className="text-sm text-slate-600">{rx.dosage} - {rx.frequency}</p>
                          </div>
                          <div className="text-right">
                            {rx.daysRemaining && rx.daysRemaining <= 3 && (
                              <div className="flex items-center text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Expiring soon
                              </div>
                            )}
                            <p className="text-xs text-slate-500">
                              {rx.daysRemaining} days remaining
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div>Route: {rx.route}</div>
                          <div>Quantity: {rx.quantity}</div>
                          <div>Duration: {rx.duration} days</div>
                          <div>Status: {rx.complianceStatus}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No active prescriptions</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Direct Messages</CardTitle>
                <CardDescription>Communicate with your veterinarians</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center py-8">Message interface coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
