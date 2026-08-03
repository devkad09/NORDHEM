import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function MiniCartDrawer() {
  const { detailed, count, subtotal, isOpen, closeCart, setQty, remove } = useCart();
  const { formatPrice } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-xs animate-fade-up">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={closeCart} aria-hidden="true" />

      {/* Drawer Content */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between border-l border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 md:px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-foreground" />
            <h2 className="font-display text-xl">Shopping Bag</h2>
            <span className="eyebrow rounded bg-secondary px-2 py-0.5 text-[0.65rem] font-mono">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 md:px-6 divide-y divide-border">
          {detailed.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <p className="eyebrow text-muted-foreground">Your bag is empty</p>
              <p className="text-xs text-muted-foreground">
                Discover our small-batch collection of elevated essentials.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="btn-solid inline-block mt-4 text-xs uppercase"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            detailed.map((line) => (
              <div key={`${line.id}-${line.size}`} className="pt-4 first:pt-0 flex gap-4">
                <Link
                  to="/product/$productId"
                  params={{ productId: line.id }}
                  onClick={closeCart}
                  className="h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary"
                >
                  <img
                    src={line.product.imageUrl}
                    alt={line.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between gap-2">
                      <Link
                        to="/product/$productId"
                        params={{ productId: line.id }}
                        onClick={closeCart}
                        className="font-medium text-xs hover:underline"
                      >
                        {line.product.name}
                      </Link>
                      <button
                        onClick={() => remove(line.id, line.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="eyebrow mt-1 text-[0.65rem]">Size {line.size}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => setQty(line.id, line.size, line.qty - 1)}
                        className="px-2 py-0.5 text-xs hover:bg-secondary"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs tabular-nums">{line.qty}</span>
                      <button
                        onClick={() => setQty(line.id, line.size, line.qty + 1)}
                        className="px-2 py-0.5 text-xs hover:bg-secondary"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-medium tabular-nums">
                      {formatPrice(line.product.price * line.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {detailed.length > 0 && (
          <div className="border-t border-border p-5 space-y-4 md:p-6 bg-card/90">
            <div className="flex justify-between text-sm">
              <span className="eyebrow">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>

            <p className="text-[0.7rem] text-muted-foreground">
              Shipping & taxes calculated at checkout. Free lifetime mending included.
            </p>

            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={closeCart}
                className="btn-solid w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest text-center"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
              <Link
                to="/cart"
                onClick={closeCart}
                className="btn-outline w-full text-center text-xs uppercase tracking-widest block py-2.5"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
