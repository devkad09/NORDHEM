export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1 - 5
  fitRating: "RUNS_SMALL" | "TRUE_TO_SIZE" | "RUNS_LARGE";
  headline: string;
  comment: string;
  verifiedBuyer: boolean;
  createdAt: string;
  approved: boolean;
}

const REVIEWS_STORAGE_KEY = "nordhem_product_reviews_v2";

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "rev-1",
    productId: "linen-shirt",
    authorName: "Astrid Lindberg",
    rating: 5,
    fitRating: "TRUE_TO_SIZE",
    headline: "Unmatched fabric weight and airy drape",
    comment:
      "The washed Baltic linen feels substantial yet breathable. It softens gorgeously after the first gentle cold wash. Essential summer staple.",
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    approved: true,
  },
  {
    id: "rev-2",
    productId: "coat",
    authorName: "Magnus E.",
    rating: 5,
    fitRating: "TRUE_TO_SIZE",
    headline: "The ultimate minimalist winter investment",
    comment:
      "Undyed Gotland wool has incredible natural weather resistance. The horn buttons and clean horn cuffs elevate every outfit effortlessly.",
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    approved: true,
  },
  {
    id: "rev-3",
    productId: "turtleneck",
    authorName: "Freja K.",
    rating: 5,
    fitRating: "RUNS_LARGE",
    headline: "Dense, non-scratchy ribbed merino",
    comment:
      "Substantial ribbed collar that holds its structure all day without constricting. Sits slightly relaxed on the shoulders.",
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    approved: true,
  },
  {
    id: "rev-4",
    productId: "wide-trouser",
    authorName: "Henrik S.",
    rating: 4,
    fitRating: "TRUE_TO_SIZE",
    headline: "Tailored drape with architectural volume",
    comment:
      "High rise and clean front pleats. Looks exceptional with both low profile sneakers and structured derby shoes.",
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    approved: true,
  },
];

export function getStoredReviews(): ProductReview[] {
  if (typeof window === "undefined") return DEFAULT_REVIEWS;
  try {
    const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_REVIEWS;
  }
}

export function saveStoredReviews(reviews: ProductReview[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new CustomEvent("nordhem_reviews_sync"));
}

export function getProductReviews(productId: string): ProductReview[] {
  const all = getStoredReviews();
  return all.filter((r) => r.productId === productId && r.approved);
}

export function addProductReview(review: Omit<ProductReview, "id" | "createdAt" | "approved">) {
  const all = getStoredReviews();
  const newReview: ProductReview = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    approved: true, // auto-approve in atelier demo
  };
  const updated = [newReview, ...all];
  saveStoredReviews(updated);
  return newReview;
}

export function deleteProductReview(reviewId: string) {
  const all = getStoredReviews();
  const updated = all.filter((r) => r.id !== reviewId);
  saveStoredReviews(updated);
}

export function toggleReviewApproval(reviewId: string) {
  const all = getStoredReviews();
  const updated = all.map((r) => (r.id === reviewId ? { ...r, approved: !r.approved } : r));
  saveStoredReviews(updated);
}
