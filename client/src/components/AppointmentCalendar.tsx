import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AppointmentCalendarProps {
  veterinarianId: number;
  onSlotSelect?: (date: string, time: string) => void;
  appointmentDuration?: number;
}

export function AppointmentCalendar({ veterinarianId, onSlotSelect, appointmentDuration = 30 }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Fetch veterinarian details
  const { data: vetDetails } = trpc.veterinarianAvailability.getVeterinarianWithAvailability.useQuery(
    { veterinarianId },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  // Fetch calendar data for current month
  const startDate = useMemo(() => {
    const date = new Date(currentMonth);
    date.setDate(1);
    return date.toISOString().split("T")[0];
  }, [currentMonth]);

  const endDate = useMemo(() => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.toISOString().split("T")[0];
  }, [currentMonth]);

  const { data: calendarData } = trpc.veterinarianAvailability.getAvailableSlotsForDateRange.useQuery(
    {
      veterinarianId,
      startDate,
      endDate,
      duration: appointmentDuration,
    },
    { enabled: !!veterinarianId }
  );

  // Fetch available slots for selected date
  const { data: availableSlots } = trpc.veterinarianAvailability.getAvailableSlots.useQuery(
    {
      veterinarianId,
      date: selectedDate || new Date().toISOString().split("T")[0],
      duration: appointmentDuration,
    },
    { enabled: !!selectedDate }
  );

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const getDayAvailability = (date: Date | null) => {
    if (!date || !calendarData) return null;
    const dateStr = date.toISOString().split("T")[0];
    return calendarData.calendar.find((d) => d.date === dateStr);
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateInPast(date)) {
      const dateStr = date.toISOString().split("T")[0];
      setSelectedDate(dateStr);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  const handleSlotSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && onSlotSelect) {
      onSlotSelect(selectedDate, time);
    }
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Veterinarian Info */}
      {vetDetails && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{vetDetails.clinicName}</h3>
                <p className="text-sm text-muted-foreground">{vetDetails.specialization}</p>
                <p className="text-sm text-muted-foreground mt-2">{vetDetails.clinicCity}, {vetDetails.clinicRegion}</p>
                <p className="text-sm font-medium mt-2">Consultation Fee: {vetDetails.consultationFeeFormatted}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">{vetDetails.rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
                <p className="text-xs text-muted-foreground">{vetDetails.totalReviews} reviews</p>
                {vetDetails.acceptsTelemedicine && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Telemedicine Available</Badge>
                )}
                {vetDetails.upcomingAppointments > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">{vetDetails.upcomingAppointments} upcoming appointments</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("month")}
        >
          Month View
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("week")}
        >
          Week View
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Select a date to view available time slots</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateStr = date.toISOString().split("T")[0];
              const availability = getDayAvailability(date);
              const isPast = isDateInPast(date);
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(date);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(date)}
                  disabled={isPast}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all
                    ${isPast ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:border-blue-500"}
                    ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                    ${isTodayDate ? "ring-2 ring-orange-500" : ""}
                  `}
                >
                  <div className="text-sm font-semibold">{date.getDate()}</div>
                  {availability && (
                    <div className="text-xs mt-1">
                      {availability.hasAvailability ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{availability.availableSlots}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Full</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && availableSlots && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Available Times - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
            <CardDescription>
              {availableSlots.slots.filter((s) => !s.isBooked).length} slots available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots.slots.map((slot) => (
                <button
                  key={`${slot.startTime}-${slot.endTime}`}
                  onClick={() => handleSlotSelect(slot.startTime)}
                  disabled={slot.isBooked}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm font-medium
                    ${slot.isBooked
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : selectedTime === slot.startTime
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-blue-500 text-gray-700"
                    }
                  `}
                >
                  <div>{slot.startTime}</div>
                  <div className="text-xs text-muted-foreground">
                    {slot.isBooked ? "Booked" : "Available"}
                  </div>
                </button>
              ))}
            </div>

            {availableSlots.slots.filter((s) => !s.isBooked).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No available slots for this date. Please select another date.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-semibold">Appointment Selected</p>
                <p className="text-sm">
                  {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
