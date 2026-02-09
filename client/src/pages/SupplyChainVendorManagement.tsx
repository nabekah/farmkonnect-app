import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Store,
  Package,
  DollarSign,
  Star,
  MapPin,
  Phone,
  ShoppingCart,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";

/**
 * Supply Chain & Vendor Management Component
 * Manages suppliers, equipment rentals, bulk purchasing, and vendor relationships
 */
export const SupplyChainVendorManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "overview" | "suppliers" | "equipment" | "bulk" | "orders" | "tracking" | "performance"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);

  // Mock suppliers data
  const suppliers = [
    {
      id: 1,
      name: "Ghana Agricultural Supplies Ltd",
      category: "Fertilizer & Inputs",
      location: "Accra",
      rating: 4.8,
      reviews: 156,
      minOrder: 500,
      deliveryTime: "2-3 days",
      contact: "+233501234567",
      verified: true,
      status: "active",
    },
    {
      id: 2,
      name: "Kumasi Equipment Rentals",
      category: "Equipment Rental",
      location: "Kumasi",
      rating: 4.6,
      reviews: 89,
      minOrder: 1,
      deliveryTime: "Same day",
      contact: "+233502345678",
      verified: true,
      status: "active",
    },
    {
      id: 3,
      name: "Eastern Seeds & Nursery",
      category: "Seeds & Seedlings",
      location: "Koforidua",
      rating: 4.7,
      reviews: 203,
      minOrder: 100,
      deliveryTime: "1-2 days",
      contact: "+233503456789",
      verified: true,
      status: "active",
    },
  ];

  // Mock equipment data
  const equipment = [
    {
      id: 1,
      name: "Tractor (John Deere 5050)",
      supplier: "Kumasi Equipment Rentals",
      type: "Tractor",
      dailyRate: 250,
      weeklyRate: 1400,
      monthlyRate: 4500,
      location: "Kumasi",
      availability: "Available",
      condition: "Excellent",
      rating: 4.8,
      reviews: 45,
    },
    {
      id: 2,
      name: "Combine Harvester",
      supplier: "Kumasi Equipment Rentals",
      type: "Harvester",
      dailyRate: 400,
      weeklyRate: 2200,
      monthlyRate: 7000,
      location: "Kumasi",
      availability: "Available",
      condition: "Good",
      rating: 4.6,
      reviews: 32,
    },
    {
      id: 3,
      name: "Water Pump System",
      supplier: "Kumasi Equipment Rentals",
      type: "Pump",
      dailyRate: 80,
      weeklyRate: 450,
      monthlyRate: 1400,
      location: "Kumasi",
      availability: "Available",
      condition: "Excellent",
      rating: 4.7,
      reviews: 28,
    },
  ];

  // Mock bulk options
  const bulkOptions = [
    {
      id: 1,
      product: "NPK Fertilizer (50kg bags)",
      supplier: "Ghana Agricultural Supplies Ltd",
      unitPrice: 45,
      bulkPrice: 40,
      savings: 500,
      savingsPercent: 11.1,
      minOrder: 100,
      rating: 4.8,
    },
    {
      id: 2,
      product: "Organic Compost (25kg bags)",
      supplier: "Ghana Agricultural Supplies Ltd",
      unitPrice: 35,
      bulkPrice: 30,
      savings: 250,
      savingsPercent: 14.3,
      minOrder: 50,
      rating: 4.7,
    },
    {
      id: 3,
      product: "Pesticide Bundle (5L bottles)",
      supplier: "Ghana Agricultural Supplies Ltd",
      unitPrice: 120,
      bulkPrice: 100,
      savings: 400,
      savingsPercent: 16.7,
      minOrder: 20,
      rating: 4.6,
    },
  ];

  // Mock purchase orders
  const purchaseOrders = [
    {
      id: 1001,
      vendor: "Ghana Agricultural Supplies Ltd",
      product: "NPK Fertilizer",
      quantity: 100,
      total: 4000,
      status: "pending",
      createdAt: "2026-02-09",
      estimatedDelivery: "2026-02-14",
      paymentStatus: "unpaid",
    },
    {
      id: 1002,
      vendor: "Kumasi Equipment Rentals",
      product: "Tractor Rental",
      quantity: 1,
      total: 250,
      status: "confirmed",
      createdAt: "2026-02-08",
      estimatedDelivery: "2026-02-09",
      paymentStatus: "paid",
    },
    {
      id: 1003,
      vendor: "Eastern Seeds & Nursery",
      product: "Tomato Seeds",
      quantity: 500,
      total: 1250,
      status: "shipped",
      createdAt: "2026-02-07",
      estimatedDelivery: "2026-02-10",
      paymentStatus: "paid",
    },
  ];

  // Mock vendor performance
  const vendorPerformance = [
    {
      id: 1,
      name: "Ghana Agricultural Supplies Ltd",
      rating: 4.8,
      onTimeDelivery: 95,
      quality: 92,
      priceCompetitiveness: 88,
      customerService: 96,
      totalOrders: 156,
      status: "Excellent",
    },
    {
      id: 2,
      name: "Kumasi Equipment Rentals",
      rating: 4.6,
      onTimeDelivery: 92,
      quality: 89,
      priceCompetitiveness: 85,
      customerService: 93,
      totalOrders: 89,
      status: "Good",
    },
    {
      id: 3,
      name: "Eastern Seeds & Nursery",
      rating: 4.7,
      onTimeDelivery: 96,
      quality: 94,
      priceCompetitiveness: 87,
      customerService: 91,
      totalOrders: 203,
      status: "Excellent",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "text-green-600";
    if (rating >= 4.5) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supply Chain & Vendor Management</h1>
            <p className="text-gray-600 mt-1">Manage suppliers, equipment rentals, and bulk purchasing</p>
          </div>
          <Truck className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("overview")}
            variant={viewMode === "overview" ? "default" : "outline"}
            className={viewMode === "overview" ? "bg-blue-600 text-white" : ""}
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode("suppliers")}
            variant={viewMode === "suppliers" ? "default" : "outline"}
            className={viewMode === "suppliers" ? "bg-blue-600 text-white" : ""}
          >
            <Store className="w-4 h-4 mr-2" />
            Suppliers
          </Button>
          <Button
            onClick={() => setViewMode("equipment")}
            variant={viewMode === "equipment" ? "default" : "outline"}
            className={viewMode === "equipment" ? "bg-blue-600 text-white" : ""}
          >
            <Package className="w-4 h-4 mr-2" />
            Equipment Rental
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
            onClick={() => setViewMode("orders")}
            variant={viewMode === "orders" ? "default" : "outline"}
            className={viewMode === "orders" ? "bg-blue-600 text-white" : ""}
          >
            <Truck className="w-4 h-4 mr-2" />
            Orders
          </Button>
          <Button
            onClick={() => setViewMode("performance")}
            variant={viewMode === "performance" ? "default" : "outline"}
            className={viewMode === "performance" ? "bg-blue-600 text-white" : ""}
          >
            <Star className="w-4 h-4 mr-2" />
            Performance
          </Button>
        </div>

        {/* Overview View */}
        {viewMode === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Suppliers</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                  </div>
                  <Store className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Equipment Available</p>
                    <p className="text-3xl font-bold text-gray-900">15</p>
                  </div>
                  <Package className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Orders</p>
                    <p className="text-3xl font-bold text-orange-600">1</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-orange-600 opacity-20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Supplier Rating</p>
                    <p className="text-3xl font-bold text-green-600">4.7/5</p>
                  </div>
                  <Star className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {purchaseOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className={`p-4 border-l-4 rounded-lg ${getStatusColor(order.status)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{order.product}</p>
                        <p className="text-sm text-gray-600">{order.vendor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">GH₵{order.total}</p>
                        <p className="text-xs text-gray-600">{order.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Suppliers View */}
        {viewMode === "suppliers" && (
          <>
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search suppliers..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.category}</p>
                    </div>
                    {supplier.verified && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Rating</p>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${getRatingColor(supplier.rating)}`}>{supplier.rating}</span>
                        <span className="text-xs text-gray-600">({supplier.reviews} reviews)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="font-semibold flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {supplier.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Delivery Time</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {supplier.deliveryTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Contact</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {supplier.contact}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    View Products
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Equipment Rental View */}
        {viewMode === "equipment" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {equipment.map((item) => (
              <Card key={item.id} className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.supplier}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-bold">GH₵{item.dailyRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weekly Rate</span>
                    <span className="font-bold">GH₵{item.weeklyRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rate</span>
                    <span className="font-bold">GH₵{item.monthlyRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-bold text-green-600">{item.condition}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <span className={`font-bold ${getRatingColor(item.rating)}`}>{item.rating} ({item.reviews})</span>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Rent Now
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Bulk Purchasing View */}
        {viewMode === "bulk" && (
          <div className="space-y-4">
            {bulkOptions.map((option) => (
              <Card key={option.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{option.product}</h3>
                    <p className="text-sm text-gray-600">{option.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Save</p>
                    <p className="text-2xl font-bold text-green-600">GH₵{option.savings}</p>
                    <p className="text-xs text-green-600">({option.savingsPercent}%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Unit Price</p>
                    <p className="font-semibold line-through text-gray-500">GH₵{option.unitPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Bulk Price</p>
                    <p className="font-bold text-green-600">GH₵{option.bulkPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Min Order</p>
                    <p className="font-semibold">{option.minOrder} units</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Rating</p>
                    <p className={`font-bold ${getRatingColor(option.rating)}`}>{option.rating}/5</p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Orders View */}
        {viewMode === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="py-3 px-4 text-gray-700">{order.product}</td>
                    <td className="py-3 px-4 text-gray-700">{order.vendor}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">GH₵{order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{order.estimatedDelivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Performance View */}
        {viewMode === "performance" && (
          <div className="space-y-4">
            {vendorPerformance.map((vendor) => (
              <Card key={vendor.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                    <p className="text-sm text-gray-600">{vendor.totalOrders} total orders</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    vendor.status === "Excellent"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Overall Rating</p>
                    <p className={`text-2xl font-bold ${getRatingColor(vendor.rating)}`}>{vendor.rating}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">On-Time Delivery</p>
                    <p className="text-2xl font-bold text-blue-600">{vendor.onTimeDelivery}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Product Quality</p>
                    <p className="text-2xl font-bold text-blue-600">{vendor.quality}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Price Competitiveness</p>
                    <p className="text-2xl font-bold text-blue-600">{vendor.priceCompetitiveness}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Customer Service</p>
                    <p className="text-2xl font-bold text-blue-600">{vendor.customerService}%</p>
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

export default SupplyChainVendorManagement;
