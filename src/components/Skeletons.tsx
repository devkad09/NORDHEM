export function ProductCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-[3/4] w-full skeleton" />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div className="w-2/3 space-y-2">
          <div className="h-4 w-full skeleton rounded-sm" />
          <div className="h-3 w-1/2 skeleton rounded-sm" />
        </div>
        <div className="h-4 w-12 skeleton rounded-sm" />
      </div>
    </div>
  );
}

export function ShopGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[110rem] px-5 py-10 md:px-10 md:py-16">
      <div className="h-4 w-32 skeleton mb-8 rounded-sm" />
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex gap-4">
          <div className="hidden w-20 shrink-0 flex-col gap-3 md:flex">
            <div className="aspect-[3/4] w-full skeleton" />
            <div className="aspect-[3/4] w-full skeleton" />
          </div>
          <div className="aspect-[3/4] flex-1 skeleton" />
        </div>

        <div className="space-y-6">
          <div className="h-3 w-20 skeleton rounded-sm" />
          <div className="h-8 w-3/4 skeleton rounded-sm" />
          <div className="h-5 w-24 skeleton rounded-sm" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full skeleton rounded-sm" />
            <div className="h-4 w-5/6 skeleton rounded-sm" />
            <div className="h-4 w-4/6 skeleton rounded-sm" />
          </div>
          <div className="pt-6 space-y-3">
            <div className="h-4 w-16 skeleton rounded-sm" />
            <div className="flex gap-2">
              <div className="h-10 w-14 skeleton rounded-sm" />
              <div className="h-10 w-14 skeleton rounded-sm" />
              <div className="h-10 w-14 skeleton rounded-sm" />
              <div className="h-10 w-14 skeleton rounded-sm" />
            </div>
          </div>
          <div className="h-12 w-full skeleton rounded-sm pt-6" />
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[110rem] px-5 py-14 md:px-10 md:py-20 animate-pulse">
      <div className="h-4 w-28 skeleton mb-4 rounded-sm" />
      <div className="h-10 w-64 skeleton mb-10 rounded-sm" />
      <ShopGridSkeleton count={4} />
    </div>
  );
}
