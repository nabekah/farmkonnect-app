import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapView } from "@/components/Map";
import { Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const statusSteps = [
  { status: "pending", label: "Order Placed", icon: Package },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

export default function OrderTracking() {
  const [, params] = useRoute("/track-order/:id");
  const orderId = params?.id ? parseInt(params.id) : null;

  const { data: order } = trpc.marketplace.getOrder.useQuery(
    { id: orderId! },
    { enabled: !!orderId }
  );

  const [mapReady, setMapReady] = useState(false);

  const handleMapReady = (map: google.maps.Map) => {
    setMapReady(true);
    
    if (!order) return;

    // Parse delivery address
    let deliveryCoords = { lat: 5.6037, lng: -0.1870 }; // Default to Accra
    try {
      const addr = JSON.parse(order.deliveryAddress || '{}');
      // In a real app, you would geocode the address to get coordinates
      // For now, we'll use default Accra coordinates
    } catch (e) {
      // Use default
    }

    // Add marker for delivery location
    new google.maps.Marker({
      position: deliveryCoords,
      map: map,
      title: "Delivery Location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#10b981",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    // Center map on delivery location
    map.setCenter(deliveryCoords);
    map.setZoom(12);
  };

  if (!order) {
    return (
      <div className="container max-w-7xl py-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading order details...
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // 7 days from order

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Track Order</h1>
        <p className="text-muted-foreground">Order #{order.orderNumber}</p>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Status Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background transition-all ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className={`mt-2 text-sm font-medium ${isCompleted ? "" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <Badge className="mt-1" variant="default">
                        Current
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium">
                {estimatedDelivery.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={`${statusConfig[order.status as OrderStatus].color} text-white`}>
                {statusConfig[order.status as OrderStatus].label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Delivery Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapView onMapReady={handleMapReady} />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent p-4 rounded-lg">
                {(() => {
                  try {
                    const addr = JSON.parse(order.deliveryAddress || '{}');
                    return (
                      <div className="space-y-1">
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-sm">{addr.phone}</p>
                        <p className="text-sm">{addr.address}</p>
                        <p className="text-sm">{addr.city}, {addr.region}</p>
                      </div>
                    );
                  } catch {
                    return <p>{order.deliveryAddress}</p>;
                  }
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>Product #{item.productId} × {item.quantity}</span>
                    <span className="font-medium">GH₵{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>GH₵{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
