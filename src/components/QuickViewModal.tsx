import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Heart, Check, ArrowRight, AlertCircle } from "lucide-react";
import { type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { add } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { formatPrice } = useCurrency();

  const wishlisted = isWishlisted(product.id);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = [product.imageUrl, product.hoverImageUrl];

  function handleAdd() {
    if (!size) {
      setSizeError("Please select a size first.");
      return;
    }

    add(product.id, size);
    setAdded(true);
    toast.success(`Added ${product.name} (${size}) to cart`);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-up">
      <div className="relative w-full max-w-3xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-background/80 p-2 text-muted-foreground hover:text-foreground backdrop-blur-sm transition-colors"
          aria-label="Close Quick View"
        >
          <X size={18} />
        </button>

        {/* Left Gallery Image */}
        <div className="md:w-1/2 relative bg-secondary overflow-hidden aspect-[3/4] md:aspect-auto">
          <img
            src={images[activeImage]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImage === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <p className="eyebrow">{product.category}</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">{product.name}</h2>
            <p className="mt-2 text-base tabular-nums font-medium">
              {formatPrice(product.price)}
            </p>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="eyebrow">Select Size</span>
                {sizeError && (
                  <span className="text-destructive font-medium flex items-center gap-1">
                    <AlertCircle size={12} /> {sizeError}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const isOutOfStock = product.outOfStockSizes?.includes(s);
                  const isSelected = size === s;

                  return (
                    <button
                      key={s}
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (isOutOfStock) return;
                        setSize(s);
                        setSizeError(null);
                      }}
                      className={`min-w-11 border px-3 py-2 text-xs tracking-wider transition-all ${
                        isOutOfStock
                          ? "opacity-30 line-through cursor-not-allowed bg-secondary/50"
                          : isSelected
                            ? "border-foreground bg-foreground text-background font-medium"
                            : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-4 border-t border-border">
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="btn-solid flex-1 py-3 text-xs uppercase tracking-widest"
              >
                {added ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Check size={14} /> Added
                  </span>
                ) : (
                  "Add to Cart"
                )}
              </button>
              <button
                onClick={() => {
                  toggle(product.id);
                  toast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist");
                }}
                className="btn-outline px-3"
                aria-label="Wishlist"
              >
                <Heart size={16} className={wishlisted ? "fill-foreground text-foreground" : ""} />
              </button>
            </div>

            <Link
              to="/product/$productId"
              params={{ productId: product.id }}
              onClick={onClose}
              className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground link-underline py-1 w-full text-center"
            >
              View full details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
