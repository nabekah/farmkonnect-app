import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface BulkPricingManagerProps {
  productId: number;
  basePrice: string;
}

export function BulkPricingManager({ productId, basePrice }: BulkPricingManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [discount, setDiscount] = useState("");

  const utils = trpc.useUtils();
  const { data: tiers = [], isLoading } = trpc.marketplace.getBulkPricingTiers.useQuery({ productId });

  const createTier = trpc.marketplace.createBulkPricingTier.useMutation({
    onSuccess: () => {
      toast.success("Bulk pricing tier added!");
      setMinQty("");
      setMaxQty("");
      setDiscount("");
      setShowForm(false);
      utils.marketplace.getBulkPricingTiers.invalidate({ productId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add tier");
    },
  });

  const deleteTier = trpc.marketplace.deleteBulkPricingTier.useMutation({
    onSuccess: () => {
      toast.success("Tier deleted");
      utils.marketplace.getBulkPricingTiers.invalidate({ productId });
    },
  });

  const handleSubmit = () => {
    if (!minQty || !discount) {
      toast.error("Please fill in minimum quantity and discount percentage");
      return;
    }

    const discountNum = parseFloat(discount);
    if (discountNum <= 0 || discountNum >= 100) {
      toast.error("Discount must be between 0 and 100");
      return;
    }

    createTier.mutate({
      productId,
      minQuantity: minQty,
      maxQuantity: maxQty || undefined,
      discountPercentage: discount,
    });
  };

  const calculateDiscountedPrice = (discountPercent: string) => {
    const base = parseFloat(basePrice);
    const discount = parseFloat(discountPercent);
    return (base * (1 - discount / 100)).toFixed(2);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Bulk Pricing Tiers</h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Tier
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Quantity</Label>
              <Input
                type="number"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <Label>Max Quantity (Optional)</Label>
              <Input
                type="number"
                value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
          </div>

          <div>
            <Label>Discount Percentage (%)</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="e.g., 10"
              step="0.01"
            />
            {discount && (
              <p className="text-sm text-muted-foreground mt-1">
                Discounted price: GH₵{calculateDiscountedPrice(discount)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={createTier.isPending}>
              {createTier.isPending ? "Adding..." : "Add Tier"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading tiers...</p>
      ) : tiers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bulk pricing tiers configured.</p>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">
                  {tier.minQuantity}
                  {tier.maxQuantity ? ` - ${tier.maxQuantity}` : "+"} units
                </p>
                <p className="text-sm text-muted-foreground">
                  {tier.discountPercentage}% off → GH₵{tier.discountedPrice}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteTier.mutate({ tierId: tier.id })}
                disabled={deleteTier.isPending}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {tiers.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">How it works:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Buyers ordering in bulk automatically get the discount</li>
            <li>• Discounts are calculated at checkout based on quantity</li>
            <li>• Encourage larger orders to increase your revenue</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
