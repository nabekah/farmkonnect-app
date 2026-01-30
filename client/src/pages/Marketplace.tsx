import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2, Star, Search } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Vegetables", "Dairy", "Meat", "Grains", "Fruits", "Herbs", "Eggs", "Other"];

export function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    productType: "",
    price: "",
    quantity: "",
    unit: "kg",
  });

  // Queries
  const { data: products = [], refetch: refetchProducts } = trpc.marketplace.listProducts.useQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    limit: 50,
  });

  const { data: cart = [] } = trpc.marketplace.getCart.useQuery();
  const { data: sellerStats } = trpc.marketplace.getSellerStats.useQuery();

  // Mutations
  const createProductMutation = trpc.marketplace.createProduct.useMutation();
  const addToCartMutation = trpc.marketplace.addToCart.useMutation();
  const removeFromCartMutation = trpc.marketplace.removeFromCart.useMutation();

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createProductMutation.mutateAsync({
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      productType: newProduct.productType,
      price: parseFloat(newProduct.price),
      quantity: parseFloat(newProduct.quantity),
      unit: newProduct.unit,
    });

    setNewProduct({ name: "", description: "", category: "", productType: "", price: "", quantity: "", unit: "kg" });
    setIsCreateOpen(false);
    refetchProducts();
    toast.success("Product created successfully!");
  };

  const handleAddToCart = async (productId: number) => {
    await addToCartMutation.mutateAsync({ productId, quantity: 1 });
    toast.success("Added to cart!");
  };

  const handleRemoveFromCart = async (cartId: number) => {
    await removeFromCartMutation.mutateAsync({ cartId });
    toast.success("Removed from cart!");
  };

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find((p: any) => p.id === item.productId);
    return sum + (product ? parseFloat(product.price) * parseFloat(item.quantity) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-2">Buy and sell agricultural products directly</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Sell Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>List New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="e.g., Organic Tomatoes"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="product-type">Product Type</Label>
                <Input
                  id="product-type"
                  placeholder="e.g., Tomato"
                  value={newProduct.productType}
                  onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newProduct.category} onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Product details..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    step="0.01"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={newProduct.unit} onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["kg", "liter", "dozen", "bunch", "box", "piece"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateProduct} className="w-full">
                List Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Products</TabsTrigger>
          <TabsTrigger value="cart" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart {cart.length > 0 && `(${cart.length})`}
          </TabsTrigger>
          {sellerStats && (
            <TabsTrigger value="selling">My Sales</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card key={product.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <CardDescription className="text-xs">{product.productType}</CardDescription>
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge variant="secondary">{product.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-2xl font-bold">${parseFloat(product.price).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {parseFloat(product.quantity).toFixed(1)} {product.unit} available
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.status !== "active"}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cart" className="space-y-4">
          {cart.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Your cart is empty
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                {cart.map((item: any) => {
                  const product = products.find((p: any) => p.id === item.productId);
                  return (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {parseFloat(item.quantity)} {product?.unit} × ${parseFloat(product?.price || "0").toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${(parseFloat(item.quantity) * parseFloat(product?.price || "0")).toFixed(2)}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>TBD</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4">Proceed to Checkout</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Delivery Address</Label>
                          <Input placeholder="Enter your delivery address" />
                        </div>
                        <div>
                          <Label>Notes (Optional)</Label>
                          <Input placeholder="Special instructions..." />
                        </div>
                        <Button className="w-full">Complete Order</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {sellerStats && (
          <TabsContent value="selling" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.activeProducts}</div>
                  <p className="text-xs text-muted-foreground">of {sellerStats.totalProducts} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{sellerStats.completedOrders} completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${sellerStats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${sellerStats.averageOrderValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Per order</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
