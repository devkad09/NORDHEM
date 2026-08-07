import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";
import { Newsletter } from "@/components/Newsletter";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-[110rem] gap-12 px-5 py-16 md:grid-cols-4 md:px-10">
        <div>
          <p className="font-display text-lg tracking-[0.42em]">NORDHEM</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Elevated basics, made slowly in small runs. Copenhagen and Porto.
          </p>
        </div>

        <div>
          <p className="eyebrow">Interactive Studio</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/wardrobe-studio" className="link-underline text-foreground/90 font-medium">
                Wardrobe Studio
              </Link>
            </li>
            <li>
              <Link to="/style-quiz" className="link-underline">
                Style Quiz Matcher
              </Link>
            </li>
            <li>
              <Link to="/rewards" className="link-underline">
                Nordic Circle VIP
              </Link>
            </li>
            <li>
              <Link to="/sustainability" className="link-underline">
                Eco Traceability
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">House</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="link-underline">
                All pieces
              </Link>
            </li>
            <li>
              <Link to="/lookbook" className="link-underline">
                Lookbook
              </Link>
            </li>
            <li>
              <Link to="/about" className="link-underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="link-underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="link-underline">
                Track Order
              </Link>
            </li>
          </ul>
          <div className="mt-6 flex gap-4 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="transition-colors hover:text-foreground">
              <Instagram size={17} strokeWidth={1.25} />
            </a>
            <a href="#" aria-label="YouTube" className="transition-colors hover:text-foreground">
              <Youtube size={17} strokeWidth={1.25} />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Letters</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Occasional notes on new pieces and the people who make them.
          </p>
          <div className="mt-4">
            <Newsletter compact />
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[110rem] flex-col gap-2 px-5 py-6 text-xs text-muted-foreground md:flex-row md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Nordhem. All rights reserved.</p>
          <p>A fictional label, built as a demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
