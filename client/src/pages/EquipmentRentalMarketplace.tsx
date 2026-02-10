import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

/**
 * Equipment Rental Marketplace Component
 * Peer-to-peer equipment rental platform
 */
export const EquipmentRentalMarketplace: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "browse" | "myListings" | "bookings" | "history" | "analytics"
  >("browse");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data
  const equipment = [
    {
      id: 1,
      name: "Tractor - John Deere 5100",
      category: "Tractors",
      owner: "Kwame Farms",
      dailyRate: 250,
      weeklyRate: 1500,
      monthlyRate: 5000,
      location: "Accra, Ghana",
      distance: 5.2,
      condition: "Excellent",
      rating: 4.8,
      reviews: 24,
      available: true,
      image: "tractor.jpg",
    },
    {
      id: 2,
      name: "Irrigation Pump - 5HP",
      category: "Irrigation",
      owner: "Ama's Farm",
      dailyRate: 50,
      weeklyRate: 300,
      monthlyRate: 1000,
      location: "Tema, Ghana",
      distance: 12.5,
      condition: "Good",
      rating: 4.5,
      reviews: 18,
      available: true,
      image: "pump.jpg",
    },
    {
      id: 3,
      name: "Harvester - CLAAS Lexion",
      category: "Harvesters",
      owner: "Peter's Cooperative",
      dailyRate: 400,
      weeklyRate: 2400,
      monthlyRate: 8000,
      location: "Kumasi, Ghana",
      distance: 45.3,
      condition: "Excellent",
      rating: 4.9,
      reviews: 32,
      available: false,
      image: "harvester.jpg",
    },
  ];

  const bookings = [
    {
      id: 1,
      equipment: "Tractor - John Deere 5100",
      owner: "Kwame Farms",
      startDate: "2026-02-15",
      endDate: "2026-02-20",
      totalCost: 1250,
      status: "confirmed",
    },
    {
      id: 2,
      equipment: "Irrigation Pump - 5HP",
      owner: "Ama's Farm",
      startDate: "2026-02-12",
      endDate: "2026-02-19",
      totalCost: 300,
      status: "active",
    },
  ];

  const analytics = {
    totalRentals: 12,
    activeRentals: 2,
    totalSpent: 4500,
    averageRating: 4.6,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Rental Marketplace</h1>
            <p className="text-gray-600 mt-1">Rent and share farm equipment with neighboring farmers</p>
          </div>
          <Wrench className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("browse")}
            variant={viewMode === "browse" ? "default" : "outline"}
            className={viewMode === "browse" ? "bg-blue-600 text-white" : ""}
          >
            <Search className="w-4 h-4 mr-2" />
            Browse Equipment
          </Button>
          <Button
            onClick={() => setViewMode("myListings")}
            variant={viewMode === "myListings" ? "default" : "outline"}
            className={viewMode === "myListings" ? "bg-blue-600 text-white" : ""}
          >
            <Plus className="w-4 h-4 mr-2" />
            My Listings
          </Button>
          <Button
            onClick={() => setViewMode("bookings")}
            variant={viewMode === "bookings" ? "default" : "outline"}
            className={viewMode === "bookings" ? "bg-blue-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            My Bookings
          </Button>
          <Button
            onClick={() => setViewMode("history")}
            variant={viewMode === "history" ? "default" : "outline"}
            className={viewMode === "history" ? "bg-blue-600 text-white" : ""}
          >
            <Clock className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button
            onClick={() => setViewMode("analytics")}
            variant={viewMode === "analytics" ? "default" : "outline"}
            className={viewMode === "analytics" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Browse Equipment View */}
        {viewMode === "browse" && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  onClick={() => setSelectedCategory(null)}
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory === null ? "bg-blue-600 text-white" : ""}
                >
                  All Categories
                </Button>
                <Button
                  onClick={() => setSelectedCategory("Tractors")}
                  variant={selectedCategory === "Tractors" ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory === "Tractors" ? "bg-blue-600 text-white" : ""}
                >
                  Tractors
                </Button>
                <Button
                  onClick={() => setSelectedCategory("Irrigation")}
                  variant={selectedCategory === "Irrigation" ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory === "Irrigation" ? "bg-blue-600 text-white" : ""}
                >
                  Irrigation
                </Button>
                <Button
                  onClick={() => setSelectedCategory("Harvesters")}
                  variant={selectedCategory === "Harvesters" ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory === "Harvesters" ? "bg-blue-600 text-white" : ""}
                >
                  Harvesters
                </Button>
              </div>
            </Card>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gray-200 h-40 flex items-center justify-center">
                    <Wrench className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.owner}</p>
                      </div>
                      {!item.available && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                      <span className="text-xs text-gray-600">({item.reviews})</span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>GH₵{item.dailyRate}/day • GH₵{item.monthlyRate}/month</span>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!item.available}>
                      {item.available ? "Book Now" : "Unavailable"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Listings View */}
        {viewMode === "myListings" && (
          <div className="space-y-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              List New Equipment
            </Button>

            {equipment.slice(0, 1).map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Daily Rate</p>
                    <p className="font-bold text-gray-900">GH₵{item.dailyRate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Monthly Rate</p>
                    <p className="font-bold text-gray-900">GH₵{item.monthlyRate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Rating</p>
                    <p className="font-bold text-gray-900">{item.rating} ⭐</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Bookings</p>
                    <p className="font-bold text-gray-900">12</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Bookings
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Analytics
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bookings View */}
        {viewMode === "bookings" && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className={`p-6 border-l-4 ${getStatusColor(booking.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{booking.equipment}</p>
                    <p className="text-sm text-gray-600">Owner: {booking.owner}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Start Date</p>
                    <p className="font-bold text-gray-900">{booking.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">End Date</p>
                    <p className="font-bold text-gray-900">{booking.endDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Total Cost</p>
                    <p className="font-bold text-green-600">GH₵{booking.totalCost}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                  {booking.status === "active" && (
                    <Button variant="outline" className="flex-1">
                      Complete Rental
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* History View */}
        {viewMode === "history" && (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Rental History</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="font-bold text-gray-900">Tractor - John Deere 5100</p>
                    <p className="text-sm text-gray-600">2026-02-01 to 2026-02-05</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">GH₵1,250</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Total Rentals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalRentals}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Active Rentals</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{analytics.activeRentals}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Total Spent</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">GH₵{analytics.totalSpent}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.averageRating} ⭐</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentRentalMarketplace;
