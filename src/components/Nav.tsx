import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/wishlist", label: "Wishlist" },
] as const;

export function Nav() {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[110rem] items-center justify-between px-5 md:h-20 md:px-10">
        <button
          className="-ml-1 p-1 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} strokeWidth={1.25} /> : <Menu size={18} strokeWidth={1.25} />}
        </button>

        <nav className="hidden flex-1 items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="eyebrow link-underline text-foreground/70 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          className="font-display text-xl tracking-[0.42em] md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          NORDHEM
        </Link>

        <div className="flex flex-1 items-center justify-end gap-5">
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 p-1 transition-opacity hover:opacity-60"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart size={18} strokeWidth={1.25} className={wishlistCount > 0 ? "fill-foreground text-foreground" : ""} />
            <span className="text-xs tabular-nums">{wishlistCount}</span>
          </Link>

          <Link
            to="/cart"
            className="flex items-center gap-1.5 p-1 transition-opacity hover:opacity-60"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.25} />
            <span className="text-xs tabular-nums">{count}</span>
          </Link>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-border px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="eyebrow py-3 text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
