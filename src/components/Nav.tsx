import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu, ShoppingBag, X, Globe, Sparkles, Award } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency, type CurrencyCode, CURRENCIES } from "@/lib/currency";
import { useRewards } from "@/lib/rewards";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/wardrobe-studio", label: "Studio" },
  { to: "/style-quiz", label: "Style Quiz" },
  { to: "/rewards", label: "VIP Club" },
  { to: "/sustainability", label: "Traceability" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/about", label: "About" },
] as const;

export function Nav() {
  const { count, toggleCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { currency, setCurrencyCode } = useCurrency();
  const { points, tier } = useRewards();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[110rem] items-center justify-between px-5 md:h-20 md:px-8">
        <button
          className="-ml-1 p-1 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} strokeWidth={1.25} /> : <Menu size={18} strokeWidth={1.25} />}
        </button>

        <nav className="hidden flex-1 items-center gap-6 xl:gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="eyebrow link-underline text-foreground/70 transition-colors hover:text-foreground text-[11px]"
              activeProps={{ className: "text-foreground font-semibold" }}
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

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-5">
          {/* Rewards Badge */}
          <Link
            to="/rewards"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-xs hover:border-foreground/40 transition-colors"
          >
            <Award size={13} className="text-clay" />
            <span className="font-mono text-[11px] text-foreground">{points} PTS</span>
          </Link>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 border-r border-border pr-2 md:pr-3">
            <Globe size={14} className="text-muted-foreground hidden sm:block" />
            <select
              value={currency.code}
              onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
              aria-label="Select currency"
              className="border-b border-transparent bg-transparent py-0.5 text-xs text-foreground/80 transition-colors hover:border-foreground focus:border-foreground focus:outline-none cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-card text-foreground">
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 p-1 transition-opacity hover:opacity-60"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart
              size={18}
              strokeWidth={1.25}
              className={wishlistCount > 0 ? "fill-foreground text-foreground" : ""}
            />
            <span className="text-xs tabular-nums">{wishlistCount}</span>
          </Link>

          <button
            onClick={toggleCart}
            className="flex items-center gap-1.5 p-1 transition-opacity hover:opacity-60 cursor-pointer"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.25} />
            <span className="text-xs tabular-nums">{count}</span>
          </button>
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
