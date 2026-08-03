import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type Product } from "@/data/products";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { QuickViewModal } from "./QuickViewModal";

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggle } = useWishlist();
  const { formatPrice } = useCurrency();
  const wishlisted = isWishlisted(product.id);
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <div className="group relative block">
        <div className="relative overflow-hidden bg-secondary">
          <Link
            to="/product/$productId"
            params={{ productId: product.id }}
            className="block"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              width={900}
              height={1200}
              className="h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
            />
            <img
              src={product.hoverImageUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={900}
              height={1200}
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            />
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickView(true);
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 bg-background/90 px-5 py-2 text-[0.625rem] uppercase tracking-[0.2em] opacity-0 transition-all duration-500 hover:bg-background group-hover:translate-y-0 group-hover:opacity-100 z-10 cursor-pointer"
          >
            Quick view
          </button>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              wishlisted ? "fill-foreground text-foreground" : "text-foreground/70"
            }`}
          />
        </button>

        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          className="mt-4 flex items-baseline justify-between gap-3 block"
        >
          <div>
            <h3 className="font-sans text-sm font-normal">{product.name}</h3>
            <p className="eyebrow mt-1">{product.category}</p>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">{formatPrice(product.price)}</p>
        </Link>
      </div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
