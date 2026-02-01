import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { CheckCircle2, CreditCard, Smartphone, MapPin, Package } from "lucide-react";

export default function Checkout() {
  const { items, total, totalDiscount, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    region: "",
  });
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");

  // Fetch delivery zones
  const { data: deliveryZones = [] } = trpc.marketplace.getDeliveryZones.useQuery();

  // Calculate shipping
  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const shippingCost = selectedZone ? parseFloat(selectedZone.shippingCost) : 0;
  const finalTotal = total + shippingCost;

  // Create order mutation
  const createOrder = trpc.marketplace.createOrder.useMutation({
    onSuccess: (data) => {
      setTrackingNumber(data.orderNumber);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedZoneId) {
      toast.error("Please select a delivery zone");
      return;
    }

    createOrder.mutate({
      sellerId: 1, // TODO: Get actual seller ID from product
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryAddress: JSON.stringify({
        ...deliveryAddress,
        shippingCost,
        paymentMethod,
        deliveryZone: selectedZone?.name,
      }),
      notes: `Payment: ${paymentMethod}, Zone: ${selectedZone?.name}`,
    });
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">Add some products to get started</p>
        <Button onClick={() => setLocation("/marketplace")}>
          Browse Marketplace
        </Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your order has been confirmed and will be processed soon.
            </p>
            <div className="bg-accent p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
              <p className="text-xl font-mono font-bold">{trackingNumber}</p>
            </div>
              <p className="text-sm text-muted-foreground mb-6">
                Estimated delivery: {selectedZone?.estimatedDays} days
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setLocation("/orders")}>
                View Orders
              </Button>
              <Button variant="outline" onClick={() => setLocation("/marketplace")}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={deliveryAddress.fullName}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={deliveryAddress.address}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region / Delivery Zone *</Label>
                  <Select
                    value={selectedZoneId?.toString()}
                    onValueChange={(value) => {
                      setSelectedZoneId(parseInt(value));
                      const zone = deliveryZones.find(z => z.id === parseInt(value));
                      if (zone) {
                        setDeliveryAddress({ ...deliveryAddress, region: zone.name });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name} - GH₵{parseFloat(zone.shippingCost).toFixed(2)} ({zone.estimatedDays} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-sm text-muted-foreground">MTN, Vodafone, AirtelTigo</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                  <Label htmlFor="cash_on_delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Package className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span>GH₵{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>GH₵{(total + totalDiscount).toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Bulk Discount</span>
                    <span>-GH₵{totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost > 0 ? `GH₵${shippingCost.toFixed(2)}` : "Select zone"}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>GH₵{finalTotal.toFixed(2)}</span>
              </div>
              {selectedZone && (
                <p className="text-sm text-muted-foreground">
                  Estimated delivery: {selectedZone.estimatedDays} days
                </p>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address || !selectedZoneId || createOrder.isPending}
              >
                {createOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
