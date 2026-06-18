import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export const CartSheet = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#855300] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </div>
          <span className="hidden lg:inline font-medium">Cart</span>
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--accent)]" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="w-16 h-16 text-[var(--text-tertiary)]/30" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Your cart is empty</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Browse products and add items to get started.</p>
            </div>
            <Button variant="outline" onClick={() => { setOpen(false); navigate("/materials"); }}>
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-fade-in">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" decoding="async" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--accent)] font-medium uppercase">{item.brand}</p>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{item.specs}</p>
                    <div className="flex items-center justify-between mt-2">
                      {typeof item.id === 'string' && item.id.startsWith('db-') ? (
                        <span className="text-sm font-medium text-[var(--text-secondary)] px-2 py-1 bg-[var(--bg-base)] rounded-md">1 Unit</span>
                      ) : (
                        <div className="flex items-center gap-1 border border-[var(--border-subtle)] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-[var(--bg-base)] rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-[var(--bg-base)] rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <span className="font-bold text-[var(--text-primary)] price-display">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors self-start p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="text-lg font-bold text-[var(--text-primary)] price-display">₹{totalPrice.toLocaleString()}</span>
              </div>
              <Button className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
