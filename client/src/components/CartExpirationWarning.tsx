import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  productName: string;
  daysRemaining: number;
  isExpiring: boolean;
  isExpired: boolean;
  expiresAt: string;
}

interface CartExpirationWarningProps {
  cartItems: CartItem[];
  onExtendExpiration?: (cartItemId: number) => void;
}

export function CartExpirationWarning({
  cartItems,
  onExtendExpiration,
}: CartExpirationWarningProps) {
  const [extendingIds, setExtendingIds] = useState<Set<number>>(new Set());
  const updateCartQuantityMutation = trpc.marketplace.updateCartQuantity.useMutation();

  // Filter items that are expiring or expired
  const expiringItems = cartItems.filter((item) => item.isExpiring || item.isExpired);

  if (expiringItems.length === 0) {
    return null;
  }

  const handleExtendExpiration = async (cartItemId: number, currentQuantity: number) => {
    setExtendingIds((prev) => new Set(prev).add(cartItemId));

    try {
      // Update quantity with current value to extend expiration
      await updateCartQuantityMutation.mutateAsync({
        cartId: cartItemId,
        quantity: currentQuantity,
      });

      toast.success("Cart item expiration extended by 30 days");
      onExtendExpiration?.(cartItemId);
    } catch (error) {
      toast.error("Failed to extend expiration. Please try again.");
      console.error("Error extending expiration:", error);
    } finally {
      setExtendingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {expiringItems.map((item) => (
        <Alert
          key={item.id}
          className={`border-l-4 ${
            item.isExpired
              ? "border-l-red-500 bg-red-50"
              : "border-l-amber-500 bg-amber-50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {item.isExpired ? (
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <AlertTitle
                  className={`${
                    item.isExpired ? "text-red-900" : "text-amber-900"
                  }`}
                >
                  {item.productName}
                </AlertTitle>
                <AlertDescription
                  className={`${
                    item.isExpired ? "text-red-800" : "text-amber-800"
                  } mt-1`}
                >
                  {item.isExpired ? (
                    <span className="font-semibold">
                      This item has expired and will be removed from your cart
                    </span>
                  ) : (
                    <span>
                      <span className="font-semibold">
                        {item.daysRemaining} day{item.daysRemaining !== 1 ? "s" : ""} remaining
                      </span>
                      <br />
                      Expires on {new Date(item.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </AlertDescription>
              </div>
            </div>

            {!item.isExpired && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const cartItem = cartItems.find((c) => c.id === item.id);
                  if (cartItem) {
                    handleExtendExpiration(item.id, 1);
                  }
                }}
                disabled={extendingIds.has(item.id)}
                className="flex-shrink-0 whitespace-nowrap"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    extendingIds.has(item.id) ? "animate-spin" : ""
                  }`}
                />
                {extendingIds.has(item.id) ? "Extending..." : "Extend"}
              </Button>
            )}
          </div>
        </Alert>
      ))}

      {expiringItems.some((item) => item.isExpired) && (
        <Alert className="border-l-4 border-l-blue-500 bg-blue-50">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900">
            Expired Items Notice
          </AlertTitle>
          <AlertDescription className="text-blue-800 mt-1">
            Expired items will be automatically removed from your cart. Please
            complete your purchase or extend expiration for items you want to
            keep.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
