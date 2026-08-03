import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Nordhem" },
      { name: "description", content: "View and manage your saved Nordhem pieces." },
      { property: "og:title", content: "Your Wishlist — Nordhem" },
      { property: "og:description", content: "View your saved Nordhem pieces." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlistProducts, count, clear } = useWishlist();

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <p className="eyebrow">Favorites</p>
        <h1 className="mt-4 font-display text-3xl md:text-4xl">Your wishlist is empty</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Save pieces you love by clicking the heart icon on any product to revisit them here anytime.
        </p>
        <Link to="/shop" className="btn-outline mt-8 inline-block">
          Explore collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[110rem] px-5 py-14 md:px-10 md:py-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Saved pieces</p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">Wishlist</h1>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? "piece" : "pieces"} saved
          </p>
          <button
            onClick={clear}
            className="eyebrow link-underline text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4 border-t border-border pt-10">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
