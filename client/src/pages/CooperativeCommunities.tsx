import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  Zap,
  TrendingUp,
  Package,
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

/**
 * Cooperative & Community Features Component
 * Farmer cooperatives, shared resources, and collective marketing
 */
export const CooperativeCommunities: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "members" | "resources" | "bulk" | "marketing" | "opportunities"
  >("dashboard");

  // Mock cooperative data
  const cooperative = {
    name: "Ghana Farmers Cooperative",
    region: "Ashanti Region",
    members: 45,
    activeMembers: 42,
    totalAssets: 250000,
    totalRevenue: 500000,
    monthlyProfit: 45000,
  };

  // Mock members
  const members = [
    {
      id: 1,
      name: "John Doe",
      farm: "Doe Farms",
      joinDate: "2020-03-01",
      status: "active",
      contribution: 50000,
    },
    {
      id: 2,
      name: "Jane Smith",
      farm: "Smith Agricultural",
      joinDate: "2020-05-15",
      status: "active",
      contribution: 45000,
    },
    {
      id: 3,
      name: "Peter Johnson",
      farm: "Johnson Estate",
      joinDate: "2021-02-10",
      status: "active",
      contribution: 60000,
    },
  ];

  // Mock shared resources
  const sharedResources = [
    {
      id: 1,
      type: "equipment",
      name: "Tractor",
      quantity: 3,
      hourlyRate: 50,
      availability: 2,
      bookings: 8,
    },
    {
      id: 2,
      type: "equipment",
      name: "Harvester",
      quantity: 2,
      hourlyRate: 75,
      availability: 1,
      bookings: 5,
    },
    {
      id: 3,
      type: "facility",
      name: "Storage Facility",
      capacity: "500 tons",
      monthlyRate: 5000,
      occupancy: 65,
      bookings: 12,
    },
  ];

  // Mock bulk purchasing
  const bulkOpportunities = [
    {
      id: 1,
      product: "NPK Fertilizer",
      quantity: 5000,
      unit: "kg",
      unitPrice: 50,
      totalPrice: 250000,
      supplier: "Ghana Agricultural Supplies",
      deadline: "2026-02-16",
      members: 15,
      savings: 25000,
    },
    {
      id: 2,
      product: "Pesticide (Neem Oil)",
      quantity: 1000,
      unit: "liters",
      unitPrice: 200,
      totalPrice: 200000,
      supplier: "Eco Farming Solutions",
      deadline: "2026-02-14",
      members: 12,
      savings: 30000,
    },
  ];

  // Mock marketing campaigns
  const marketingCampaigns = [
    {
      id: 1,
      product: "Organic Tomatoes",
      quantity: 50000,
      unit: "kg",
      pricePerUnit: 50,
      buyers: 8,
      status: "active",
      startDate: "2026-02-02",
      endDate: "2026-02-16",
    },
    {
      id: 2,
      product: "Fresh Maize",
      quantity: 30000,
      unit: "kg",
      pricePerUnit: 35,
      buyers: 5,
      status: "active",
      startDate: "2026-02-06",
      endDate: "2026-02-27",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farmer Cooperatives</h1>
            <p className="text-gray-600 mt-1">Shared resources, bulk purchasing, and collective marketing</p>
          </div>
          <Users className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("dashboard")}
            variant={viewMode === "dashboard" ? "default" : "outline"}
            className={viewMode === "dashboard" ? "bg-blue-600 text-white" : ""}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setViewMode("members")}
            variant={viewMode === "members" ? "default" : "outline"}
            className={viewMode === "members" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Members
          </Button>
          <Button
            onClick={() => setViewMode("resources")}
            variant={viewMode === "resources" ? "default" : "outline"}
            className={viewMode === "resources" ? "bg-blue-600 text-white" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Resources
          </Button>
          <Button
            onClick={() => setViewMode("bulk")}
            variant={viewMode === "bulk" ? "default" : "outline"}
            className={viewMode === "bulk" ? "bg-blue-600 text-white" : ""}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Bulk Purchasing
          </Button>
          <Button
            onClick={() => setViewMode("marketing")}
            variant={viewMode === "marketing" ? "default" : "outline"}
            className={viewMode === "marketing" ? "bg-blue-600 text-white" : ""}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Marketing
          </Button>
        </div>

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <>
            {/* Cooperative Info */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-600 font-bold text-lg">{cooperative.name}</p>
                  <p className="text-gray-600 flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    {cooperative.region}
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{cooperative.members}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Active Members</p>
                <p className="text-3xl font-bold text-green-600">{cooperative.activeMembers}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">GH₵{(cooperative.totalAssets / 1000).toFixed(0)}K</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">GH₵{(cooperative.totalRevenue / 1000).toFixed(0)}K</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Monthly Profit</p>
                <p className="text-2xl font-bold text-blue-600">GH₵{(cooperative.monthlyProfit / 1000).toFixed(0)}K</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setViewMode("resources")}>
                <Zap className="w-8 h-8 text-blue-600 mb-3" />
                <p className="font-bold text-gray-900">Shared Resources</p>
                <p className="text-sm text-gray-600 mt-2">3 equipment, 1 facility available</p>
              </Card>
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setViewMode("bulk")}>
                <ShoppingCart className="w-8 h-8 text-green-600 mb-3" />
                <p className="font-bold text-gray-900">Bulk Purchasing</p>
                <p className="text-sm text-gray-600 mt-2">2 active opportunities</p>
              </Card>
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setViewMode("marketing")}>
                <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                <p className="font-bold text-gray-900">Collective Marketing</p>
                <p className="text-sm text-gray-600 mt-2">2 active campaigns</p>
              </Card>
            </div>
          </>
        )}

        {/* Members View */}
        {viewMode === "members" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Cooperative Members</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            {members.map((member) => (
              <Card key={member.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.farm}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-600">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Joined: {member.joinDate}
                      </span>
                      <span className="text-xs text-gray-600">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Contribution: GH₵{member.contribution}
                      </span>
                    </div>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Shared Resources View */}
        {viewMode === "resources" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Shared Resources</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {sharedResources.map((resource) => (
              <Card key={resource.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{resource.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    resource.availability > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {resource.availability > 0 ? `${resource.availability} Available` : "Unavailable"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Quantity</p>
                    <p className="font-bold text-gray-900">{resource.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Rate</p>
                    <p className="font-bold text-gray-900">GH₵{resource.hourlyRate}/hr</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Bookings</p>
                    <p className="font-bold text-gray-900">{resource.bookings}</p>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bulk Purchasing View */}
        {viewMode === "bulk" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Bulk Purchasing Opportunities</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </div>

            {bulkOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-6 border-l-4 border-green-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{opportunity.product}</p>
                    <p className="text-sm text-gray-600">{opportunity.supplier}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                    Save GH₵{opportunity.savings}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Quantity</p>
                    <p className="font-bold text-gray-900">{opportunity.quantity} {opportunity.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Unit Price</p>
                    <p className="font-bold text-gray-900">GH₵{opportunity.unitPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Total</p>
                    <p className="font-bold text-gray-900">GH₵{opportunity.totalPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Members</p>
                    <p className="font-bold text-gray-900">{opportunity.members}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Deadline</p>
                    <p className="font-bold text-gray-900">{opportunity.deadline}</p>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Join Purchase
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Marketing View */}
        {viewMode === "marketing" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Collective Marketing Campaigns</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Launch Campaign
              </Button>
            </div>

            {marketingCampaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{campaign.product}</p>
                    <p className="text-sm text-gray-600">{campaign.quantity} {campaign.unit} available</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    campaign.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Price/Unit</p>
                    <p className="font-bold text-gray-900">GH₵{campaign.pricePerUnit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Buyers</p>
                    <p className="font-bold text-gray-900">{campaign.buyers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Start Date</p>
                    <p className="font-bold text-gray-900">{campaign.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">End Date</p>
                    <p className="font-bold text-gray-900">{campaign.endDate}</p>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CooperativeCommunities;
