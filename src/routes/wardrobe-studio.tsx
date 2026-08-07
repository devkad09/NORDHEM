import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shirt,
  Sparkles,
  ShoppingBag,
  Shuffle,
  Trash2,
  Check,
  Plus,
  Layers,
  Award,
} from "lucide-react";
import { products, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useRewards } from "@/lib/rewards";
import { toast } from "sonner";

export const Route = createFileRoute("/wardrobe-studio")({
  head: () => ({
    meta: [
      { title: "Wardrobe Studio — Mix & Match Scandinavian Capsules | Nordhem" },
      {
        name: "description",
        content:
          "Design and layer your custom Scandinavian wardrobe outfits interactively with live price and material composition metrics.",
      },
      { property: "og:title", content: "Wardrobe Studio — Nordhem" },
    ],
  }),
  component: WardrobeStudio,
});

type OutfitSlots = {
  outerwear: Product | null;
  top: Product | null;
  bottom: Product | null;
  accessory: Product | null;
};

const CATEGORY_SLOTS: { key: keyof OutfitSlots; label: string; catName: string }[] = [
  { key: "outerwear", label: "Outerwear & Layers", catName: "Outerwear" },
  { key: "top", label: "Knitwear & Shirts", catName: "Knitwear" },
  { key: "bottom", label: "Trousers & Tailoring", catName: "Trousers" },
  { key: "accessory", label: "Accessories & Wool Scarf", catName: "Accessories" },
];

function WardrobeStudio() {
  const [activeCategory, setActiveCategory] = useState<keyof OutfitSlots>("outerwear");
  const [slots, setSlots] = useState<OutfitSlots>({
    outerwear: products.find((p) => p.id === "wool-coat") || products[0],
    top: products.find((p) => p.id === "cashmere-crewneck") || products[5],
    bottom: products.find((p) => p.id === "wide-trouser") || products[10],
    accessory: products.find((p) => p.id === "wool-scarf") || null,
  });

  const { add } = useCart();
  const { formatPrice } = useCurrency();
  const { addPoints } = useRewards();

  const handleSelectItem = (slotKey: keyof OutfitSlots, product: Product) => {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: prev[slotKey]?.id === product.id ? null : product,
    }));
  };

  const handleRandomize = () => {
    const outerItems = products.filter((p) => p.category === "Outerwear");
    const topItems = products.filter(
      (p) => p.category === "Knitwear" || p.category === "Shirts" || p.category === "Tops",
    );
    const bottomItems = products.filter((p) => p.category === "Trousers");
    const accItems = products.filter((p) => p.id.includes("scarf"));

    const getRandom = (arr: Product[]) => arr[Math.floor(Math.random() * arr.length)] || null;

    setSlots({
      outerwear: getRandom(outerItems),
      top: getRandom(topItems.length ? topItems : products),
      bottom: getRandom(bottomItems.length ? bottomItems : products),
      accessory: getRandom(accItems),
    });

    toast.success("Shuffled new Scandinavian capsule outfit!");
  };

  const handleClear = () => {
    setSlots({ outerwear: null, top: null, bottom: null, accessory: null });
    toast.info("Studio canvas cleared.");
  };

  const selectedList = Object.values(slots).filter(Boolean) as Product[];
  const totalPrice = selectedList.reduce((acc, item) => acc + item.price, 0);

  const handleAddOutfitToCart = () => {
    if (selectedList.length === 0) {
      toast.error("Please select at least one garment for your outfit.");
      return;
    }

    selectedList.forEach((item) => {
      const defaultSize = item.sizes[0] || "M";
      add(item.id, defaultSize, 1);
    });

    addPoints(150, "Created Custom Scandinavian Outfit in Wardrobe Studio");
    toast.success(`Added ${selectedList.length} items to cart! Earned 150 Nordic Circle points.`);
  };

  // Get candidates for active category slot
  const activeSlotConfig = CATEGORY_SLOTS.find((s) => s.key === activeCategory)!;
  const catalogCandidates = products.filter((p) => {
    if (activeCategory === "outerwear") return p.category === "Outerwear";
    if (activeCategory === "top")
      return p.category === "Knitwear" || p.category === "Shirts" || p.category === "Tops";
    if (activeCategory === "bottom") return p.category === "Trousers";
    if (activeCategory === "accessory")
      return p.id.includes("scarf") || p.category === "Accessories";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground mb-4">
          <Layers size={13} className="text-clay" />
          Interactive Wardrobe Studio
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-foreground">
          Mix & Match Scandinavian Outfits
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
          Combine tops, trousers, outerwear, and scarves on the studio canvas. Test silhouettes,
          colors, and textures before adding to your wardrobe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Studio Canvas Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="eyebrow flex items-center gap-2">
              <Shirt size={14} className="text-clay" /> Active Canvas Outfit ({selectedList.length}
              /4)
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomize}
                className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1 border border-border rounded-xs"
              >
                <Shuffle size={12} /> Shuffle Look
              </button>
              <button
                onClick={handleClear}
                className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer px-2 py-1 border border-border rounded-xs"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Canvas Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORY_SLOTS.map((slot) => {
              const item = slots[slot.key];
              const isActive = activeCategory === slot.key;

              return (
                <div
                  key={slot.key}
                  onClick={() => setActiveCategory(slot.key)}
                  className={`group relative border rounded-xs p-3 transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "border-primary bg-secondary/40 shadow-xs"
                      : "border-border hover:border-foreground/40 bg-background/50"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                    <span>{slot.catName}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-clay" />}
                  </div>

                  {item ? (
                    <div className="space-y-2">
                      <div className="aspect-3/4 overflow-hidden bg-secondary relative rounded-xs">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItem(slot.key, item);
                          }}
                          className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1 text-foreground transition-colors rounded-xs"
                          aria-label="Remove item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-3/4 border border-dashed border-border rounded-xs flex flex-col items-center justify-center p-4 text-center text-muted-foreground group-hover:border-foreground/40 transition-colors">
                      <Plus size={18} strokeWidth={1.5} className="mb-1 text-clay" />
                      <span className="text-[11px]">Select {slot.catName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Outfit Metrics Banner */}
          <div className="bg-secondary/60 border border-border p-5 rounded-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Outfit Total</span>
                <div className="font-display text-3xl font-light text-foreground mt-0.5">
                  {formatPrice(totalPrice)}
                </div>
              </div>
              <button
                onClick={handleAddOutfitToCart}
                disabled={selectedList.length === 0}
                className="btn-solid text-xs py-3 px-6 flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <ShoppingBag size={14} /> Add Outfit to Cart
              </button>
            </div>

            <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Award size={13} className="text-accent" /> Earn 150 Nordic Circle points on order
              </span>
              <span>Free Eco Shipping Included</span>
            </div>
          </div>
        </div>

        {/* Right: Garment Selector Catalog (5 Cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xs p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-display text-2xl text-foreground">Select Garments</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose an item to pair with your active canvas.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
            {CATEGORY_SLOTS.map((slot) => {
              const isActive = activeCategory === slot.key;
              return (
                <button
                  key={slot.key}
                  onClick={() => setActiveCategory(slot.key)}
                  className={`eyebrow py-1.5 px-3 rounded-xs text-[10px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-secondary/70 text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {slot.catName}
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-1">
            {catalogCandidates.map((product) => {
              const isSelected = slots[activeCategory]?.id === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectItem(activeCategory, product)}
                  className={`border rounded-xs p-3 transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-secondary/60 ring-1 ring-primary"
                      : "border-border hover:border-foreground/40 bg-background/50"
                  }`}
                >
                  <div>
                    <div className="aspect-3/4 overflow-hidden bg-secondary relative mb-2.5 rounded-xs">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground p-1 rounded-full">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-medium text-foreground line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <button
                    className={`mt-2 text-[10px] uppercase tracking-wider py-1 px-2 w-full text-center border rounded-xs transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground/80 group-hover:border-foreground"
                    }`}
                  >
                    {isSelected ? "Selected" : "Add to Outfit"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
