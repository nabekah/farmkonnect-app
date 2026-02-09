import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Calendar, Clock, User, MapPin, Phone, CheckCircle, AlertCircle } from "lucide-react";

export default function TelemedicineScheduler() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const upcomingSessions = [
    {
      id: 1,
      animal: "Bessie",
      veterinarian: "Dr. Kwame Asante",
      date: "2026-02-15",
      time: "10:00 AM",
      type: "Consultation",
      status: "scheduled",
      meetingLink: "https://meet.google.com/abc-defg-hij",
    },
    {
      id: 2,
      animal: "Daisy",
      veterinarian: "Dr. Ama Boateng",
      date: "2026-02-17",
      time: "2:00 PM",
      type: "Follow-up",
      status: "scheduled",
      meetingLink: "https://meet.google.com/xyz-uvwx-yz",
    },
  ];

  const completedSessions = [
    {
      id: 3,
      animal: "Molly",
      veterinarian: "Dr. Kwame Asante",
      date: "2026-02-08",
      duration: "28 minutes",
      status: "completed",
      recordingUrl: "https://recordings.example.com/session-3",
    },
    {
      id: 4,
      animal: "Stella",
      veterinarian: "Dr. Ama Boateng",
      date: "2026-02-05",
      duration: "35 minutes",
      status: "completed",
      recordingUrl: "https://recordings.example.com/session-4",
    },
  ];

  const availableVeterinarians = [
    { id: 1, name: "Dr. Kwame Asante", specialty: "Dairy Cattle", rating: 4.8 },
    { id: 2, name: "Dr. Ama Boateng", specialty: "Poultry & Livestock", rating: 4.9 },
    { id: 3, name: "Dr. Yaw Mensah", specialty: "Exotic Animals", rating: 4.7 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Telemedicine Scheduler</h1>
          <p className="text-gray-600">Schedule and manage video consultations with veterinarians</p>
        </div>
        <Button className="gap-2">
          <Video className="w-4 h-4" />
          Schedule Consultation
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="schedule">Schedule New</TabsTrigger>
        </TabsList>

        {/* Upcoming Sessions */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold">{session.animal}</h3>
                        <p className="text-gray-600 text-sm">{session.type}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{session.veterinarian}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{session.time}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          Join Meeting
                        </Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Meeting Details</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Google Meet</span>
                        </div>
                        <div className="text-xs text-gray-600 break-all">
                          {session.meetingLink}
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-3">
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No upcoming sessions scheduled</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Sessions */}
        <TabsContent value="completed" className="space-y-4">
          {completedSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-bold">{session.animal}</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">{session.veterinarian}</p>
                      <p className="text-gray-600">{session.date} • {session.duration}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Recording
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Schedule New */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Consultation</CardTitle>
              <CardDescription>Select a veterinarian and preferred time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Select Veterinarian */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Select Veterinarian</label>
                <div className="space-y-2">
                  {availableVeterinarians.map((vet) => (
                    <div
                      key={vet.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{vet.name}</p>
                          <p className="text-sm text-gray-600">{vet.specialty}</p>
                        </div>
                        <span className="text-sm font-semibold text-yellow-600">★ {vet.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Date */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Preferred Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Select Time */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Preferred Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Consultation Type</label>
                <div className="space-y-2">
                  {["Initial Consultation", "Follow-up", "Emergency", "Routine Check"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" className="w-4 h-4" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Additional Notes</label>
                <textarea
                  placeholder="Describe the animal's condition or concerns..."
                  className="w-full px-3 py-2 border rounded-lg min-h-24"
                />
              </div>

              <Button className="w-full">Schedule Consultation</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
