import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { CurrencyProvider } from "@/lib/currency";
import { RecentlyViewedProvider } from "@/lib/recently-viewed";
import { CompareProvider } from "@/lib/compare";
import { RewardsProvider } from "@/lib/rewards";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageLoadingSkeleton } from "@/components/Skeletons";
import { MiniCartDrawer } from "@/components/MiniCartDrawer";
import { CompareDrawer } from "@/components/CompareDrawer";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nordhem — Elevated Basics, Quietly Made" },
      {
        name: "description",
        content:
          "Nordhem is a minimalist Scandinavian label making elevated basics in small runs: wool outerwear, merino knitwear, washed linen and quiet tailoring.",
      },
      { name: "author", content: "Nordhem" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@200;300;400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: PageLoadingSkeleton,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CompareProvider>
              <RewardsProvider>
                <CartProvider>
                  <div className="flex min-h-screen flex-col">
                    <Nav />
                    <main className="flex-1">
                      <div key={location.pathname} className="page-transition">
                        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                        <Outlet />
                      </div>
                    </main>
                    <Footer />
                  </div>
                  <MiniCartDrawer />
                  <CompareDrawer />
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      className: "font-sans text-xs bg-card text-foreground border-border",
                    }}
                  />
                </CartProvider>
              </RewardsProvider>
            </CompareProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
