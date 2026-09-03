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
import { ThemeProvider } from "@/lib/theme";
import { ProductsStoreProvider } from "@/lib/products-store";
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
        <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
        <h2 className="mt-4 text-xl font-light text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-solid py-2.5 px-6 text-xs">
            Return to Scandinavian Storefront
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
        <h1 className="text-xl font-light tracking-tight text-foreground font-display">
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
            className="btn-solid py-2 px-4 text-xs cursor-pointer"
          >
            Try again
          </button>
          <a href="/" className="btn-outline py-2 px-4 text-xs cursor-pointer">
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
  if (typeof document !== "undefined") {
    return <>{children}</>;
  }
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
      <ThemeProvider>
        <ProductsStoreProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <CompareProvider>
                  <RewardsProvider>
                    <CartProvider>
                      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
                        <Nav />
                        <main className="flex-1">
                          <div key={location.pathname} className="page-transition">
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
        </ProductsStoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
