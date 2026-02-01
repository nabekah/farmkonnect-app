import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";

export default function Wishlist() {
  const { data: wishlistItems = [], refetch } = trpc.marketplace.getWishlist.useQuery();

  const removeFromWishlist = trpc.marketplace.removeFromWishlist.useMutation({
    onSuccess: () => {
      toast.success("Removed from wishlist");
      refetch();
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    },
  });

  const addToCart = trpc.marketplace.addToCart.useMutation({
    onSuccess: () => {
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleRemove = (productId: number) => {
    removeFromWishlist.mutate({ productId });
  };

  const handleAddToCart = (productId: number) => {
    addToCart.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="container max-w-7xl py-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <span className="text-muted-foreground">({wishlistItems.length} items)</span>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start adding products you love to your wishlist
            </p>
            <Button onClick={() => window.location.href = "/marketplace"}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item: any) => {
            const product = item.product;
            if (!product) return null;

            return (
              <Card key={item.id}>
                {product.imageUrl && (
                  <ProductImageCarousel 
                    images={[product.imageUrl]} 
                    productName={product.name} 
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        GH₵{parseFloat(product.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} {product.unit} available
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="flex-1"
                      disabled={addToCart.isPending}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(product.id)}
                      disabled={removeFromWishlist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
