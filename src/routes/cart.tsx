import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tag, Check, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Nordhem" },
      { name: "description", content: "Review your selected items before checking out." },
    ],
  }),
  component: Cart,
});

const PROMO_CODES: Record<string, { label: string; percent?: number; freeShipping?: boolean }> = {
  NORDHEM10: { label: "10% OFF", percent: 10 },
  WELCOME20: { label: "20% OFF", percent: 20 },
  FREESHIP: { label: "Free Express Shipping", freeShipping: true },
};

function Cart() {
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const { formatPrice } = useCurrency();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError(null);
      toast.success(`Promo code ${code} applied!`);
    } else {
      setPromoError("Invalid code. Try NORDHEM10 or WELCOME20.");
    }
  }

  const promoInfo = appliedPromo ? PROMO_CODES[appliedPromo] : null;
  const discountAmount = promoInfo?.percent ? subtotal * (promoInfo.percent / 100) : 0;
  const finalSubtotal = subtotal - discountAmount;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center md:py-36">
        <p className="eyebrow">Shopping bag</p>
        <h1 className="mt-2 font-display text-4xl">Your cart is empty.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Explore our collection of understated essential pieces.
        </p>
        <Link to="/shop" className="btn-solid mt-8 inline-block">
          Explore collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-20">
      <div className="flex items-baseline justify-between border-b border-border pb-6">
        <h1 className="font-display text-3xl md:text-4xl">Shopping bag</h1>
        <span className="eyebrow">{lines.reduce((acc, l) => acc + l.qty, 0)} items</span>
      </div>

      <div className="mt-8 divide-y divide-border">
        {lines.map((line) => (
          <div key={`${line.id}-${line.size}`} className="flex gap-6 py-6">
            <Link
              to="/product/$productId"
              params={{ productId: line.id }}
              className="h-28 w-24 flex-shrink-0 overflow-hidden bg-secondary"
            >
              <img
                src={line.product.imageUrl}
                alt={line.product.name}
                loading="lazy"
                width={900}
                height={1200}
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between gap-4">
                <div>
                  <Link
                    to="/product/$productId"
                    params={{ productId: line.id }}
                    className="link-underline text-sm font-medium"
                  >
                    {line.product.name}
                  </Link>
                  <p className="eyebrow mt-1">Size {line.size}</p>
                </div>
                <p className="text-sm tabular-nums font-medium">
                  {formatPrice(line.product.price * line.qty)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQty(line.id, line.size, line.qty - 1)}
                    aria-label="Decrease quantity"
                    className="px-3 py-1 text-sm transition-colors hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs tabular-nums">{line.qty}</span>
                  <button
                    onClick={() => setQty(line.id, line.size, line.qty + 1)}
                    aria-label="Increase quantity"
                    className="px-3 py-1 text-sm transition-colors hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => remove(line.id, line.size)}
                  className="eyebrow link-underline hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-5 pt-6 border-t border-border">
        <form onSubmit={handleApplyPromo} className="w-full max-w-xs space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Promo code (e.g. WELCOME20)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="w-full border border-border bg-card py-2 pl-9 pr-3 text-xs uppercase placeholder:normal-case focus:border-foreground focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-outline px-4 text-xs uppercase">
              Apply
            </button>
          </div>

          {promoError && <p className="text-[0.7rem] text-destructive">{promoError}</p>}

          {appliedPromo && (
            <div className="flex items-center justify-between rounded bg-secondary/80 px-3 py-1.5 text-xs">
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                <Check size={12} className="text-emerald-600" /> Code{" "}
                <strong>{appliedPromo}</strong> ({promoInfo?.label})
              </span>
              <button
                type="button"
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoInput("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </form>

        <div className="w-full max-w-xs space-y-2 text-sm border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="eyebrow">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span className="eyebrow">Discount ({promoInfo?.label})</span>
              <span className="tabular-nums">−{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between font-medium text-base pt-2 border-t border-border/60">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(finalSubtotal)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>

        <Link
          to="/checkout"
          search={appliedPromo ? { promo: appliedPromo } : undefined}
          className="btn-solid w-full max-w-xs text-center py-3 text-xs uppercase tracking-widest"
        >
          Proceed to Checkout
        </Link>
        <button onClick={clear} className="eyebrow link-underline hover:text-foreground">
          Clear cart
        </button>
      </div>
    </div>
  );
}
