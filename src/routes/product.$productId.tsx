import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Heart, AlertCircle, Ruler, X, Check, Share2, Calculator } from "lucide-react";
import { getProduct, products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { SizeCalculatorModal } from "@/components/SizeCalculatorModal";
import { ShareModal } from "@/components/ShareModal";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import { useRecentlyViewed } from "@/lib/recently-viewed";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Piece unavailable — Nordhem" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Nordhem` },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: `${product.name} — Nordhem` },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { formatPrice } = useCurrency();
  const { addViewed, viewedProducts } = useRecentlyViewed();

  useEffect(() => {
    if (product) addViewed(product.id);
  }, [product, addViewed]);

  const wishlisted = isWishlisted(product.id);

  const gallery = [product.imageUrl, product.hoverImageUrl];
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSizeCalculator, setShowSizeCalculator] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const sizeSectionRef = useRef<HTMLDivElement>(null);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, 4);

  function handleSelectSize(selectedSize: string, isOutOfStock: boolean) {
    if (isOutOfStock) return;
    setSize(selectedSize);
    setSizeError(null);
  }

  function onAdd() {
    if (!size) {
      setSizeError("Please select a size before adding to cart.");
      sizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (product.outOfStockSizes?.includes(size)) {
      setSizeError("The selected size is out of stock.");
      return;
    }

    setSizeError(null);
    add(product.id, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mx-auto max-w-[110rem] px-5 py-10 md:px-10 md:py-16">
      <nav className="eyebrow mb-8">
        <Link to="/shop" className="link-underline">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex gap-4">
          <div className="hidden w-20 shrink-0 flex-col gap-3 md:flex">
            {gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`overflow-hidden border transition-colors ${
                  active === i ? "border-foreground" : "border-transparent hover:border-border"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-secondary">
            <img
              src={gallery[active]}
              alt={product.name}
              width={900}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base tabular-nums text-muted-foreground">
            {formatPrice(product.price)}
          </p>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Size Selector Section */}
          <div ref={sizeSectionRef} className="mt-10 scroll-mt-32">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="eyebrow">Size</p>
                {size ? (
                  <span className="text-xs font-medium text-foreground">• {size} selected</span>
                ) : (
                  <span
                    className={`text-xs ${sizeError ? "text-destructive font-medium" : "text-muted-foreground"}`}
                  >
                    {sizeError ? "Selection required" : "Select a size"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSizeCalculator(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  <Calculator size={13} /> Find My Size
                </button>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  <Ruler size={13} /> Size Guide
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s: string) => {
                const isOutOfStock = product.outOfStockSizes?.includes(s) ?? false;
                const isSelected = size === s;

                return (
                  <div key={s} className="group/btn relative">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleSelectSize(s, isOutOfStock)}
                      className={`relative min-w-14 border px-4 py-3 text-xs tracking-widest transition-all duration-200 ${
                        isOutOfStock
                          ? "cursor-not-allowed opacity-40 bg-secondary/40 border-dashed border-border text-muted-foreground line-through"
                          : isSelected
                            ? "border-foreground bg-foreground text-background font-semibold shadow-sm scale-[1.02]"
                            : sizeError && !size
                              ? "border-destructive/60 bg-destructive/5 hover:border-destructive text-foreground"
                              : "border-border hover:border-foreground text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {s}
                    </button>
                    {isOutOfStock && (
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover/btn:opacity-100 whitespace-nowrap z-10">
                        Out of stock
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Validation Error Alert */}
            {sizeError && (
              <div className="mt-3 flex items-center gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                <AlertCircle size={14} className="shrink-0" />
                <span>{sizeError}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            <button onClick={onAdd} className="btn-solid flex-1 transition-all">
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={16} /> Added to cart ({size})
                </span>
              ) : (
                "Add to cart"
              )}
            </button>
            <button
              onClick={() => toggle(product.id)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="btn-outline flex items-center justify-center gap-2 px-4"
            >
              <Heart size={16} className={wishlisted ? "fill-foreground text-foreground" : ""} />
              <span className="hidden sm:inline text-xs">{wishlisted ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              aria-label="Share piece"
              className="btn-outline px-3"
            >
              <Share2 size={16} />
            </button>
          </div>

          <ul className="mt-10 space-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
            {product.details.map((d: string) => (
              <li key={d}>— {d}</li>
            ))}
            <li>— Free shipping and returns within Europe</li>
          </ul>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg border border-border bg-card p-6 md:p-8 shadow-xl">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close size guide"
            >
              <X size={18} />
            </button>

            <p className="eyebrow">Measurements</p>
            <h3 className="mt-1 font-display text-2xl">Size Guide</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Nordhem pieces are cut for an understated, relaxed Scandinavian fit. If you prefer a
              tailored fit, choose one size down.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Size</th>
                    <th className="py-2 px-4 font-medium">Chest (cm)</th>
                    <th className="py-2 px-4 font-medium">Waist (cm)</th>
                    <th className="py-2 pl-4 font-medium">Hip (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">XS / 24</td>
                    <td className="py-2.5 px-4 text-muted-foreground">84 - 88</td>
                    <td className="py-2.5 px-4 text-muted-foreground">68 - 72</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">88 - 92</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">S / 26</td>
                    <td className="py-2.5 px-4 text-muted-foreground">88 - 94</td>
                    <td className="py-2.5 px-4 text-muted-foreground">72 - 78</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">92 - 98</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">M / 28</td>
                    <td className="py-2.5 px-4 text-muted-foreground">94 - 100</td>
                    <td className="py-2.5 px-4 text-muted-foreground">78 - 84</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">98 - 104</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">L / 30</td>
                    <td className="py-2.5 px-4 text-muted-foreground">100 - 106</td>
                    <td className="py-2.5 px-4 text-muted-foreground">84 - 90</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">104 - 110</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">XL / 32</td>
                    <td className="py-2.5 px-4 text-muted-foreground">106 - 112</td>
                    <td className="py-2.5 px-4 text-muted-foreground">90 - 96</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">110 - 116</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="btn-solid mt-8 w-full py-2.5 text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Size Calculator Modal */}
      {showSizeCalculator && (
        <SizeCalculatorModal
          onSelectSize={(selected) => {
            setSize(selected);
            setSizeError(null);
          }}
          onClose={() => setShowSizeCalculator(false)}
        />
      )}

      {/* Share Piece Modal */}
      {showShareModal && <ShareModal product={product} onClose={() => setShowShareModal(false)} />}

      <section className="mt-28">
        <h2 className="border-b border-border pb-5 font-display text-2xl">You may also like</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Reviews & Customer Experiences */}
      <ProductReviews productId={product.id} />

      {viewedProducts.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-24 border-t border-border pt-16">
          <p className="eyebrow mb-2">History</p>
          <h2 className="font-display text-2xl">Recently Viewed</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {viewedProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
