import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { lookbook, products, type Product } from "@/data/products";
import { QuickViewModal } from "@/components/QuickViewModal";
import { ShoppingBag, Sparkles } from "lucide-react";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook — Nordhem" },
      {
        name: "description",
        content:
          "The Nordhem lookbook: neutral layers photographed on the coast, in the forest and in quiet rooms.",
      },
      { property: "og:title", content: "Lookbook — Nordhem" },
      {
        property: "og:description",
        content: "Styled looks from the current Nordhem collection.",
      },
    ],
  }),
  component: Lookbook,
});

// Map lookbook index to featured product IDs
const LOOKBOOK_FEATURED_PRODUCTS: Record<number, string> = {
  0: "bris-alpaca-cardigan",
  1: "halland-wool-coat",
  2: "lin-oversized-shirt",
  3: "sund-ribbed-turtleneck",
  4: "vide-merino-crewneck",
  5: "torv-quilted-jacket",
};

function Lookbook() {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  return (
    <div className="mx-auto max-w-[110rem] px-5 py-14 md:px-10 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-700" /> Autumn / Winter
          </p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Interactive Lookbook</h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
            Photographed on the Jutland coast and in Porto. Hover over any look or tap the pin to shop the featured piece.
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {lookbook.map((l, i) => {
          const featuredId = LOOKBOOK_FEATURED_PRODUCTS[i];
          const product = products.find((p) => p.id === featuredId);

          return (
            <figure
              key={l.src}
              className={`group relative overflow-hidden bg-secondary border border-border/40 ${
                i % 5 === 0 ? "md:row-span-2" : ""
              }`}
            >
              <img
                src={l.src}
                alt={l.alt}
                loading="lazy"
                width={800}
                height={1008}
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
              />

              {/* Hotspot Pin */}
              {product && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <button
                    onClick={() => setActiveProduct(product)}
                    className="relative z-10 flex items-center gap-2 rounded-full bg-background/85 px-4 py-2 text-xs backdrop-blur-md shadow-lg transition-all hover:bg-foreground hover:text-background cursor-pointer group-hover:scale-105"
                  >
                    <ShoppingBag size={14} />
                    <span className="font-sans font-medium text-[0.7rem] uppercase tracking-wider hidden sm:inline">
                      Shop {product.name}
                    </span>
                  </button>
                </div>
              )}
            </figure>
          );
        })}
      </div>

      {activeProduct && (
        <QuickViewModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
}
