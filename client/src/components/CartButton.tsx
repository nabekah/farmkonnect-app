import { ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";

export function CartButton() {
  const { items, totalItems, total, totalDiscount, removeItem, updateQuantity } = useCart();
  const [, setLocation] = useLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              {totalItems}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Shopping Cart</h3>
          <p className="text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>
        
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="p-4 border-b border-border hover:bg-accent/50 transition-colors">
                  <div className="flex gap-3">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">{item.unit}</span>
                      </div>
                      <div className="mt-1">
                        {item.bulkDiscount ? (
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground line-through">
                              GH₵{parseFloat(item.price).toFixed(2)} × {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              GH₵{parseFloat(item.bulkDiscount.discountedPrice).toFixed(2)} × {item.quantity}
                              <span className="text-xs ml-1">({item.bulkDiscount.percentage}% off)</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold">
                            GH₵{parseFloat(item.price).toFixed(2)} × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-border space-y-2">
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bulk Discount Savings:</span>
                  <span className="font-semibold">-GH₵{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setLocation("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
