import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, Calendar, CheckCircle, XCircle, Clock, Navigation } from "lucide-react";
import { DatePickerPopover } from "@/components/DatePickerPopover";

export default function TransportManagement() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Queries
  const { data: transportRequests = [], refetch: refetchRequests } = trpc.transport.requests.list.useQuery({});
  const { data: orders = [], refetch: refetchOrders } = trpc.transport.orders.list.useQuery({});
  const { data: listings = [] } = trpc.transport.listings.list.useQuery({});

  // Mutations
  const createRequest = trpc.transport.requests.create.useMutation({
    onSuccess: () => {
      refetchRequests();
      setShowRequestDialog(false);
    },
  });

  const acceptRequest = trpc.transport.requests.accept.useMutation({
    onSuccess: () => refetchRequests(),
  });

  const updateRequestStatus = trpc.transport.requests.updateStatus.useMutation({
    onSuccess: () => refetchRequests(),
  });

  const createOrder = trpc.transport.orders.create.useMutation({
    onSuccess: () => {
      refetchOrders();
      setShowOrderDialog(false);
    },
  });

  const updateOrderStatus = trpc.transport.orders.updateStatus.useMutation({
    onSuccess: () => refetchOrders(),
  });

  // Form states
  const [newRequest, setNewRequest] = useState({
    orderId: "",
    pickupLocation: "",
    deliveryLocation: "",
    requestDate: new Date(),
    estimatedDeliveryDate: new Date(),
  });

  const [newOrder, setNewOrder] = useState({
    totalAmount: "",
    items: [] as Array<{ listingId: number; quantityOrdered: string; priceAtOrder: string }>,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: "outline",
      accepted: "secondary",
      in_transit: "default",
      delivered: "default",
      cancelled: "destructive",
      pending: "outline",
      confirmed: "secondary",
      fulfilled: "default",
    };
    const icons: Record<string, any> = {
      requested: Clock,
      accepted: CheckCircle,
      in_transit: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      pending: Clock,
      confirmed: CheckCircle,
      fulfilled: CheckCircle,
    };
    const Icon = icons[status];
    return (
      <Badge variant={variants[status] || "default"}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const calculateDistance = (pickup: string, delivery: string) => {
    // Simple mock calculation - in production, use Google Maps Distance Matrix API
    const hash = (pickup + delivery).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 200) + 10; // Random distance between 10-210 km
  };

  const calculateEstimatedTime = (distance: number) => {
    // Assuming average speed of 60 km/h
    return Math.ceil(distance / 60);
  };

  const requestedCount = transportRequests.filter((r: any) => r.status === "requested").length;
  const inTransitCount = transportRequests.filter((r: any) => r.status === "in_transit").length;
  const deliveredCount = transportRequests.filter((r: any) => r.status === "delivered").length;
  const pendingOrdersCount = orders.filter((o: any) => o.status === "pending").length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Transport & Logistics</h1>
          <p className="text-muted-foreground mt-2">
            Manage transport requests, deliveries, and route optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button>
                <Truck className="w-4 h-4 mr-2" />
                New Transport Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Transport Request</DialogTitle>
                <DialogDescription>Request transportation for an order</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Order ID</Label>
                  <Select
                    value={newRequest.orderId}
                    onValueChange={(value) => setNewRequest({ ...newRequest, orderId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order: any) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          Order #{order.id} - GH₵{order.totalAmount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pickup Location</Label>
                  <Input
                    value={newRequest.pickupLocation}
                    onChange={(e) => setNewRequest({ ...newRequest, pickupLocation: e.target.value })}
                    placeholder="e.g., Farm Address, Accra"
                  />
                </div>
                <div>
                  <Label>Delivery Location</Label>
                  <Input
                    value={newRequest.deliveryLocation}
                    onChange={(e) => setNewRequest({ ...newRequest, deliveryLocation: e.target.value })}
                    placeholder="e.g., Market Address, Kumasi"
                  />
                </div>
                <div>
                  <Label>Request Date</Label>
                  <DatePickerPopover
                    value={newRequest.requestDate}
                    onChange={(date) => setNewRequest({ ...newRequest, requestDate: date || new Date() })}
                  />
                </div>
                <div>
                  <Label>Estimated Delivery Date</Label>
                  <DatePickerPopover
                    value={newRequest.estimatedDeliveryDate}
                    onChange={(date) => setNewRequest({ ...newRequest, estimatedDeliveryDate: date || new Date() })}
                  />
                </div>
                {newRequest.pickupLocation && newRequest.deliveryLocation && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-4 h-4" />
                      <span className="font-medium">Route Optimization</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Distance: {calculateDistance(newRequest.pickupLocation, newRequest.deliveryLocation)} km
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estimated Time: {calculateEstimatedTime(calculateDistance(newRequest.pickupLocation, newRequest.deliveryLocation))} hours
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => createRequest.mutate({
                    orderId: parseInt(newRequest.orderId),
                    pickupLocation: newRequest.pickupLocation,
                    deliveryLocation: newRequest.deliveryLocation,
                    requestDate: newRequest.requestDate,
                    estimatedDeliveryDate: newRequest.estimatedDeliveryDate,
                  })}
                  disabled={!newRequest.orderId || !newRequest.pickupLocation || !newRequest.deliveryLocation}
                  className="w-full"
                >
                  Create Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requestedCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently delivering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting transport
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Transport Requests</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tracking">Delivery Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {transportRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No transport requests yet. Create a request to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {transportRequests.map((request: any) => {
                const distance = calculateDistance(request.pickupLocation, request.deliveryLocation);
                const estimatedTime = calculateEstimatedTime(distance);
                
                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Transport Request #{request.id}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Order #{request.orderId}
                          </CardDescription>
                        </div>
                        {request.status && getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <MapPin className="w-4 h-4" />
                              Pickup Location
                            </div>
                            <p className="text-sm text-muted-foreground">{request.pickupLocation}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <MapPin className="w-4 h-4" />
                              Delivery Location
                            </div>
                            <p className="text-sm text-muted-foreground">{request.deliveryLocation}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <Calendar className="w-4 h-4" />
                              Request Date
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <Calendar className="w-4 h-4" />
                              Estimated Delivery
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.estimatedDeliveryDate ? new Date(request.estimatedDeliveryDate).toLocaleDateString() : "Not set"}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Navigation className="w-4 h-4" />
                            <span className="text-sm font-medium">Route Information</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>Distance: {distance} km</div>
                            <div>Est. Time: {estimatedTime} hours</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {request.status === "requested" && (
                            <Button
                              size="sm"
                              onClick={() => acceptRequest.mutate({ id: request.id, estimatedDeliveryDate: new Date() })}
                            >
                              Accept Request
                            </Button>
                          )}
                          {request.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus.mutate({ id: request.id, status: "in_transit" })}
                            >
                              Start Delivery
                            </Button>
                          )}
                          {request.status === "in_transit" && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus.mutate({ id: request.id, status: "delivered", actualDeliveryDate: new Date() })}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          {request.status !== "delivered" && request.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus.mutate({ id: request.id, status: "cancelled" })}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No orders yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Order #{order.id}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Order Date: {new Date(order.orderDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {order.status && getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Total Amount</p>
                        <p className="text-2xl font-bold">GH₵{order.totalAmount}</p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus.mutate({ id: order.id, status: "confirmed" })}
                          >
                            Confirm Order
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus.mutate({ id: order.id, status: "fulfilled" })}
                          >
                            Mark as Fulfilled
                          </Button>
                        )}
                        {order.status !== "fulfilled" && order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus.mutate({ id: order.id, status: "cancelled" })}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Delivery Tracking</CardTitle>
              <CardDescription>Track deliveries in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              {transportRequests.filter((r: any) => r.status === "in_transit").length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No active deliveries to track.
                </div>
              ) : (
                <div className="space-y-4">
                  {transportRequests.filter((r: any) => r.status === "in_transit").map((request: any) => {
                    const distance = calculateDistance(request.pickupLocation, request.deliveryLocation);
                    const progress = Math.floor(Math.random() * 100); // Mock progress
                    
                    return (
                      <Card key={request.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Transport Request #{request.id}</p>
                                <p className="text-sm text-muted-foreground">Order #{request.orderId}</p>
                              </div>
                              <Badge>In Transit</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">From</p>
                                <p className="font-medium">{request.pickupLocation}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">To</p>
                                <p className="font-medium">{request.deliveryLocation}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Navigation className="w-4 h-4" />
                              <span>{distance} km • Est. {calculateEstimatedTime(distance)} hours</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
