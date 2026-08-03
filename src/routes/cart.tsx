import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Nordhem" },
      { name: "description", content: "Review the pieces in your Nordhem cart before checkout." },
      { property: "og:title", content: "Your Cart — Nordhem" },
      { property: "og:description", content: "Review the pieces in your Nordhem cart." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, setQty, remove, clear } = useCart();

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing here yet. The collection is small; it will not take long.
        </p>
        <Link to="/shop" className="btn-outline mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
      <h1 className="font-display text-4xl">Cart</h1>

      <div className="mt-10 border-t border-border">
        {detailed.map((line) => (
          <div
            key={`${line.id}-${line.size}`}
            className="flex gap-5 border-b border-border py-6"
          >
            <Link to="/product/$productId" params={{ productId: line.id }} className="w-24 shrink-0 md:w-32">
              <img
                src={line.product.imageUrl}
                alt={line.product.name}
                loading="lazy"
                width={900}
                height={1200}
                className="w-full object-cover"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between gap-4">
                <div>
                  <Link
                    to="/product/$productId"
                    params={{ productId: line.id }}
                    className="link-underline text-sm"
                  >
                    {line.product.name}
                  </Link>
                  <p className="eyebrow mt-1">Size {line.size}</p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(line.product.price * line.qty)}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQty(line.id, line.size, line.qty - 1)}
                    aria-label="Decrease quantity"
                    className="px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-xs tabular-nums">{line.qty}</span>
                  <button
                    onClick={() => setQty(line.id, line.size, line.qty + 1)}
                    aria-label="Increase quantity"
                    className="px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
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

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs justify-between text-sm">
          <span className="eyebrow">Subtotal</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and taxes calculated at checkout.
        </p>
        <Link to="/checkout" className="btn-solid w-full max-w-xs text-center">
          Checkout
        </Link>
        <button onClick={clear} className="eyebrow link-underline hover:text-foreground">
          Clear cart
        </button>
      </div>
    </div>
  );
}
