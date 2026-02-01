import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";

export default function InventoryAlerts() {
  const { data: lowStockProducts = [], refetch } = trpc.marketplace.checkLowStockProducts.useQuery();

  const sendAlert = trpc.marketplace.sendLowStockAlert.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Low stock alert sent successfully");
      } else {
        toast.info(data.message || "Alert not sent");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send alert");
    },
  });

  const handleSendAlert = (productId: number) => {
    sendAlert.mutate({ productId });
  };

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Inventory Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage low stock alerts for your products</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Low Stock Products</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      {lowStockProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">All products are well stocked</h3>
            <p className="text-muted-foreground">
              No products are currently below their alert thresholds
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lowStockProducts.map((product: any) => (
            <Card key={product.id} className="border-yellow-500/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    Low Stock
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Stock:</span>
                    <span className="font-bold text-yellow-700 dark:text-yellow-400">
                      {parseFloat(product.quantity).toFixed(2)} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Alert Threshold:</span>
                    <span className="font-medium">
                      {product.alertThreshold} {product.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleSendAlert(product.id)}
                    disabled={sendAlert.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Send Alert Now
                  </Button>
                  <Button
                    onClick={() => window.location.href = `/marketplace/products/edit/${product.id}`}
                    className="w-full"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Restock Product
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Price: GH₵{parseFloat(product.price).toFixed(2)}</p>
                  <p>SKU: {product.sku || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Inventory alerts help you stay on top of your stock levels and avoid stockouts
          </p>
          <p>
            • Set alert thresholds when creating or editing products
          </p>
          <p>
            • Alerts are sent via SMS to your registered phone number
          </p>
          <p>
            • To prevent spam, alerts are limited to once every 24 hours per product
          </p>
          <p>
            • Low stock badges appear on your seller dashboard for quick visibility
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
