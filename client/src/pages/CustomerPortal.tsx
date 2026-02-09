import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Truck,
  Search,
  Filter,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/**
 * Customer Portal Component
 * Public marketplace for farm product buyers
 */
export const CustomerPortal: React.FC = () => {
  const [viewMode, setViewMode] = useState<"browse" | "orders" | "wishlist" | "farms" | "profile">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<number>(0);

  // Mock products data
  const products = [
    {
      id: 1,
      name: "Organic Tomatoes (5kg)",
      farmName: "Green Valley Farm",
      category: "Vegetables",
      price: 45,
      originalPrice: 50,
      discount: 10,
      rating: 4.8,
      reviews: 156,
      inStock: 120,
      image: "https://api.example.com/products/1.jpg",
      certifications: ["Organic", "Fair Trade"],
      deliveryTime: "1-2 days",
    },
    {
      id: 2,
      name: "Fresh Maize (10kg)",
      farmName: "Harvest Fields",
      category: "Grains",
      price: 35,
      originalPrice: 40,
      discount: 12.5,
      rating: 4.6,
      reviews: 89,
      inStock: 250,
      image: "https://api.example.com/products/2.jpg",
      certifications: ["Certified"],
      deliveryTime: "2-3 days",
    },
    {
      id: 3,
      name: "Organic Lettuce (2kg)",
      farmName: "Green Valley Farm",
      category: "Vegetables",
      price: 25,
      originalPrice: 30,
      discount: 16.7,
      rating: 4.9,
      reviews: 203,
      inStock: 180,
      image: "https://api.example.com/products/3.jpg",
      certifications: ["Organic"],
      deliveryTime: "1 day",
    },
  ];

  // Mock orders data
  const orders = [
    {
      id: 1001,
      orderDate: "2026-02-08",
      status: "delivered",
      total: 125,
      items: 2,
      deliveryDate: "2026-02-09",
      tracking: "TRACK-2026-001001",
    },
    {
      id: 1002,
      orderDate: "2026-02-07",
      status: "shipped",
      total: 70,
      items: 1,
      estimatedDelivery: "2026-02-10",
      tracking: "TRACK-2026-001002",
    },
  ];

  // Mock wishlist data
  const wishlist = [
    {
      id: 1,
      productId: 1,
      productName: "Organic Tomatoes (5kg)",
      farmName: "Green Valley Farm",
      price: 45,
      rating: 4.8,
    },
    {
      id: 2,
      productId: 4,
      productName: "Fresh Carrots (3kg)",
      farmName: "Harvest Fields",
      price: 30,
      rating: 4.7,
    },
  ];

  // Mock farms data
  const farms = [
    {
      id: 1,
      name: "Green Valley Farm",
      location: "Ashanti Region",
      rating: 4.8,
      reviews: 156,
      sales: 1250,
      followers: 3450,
      certifications: ["Organic", "Fair Trade"],
    },
    {
      id: 2,
      name: "Harvest Fields",
      location: "Brong Ahafo Region",
      rating: 4.6,
      reviews: 89,
      sales: 850,
      followers: 2100,
      certifications: ["Certified"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farm Products Marketplace</h1>
            <p className="text-gray-600 mt-1">Fresh, organic products directly from local farms</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cart > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setViewMode("browse")}
            variant={viewMode === "browse" ? "default" : "outline"}
            className={viewMode === "browse" ? "bg-blue-600 text-white" : ""}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Browse Products
          </Button>
          <Button
            onClick={() => setViewMode("orders")}
            variant={viewMode === "orders" ? "default" : "outline"}
            className={viewMode === "orders" ? "bg-blue-600 text-white" : ""}
          >
            <Package className="w-4 h-4 mr-2" />
            My Orders
          </Button>
          <Button
            onClick={() => setViewMode("wishlist")}
            variant={viewMode === "wishlist" ? "default" : "outline"}
            className={viewMode === "wishlist" ? "bg-blue-600 text-white" : ""}
          >
            <Heart className="w-4 h-4 mr-2" />
            Wishlist
          </Button>
          <Button
            onClick={() => setViewMode("farms")}
            variant={viewMode === "farms" ? "default" : "outline"}
            className={viewMode === "farms" ? "bg-blue-600 text-white" : ""}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Farms
          </Button>
          <Button
            onClick={() => setViewMode("profile")}
            variant={viewMode === "profile" ? "default" : "outline"}
            className={viewMode === "profile" ? "bg-blue-600 text-white" : ""}
          >
            Profile
          </Button>
        </div>

        {/* Browse Products View */}
        {viewMode === "browse" && (
          <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto">
                {["All", "Vegetables", "Grains", "Fruits", "Dairy"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === cat || (cat === "All" && !selectedCategory)
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover bg-gray-200"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                        -{product.discount}%
                      </div>
                    )}
                    <button className="absolute top-2 left-2 p-2 bg-white rounded-full shadow hover:bg-gray-50">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.farmName}</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-600">({product.reviews} reviews)</span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">GH₵{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">GH₵{product.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Truck className="w-4 h-4" />
                        <span>{product.deliveryTime}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.inStock > 0 ? (
                          <span className="text-green-600 font-semibold">{product.inStock} in stock</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Out of stock</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCart(cart + 1)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* My Orders View */}
        {viewMode === "orders" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className={`p-6 border-l-4 ${getStatusColor(order.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.orderDate}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Items</p>
                    <p className="font-bold text-gray-900">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="font-bold text-gray-900">GH₵{order.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Tracking</p>
                    <p className="font-bold text-blue-600">{order.tracking}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      {order.status === "delivered" ? "Delivered" : "Est. Delivery"}
                    </p>
                    <p className="font-bold text-gray-900">
                      {order.status === "delivered" ? order.deliveryDate : order.estimatedDelivery}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Track Order
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" className="flex-1">
                      Leave Review
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Wishlist View */}
        {viewMode === "wishlist" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500">{item.farmName}</p>
                    <p className="font-bold text-gray-900">{item.productName}</p>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Heart className="w-5 h-5 text-red-600 fill-current" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">{item.rating}</span>
                </div>

                <p className="text-2xl font-bold text-gray-900 mb-3">GH₵{item.price}</p>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Farms View */}
        {viewMode === "farms" && (
          <div className="space-y-4">
            {farms.map((farm) => (
              <Card key={farm.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{farm.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {farm.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-bold text-lg text-gray-900">{farm.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">{farm.reviews} reviews</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Total Sales</p>
                    <p className="font-bold text-gray-900">{farm.sales}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Followers</p>
                    <p className="font-bold text-gray-900">{farm.followers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Certifications</p>
                    <p className="font-bold text-gray-900">{farm.certifications.length}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  {farm.certifications.map((cert) => (
                    <span key={cert} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {cert}
                    </span>
                  ))}
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Farm Products
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Profile View */}
        {viewMode === "profile" && (
          <Card className="p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <p className="text-gray-900">John Smith</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <p className="text-gray-900">john@example.com</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <p className="text-gray-900">+233501234567</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Delivery Addresses</label>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">Home (Default)</p>
                    <p className="text-gray-600">123 Main St, Accra</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">Work</p>
                    <p className="text-gray-600">456 Business Ave, Accra</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">GH₵450</p>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">Edit Profile</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
