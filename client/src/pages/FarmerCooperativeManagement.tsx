import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Plus,
} from "lucide-react";

/**
 * Farmer Cooperative Management Component
 * Enable farmers to form cooperatives, manage resources, bulk purchase, and collectively market
 */
export const FarmerCooperativeManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "cooperatives" | "members" | "bulk" | "campaigns" | "financials" | "analytics"
  >("cooperatives");

  // Mock data
  const cooperatives = [
    {
      id: 1,
      name: "Ashanti Farmers Cooperative",
      region: "Ashanti",
      members: 45,
      founded: "2020-01-15",
      status: "Active",
      description: "Cooperative focused on cocoa and maize production",
      chairperson: "Kwame Asante",
      totalAssets: 125000,
      monthlyRevenue: 45000,
    },
    {
      id: 2,
      name: "Northern Region Vegetable Growers",
      region: "Northern",
      members: 32,
      founded: "2021-06-20",
      status: "Active",
      description: "Vegetable production and marketing cooperative",
      chairperson: "Fatima Hassan",
      totalAssets: 85000,
      monthlyRevenue: 28000,
    },
  ];

  const members = [
    {
      id: 1,
      name: "John Mensah",
      farmSize: 5,
      joinDate: "2020-02-10",
      status: "Active",
      contribution: 5000,
      shares: 50,
      role: "Member",
    },
    {
      id: 2,
      name: "Mary Osei",
      farmSize: 3,
      joinDate: "2020-03-15",
      status: "Active",
      contribution: 3000,
      shares: 30,
      role: "Member",
    },
    {
      id: 3,
      name: "Ahmed Hassan",
      farmSize: 7,
      joinDate: "2020-01-20",
      status: "Active",
      contribution: 7000,
      shares: 70,
      role: "Treasurer",
    },
  ];

  const bulkPurchasing = [
    {
      id: 1,
      item: "Fertilizer (NPK)",
      quantity: 500,
      unit: "bags",
      unitPrice: 150,
      totalCost: 75000,
      vendor: "AgroSupply Ghana",
      deadline: "2026-02-20",
      participants: 15,
      status: "Open",
      savings: 15000,
    },
    {
      id: 2,
      item: "Pesticide (Insecticide)",
      quantity: 200,
      unit: "liters",
      unitPrice: 250,
      totalCost: 50000,
      vendor: "ChemAg Solutions",
      deadline: "2026-02-25",
      participants: 10,
      status: "Open",
      savings: 8000,
    },
    {
      id: 3,
      item: "Seeds (Improved Maize)",
      quantity: 1000,
      unit: "kg",
      unitPrice: 80,
      totalCost: 80000,
      vendor: "Seed House Ghana",
      deadline: "2026-02-18",
      participants: 20,
      status: "Closed",
      savings: 12000,
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: "Ashanti Cocoa Quality Initiative",
      product: "Cocoa Beans",
      startDate: "2026-01-15",
      endDate: "2026-03-15",
      status: "Active",
      participants: 25,
      targetMarket: "International Buyers",
      revenue: 450000,
      margin: "15%",
    },
    {
      id: 2,
      name: "Fresh Maize Direct to Retailers",
      product: "Maize",
      startDate: "2026-02-01",
      endDate: "2026-04-30",
      status: "Active",
      participants: 18,
      targetMarket: "Local Retailers",
      revenue: 280000,
      margin: "12%",
    },
    {
      id: 3,
      name: "Organic Vegetable Certification",
      product: "Vegetables",
      startDate: "2026-03-01",
      endDate: "2026-05-31",
      status: "Planning",
      participants: 12,
      targetMarket: "Premium Markets",
      revenue: 0,
      margin: "20%",
    },
  ];

  const financials = {
    totalRevenue: 450000,
    totalExpenses: 320000,
    netProfit: 130000,
    memberDividends: 65000,
    reserves: 65000,
    cashOnHand: 85000,
    breakdown: [
      { category: "Marketing", amount: 45000, percentage: "14%" },
      { category: "Operations", amount: 120000, percentage: "37%" },
      { category: "Transportation", amount: 85000, percentage: "26%" },
      { category: "Administration", amount: 70000, percentage: "22%" },
    ],
  };

  const analytics = {
    totalMembers: 45,
    activeMembers: 42,
    totalAssets: 125000,
    monthlyRevenue: 45000,
    averageMemberIncome: 2800,
    costSavings: 35000,
    marketReach: "5 countries",
    productDiversity: 8,
    growthRate: "+18%",
    memberSatisfaction: 4.6,
    topProduct: "Cocoa Beans",
    topMarket: "International Buyers",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Farmer Cooperative Management
            </h1>
            <p className="text-gray-600 mt-1">Manage cooperatives and collective resources</p>
          </div>
          <Users className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("cooperatives")}
            variant={viewMode === "cooperatives" ? "default" : "outline"}
            className={viewMode === "cooperatives" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Cooperatives
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
            onClick={() => setViewMode("bulk")}
            variant={viewMode === "bulk" ? "default" : "outline"}
            className={viewMode === "bulk" ? "bg-blue-600 text-white" : ""}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Bulk Purchasing
          </Button>
          <Button
            onClick={() => setViewMode("campaigns")}
            variant={viewMode === "campaigns" ? "default" : "outline"}
            className={viewMode === "campaigns" ? "bg-blue-600 text-white" : ""}
          >
            <Target className="w-4 h-4 mr-2" />
            Campaigns
          </Button>
          <Button
            onClick={() => setViewMode("financials")}
            variant={viewMode === "financials" ? "default" : "outline"}
            className={viewMode === "financials" ? "bg-blue-600 text-white" : ""}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Financials
          </Button>
          <Button
            onClick={() => setViewMode("analytics")}
            variant={viewMode === "analytics" ? "default" : "outline"}
            className={viewMode === "analytics" ? "bg-blue-600 text-white" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Cooperatives View */}
        {viewMode === "cooperatives" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Cooperative
              </Button>
            </div>

            {cooperatives.map((coop) => (
              <Card key={coop.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{coop.name}</p>
                    <p className="text-sm text-gray-600">{coop.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded font-bold text-sm bg-green-200 text-green-800">
                    {coop.status}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Members</p>
                    <p className="font-bold text-gray-900">{coop.members}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Region</p>
                    <p className="font-bold text-gray-900">{coop.region}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Total Assets</p>
                    <p className="font-bold text-blue-600">GH₵{coop.totalAssets.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Monthly Revenue</p>
                    <p className="font-bold text-green-600">GH₵{coop.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Chairperson</p>
                    <p className="font-bold text-gray-900">{coop.chairperson}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">View Details</Button>
                  <Button className="flex-1 bg-gray-600 hover:bg-gray-700">Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Members View */}
        {viewMode === "members" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            {members.map((member) => (
              <Card key={member.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">Role: {member.role}</p>
                  </div>
                  <span className="px-3 py-1 rounded font-bold text-sm bg-green-200 text-green-800">
                    {member.status}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Farm Size</p>
                    <p className="font-bold text-gray-900">{member.farmSize} ha</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Join Date</p>
                    <p className="font-bold text-gray-900">{member.joinDate}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Contribution</p>
                    <p className="font-bold text-blue-600">GH₵{member.contribution}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Shares</p>
                    <p className="font-bold text-gray-900">{member.shares}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                      View Profile
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
            <div className="flex justify-end mb-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </div>

            {bulkPurchasing.map((opp) => (
              <Card key={opp.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{opp.item}</p>
                    <p className="text-sm text-gray-600">{opp.vendor}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded font-bold text-sm ${
                      opp.status === "Open"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {opp.status}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-bold text-gray-900">{opp.quantity} {opp.unit}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Unit Price</p>
                    <p className="font-bold text-gray-900">GH₵{opp.unitPrice}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Total Cost</p>
                    <p className="font-bold text-blue-600">GH₵{opp.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Participants</p>
                    <p className="font-bold text-gray-900">{opp.participants}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-gray-600">Savings</p>
                    <p className="font-bold text-green-600">GH₵{opp.savings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {opp.status === "Open" ? "Join" : "View Details"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Campaigns View */}
        {viewMode === "campaigns" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{campaign.name}</p>
                    <p className="text-sm text-gray-600">{campaign.product}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded font-bold text-sm ${
                      campaign.status === "Active"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Target Market</p>
                    <p className="font-bold text-gray-900">{campaign.targetMarket}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Participants</p>
                    <p className="font-bold text-gray-900">{campaign.participants}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-bold text-blue-600">GH₵{campaign.revenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Margin</p>
                    <p className="font-bold text-green-600">{campaign.margin}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-600">Duration</p>
                    <p className="font-bold text-gray-900">{campaign.startDate} - {campaign.endDate}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Financials View */}
        {viewMode === "financials" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  GH₵{financials.totalRevenue.toLocaleString()}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  GH₵{financials.totalExpenses.toLocaleString()}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Net Profit</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  GH₵{financials.netProfit.toLocaleString()}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Cash on Hand</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  GH₵{financials.cashOnHand.toLocaleString()}
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Expense Breakdown</p>
              <div className="space-y-3">
                {financials.breakdown.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-700">{item.category}</p>
                      <p className="text-sm font-bold text-gray-900">GH₵{item.amount.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: item.percentage }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalMembers}</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  GH₵{analytics.monthlyRevenue.toLocaleString()}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Cost Savings</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  GH₵{analytics.costSavings.toLocaleString()}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Growth Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.growthRate}</p>
              </Card>
            </div>

            <Card className="p-6">
              <p className="font-bold text-gray-900 mb-4">Key Metrics</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Avg Member Income</p>
                  <p className="text-xl font-bold text-gray-900">GH₵{analytics.averageMemberIncome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Market Reach</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.marketReach}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Diversity</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.productDiversity} types</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Satisfaction</p>
                  <p className="text-xl font-bold text-yellow-600">⭐ {analytics.memberSatisfaction}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Product</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.topProduct}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Market</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.topMarket}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerCooperativeManagement;
