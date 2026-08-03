import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { categories, products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Nordhem" },
      {
        name: "description",
        content:
          "Browse the full Nordhem collection: wool outerwear, merino and alpaca knitwear, washed linen shirting and quiet trousers. Filter by category and price.",
      },
      { property: "og:title", content: "Shop All — Nordhem" },
      {
        property: "og:description",
        content: "The full Nordhem collection of elevated basics in natural fibres.",
      },
    ],
  }),
  component: Shop,
});

type Sort = "featured" | "price-asc" | "price-desc";

function Shop() {
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, sort, searchQuery]);

  return (
    <div className="mx-auto max-w-[110rem] px-5 py-14 md:px-10 md:py-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">The collection</p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">Shop all</h1>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name..."
            className="w-full border-b border-border bg-transparent py-2 pl-9 pr-8 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-5 border-y border-border py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`eyebrow transition-colors ${
                category === c ? "text-foreground" : "hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-xs">
          <span className="eyebrow">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border-b border-border bg-transparent py-1 text-xs focus:border-clay focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear search
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="my-20 text-center">
          <p className="font-display text-xl text-foreground">No pieces match your search</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try searching for something else or clear filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setCategory("All");
            }}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

