import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  Menu,
  ShoppingBag,
  X,
  Globe,
  Award,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCurrency, type CurrencyCode, CURRENCIES } from "@/lib/currency";
import { useRewards } from "@/lib/rewards";
import { useTheme } from "@/lib/theme";

const primaryLeftLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/wardrobe-studio", label: "Studio" },
  { to: "/about", label: "About" },
] as const;

export function Nav() {
  const { count, toggleCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { currency, setCurrencyCode } = useCurrency();
  const { points } = useRewards();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[110rem] items-center justify-between px-5 md:h-20 md:px-8">
        {/* Left Navigation: Primary Brand Links (Hidden on Mobile) */}
        <div className="flex flex-1 items-center justify-start">
          <button
            className="-ml-1 p-1 md:hidden cursor-pointer"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
          </button>

          <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
            {primaryLeftLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="eyebrow link-underline text-foreground/80 transition-colors hover:text-foreground text-[11px]"
                activeProps={{ className: "text-foreground font-semibold" }}
              >
                {l.label}
              </Link>
            ))}

            <Link
              to="/style-quiz"
              className="eyebrow link-underline text-foreground/80 transition-colors hover:text-foreground text-[11px] hidden xl:inline-block"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              Style Quiz
            </Link>
          </nav>
        </div>

        {/* Center: Brand Logo (Guaranteed Centered with Ample Breathing Room) */}
        <div className="flex flex-shrink-0 items-center justify-center px-4">
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl tracking-[0.45em] text-foreground transition-opacity hover:opacity-80"
          >
            NORDHEM
          </Link>
        </div>

        {/* Right Navigation: Perks, Currency & Cart */}
        <div className="flex flex-1 items-center justify-end gap-2.5 sm:gap-4 md:gap-5">
          {/* Style Quiz for medium screens */}
          <Link
            to="/style-quiz"
            className="eyebrow link-underline text-foreground/80 transition-colors hover:text-foreground text-[11px] hidden lg:inline-block xl:hidden"
          >
            Quiz
          </Link>

          {/* VIP Rewards Club Pill */}
          <Link
            to="/rewards"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary/40 text-xs hover:border-foreground/30 hover:bg-secondary/70 transition-all"
            title="Nordic Circle Rewards"
          >
            <Award size={12} className="text-clay" />
            <span className="font-mono text-[11px] text-foreground font-medium">{points} PTS</span>
          </Link>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3">
            <Globe size={13} className="text-muted-foreground hidden sm:block" />
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

          {/* Theme Mode Switcher (Daylight / Midnight) */}
          <button
            onClick={toggleTheme}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Nordic Daylight" : "Switch to Arctic Midnight"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun size={17} strokeWidth={1.25} className="text-amber-400" />
            ) : (
              <Moon size={17} strokeWidth={1.25} />
            )}
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 p-1 transition-opacity hover:opacity-60 cursor-pointer"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart
              size={18}
              strokeWidth={1.25}
              className={wishlistCount > 0 ? "fill-foreground text-foreground" : ""}
            />
            {wishlistCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag / Cart */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-1.5 p-1 transition-opacity hover:opacity-60 cursor-pointer"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.25} />
            {count > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-foreground font-medium">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {open && (
        <div className="border-t border-border bg-background px-6 py-6 md:hidden animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-clay mb-2">COLLECTIONS</p>
              <div className="flex flex-col space-y-3">
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="text-base font-light text-foreground hover:text-clay transition-colors"
                >
                  Shop All Pieces
                </Link>
                <Link
                  to="/lookbook"
                  onClick={() => setOpen(false)}
                  className="text-base font-light text-foreground hover:text-clay transition-colors"
                >
                  Seasonal Lookbook
                </Link>
                <Link
                  to="/wardrobe-studio"
                  onClick={() => setOpen(false)}
                  className="text-base font-light text-foreground hover:text-clay transition-colors"
                >
                  Wardrobe Studio
                </Link>
                <Link
                  to="/style-quiz"
                  onClick={() => setOpen(false)}
                  className="text-base font-light text-foreground hover:text-clay transition-colors"
                >
                  Style Quiz Matcher
                </Link>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="eyebrow text-clay mb-2">THE HOUSE</p>
              <div className="flex flex-col space-y-3">
                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className="text-sm font-light text-foreground hover:text-clay transition-colors"
                >
                  About Nordhem
                </Link>
                <Link
                  to="/sustainability"
                  onClick={() => setOpen(false)}
                  className="text-sm font-light text-foreground hover:text-clay transition-colors"
                >
                  Traceability & Eco Pledges
                </Link>
                <Link
                  to="/rewards"
                  onClick={() => setOpen(false)}
                  className="text-sm font-light text-foreground hover:text-clay transition-colors flex items-center justify-between"
                >
                  <span>VIP Rewards Club</span>
                  <span className="font-mono text-xs text-clay">{points} PTS</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
