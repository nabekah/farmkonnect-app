import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { Heart, ShoppingCart, Shield } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: any;
  onAddToCart: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Fetch images for this specific product
  const { data: images = [] } = trpc.marketplace.getProductImages.useQuery({ 
    productId: product.id 
  });
  
  // Check if product is in wishlist
  const { data: wishlistStatus } = trpc.marketplace.isInWishlist.useQuery({ 
    productId: product.id 
  });
  
  // Get bulk pricing tiers
  const { data: bulkTiers = [] } = trpc.marketplace.getBulkPricingTiers.useQuery({ 
    productId: product.id 
  });
  
  // Check if seller is verified
  const { data: isVerified = false } = trpc.marketplace.isSellerVerified.useQuery({ 
    sellerId: product.sellerId 
  });
  
  useEffect(() => {
    if (wishlistStatus !== undefined) {
      setIsInWishlist(wishlistStatus);
    }
  }, [wishlistStatus]);
  
  const addToWishlist = trpc.marketplace.addToWishlist.useMutation({
    onSuccess: (data) => {
      if (!data.alreadyExists) {
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    },
    onError: () => {
      toast.error("Failed to add to wishlist");
    },
  });
  
  const removeFromWishlist = trpc.marketplace.removeFromWishlist.useMutation({
    onSuccess: () => {
      setIsInWishlist(false);
      toast.success("Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    },
  });
  
  const toggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist.mutate({ productId: product.id });
    } else {
      addToWishlist.mutate({ productId: product.id });
    }
  };

  // Combine fetched images with fallback to imageUrl
  const displayImages = images.length > 0 
    ? images.map((img: any) => img.imageUrl)
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <Card>
      {displayImages.length > 0 && (
        <ProductImageCarousel images={displayImages} productName={product.name} />
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <CardTitle className="line-clamp-2 text-base sm:text-lg">{product.name}</CardTitle>
              {isVerified && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 flex-shrink-0 w-fit text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs sm:text-sm">{product.category}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleWishlist}
            className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl sm:text-2xl font-bold">GH₵{parseFloat(product.price).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{product.quantity} {product.unit} available</p>
          </div>
        </div>
        {bulkTiers.length > 0 && (
          <div className="bg-accent/50 p-2 sm:p-3 rounded-lg">
            <p className="text-xs font-semibold text-accent-foreground mb-1 sm:mb-2">🎯 Bulk Discounts</p>
            <div className="space-y-0.5 sm:space-y-1">
              {bulkTiers.slice(0, 2).map((tier: any) => (
                <p key={tier.id} className="text-xs text-muted-foreground">
                  {parseFloat(tier.minQuantity)}+ {product.unit}: {parseFloat(tier.discountPercentage)}% off
                </p>
              ))}
              {bulkTiers.length > 2 && (
                <p className="text-xs text-muted-foreground">+{bulkTiers.length - 2} more</p>
              )}
            </div>
          </div>
        )}
        <Button onClick={() => onAddToCart(product.id)} className="w-full text-sm sm:text-base h-9 sm:h-10">
          <ShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
