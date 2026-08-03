import { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
};

const DEFAULT_REVIEWS: Record<string, Review[]> = {
  "halland-wool-coat": [
    {
      id: "r1",
      productId: "halland-wool-coat",
      author: "Freja Lindqvist",
      rating: 5,
      date: "3 weeks ago",
      title: "An absolute masterpiece of a coat",
      comment:
        "The undyed Gotland wool has such a rich, tactile weight. Worn it through Stockholm winter sea breezes and stayed remarkably warm without needing a heavy synthetic down layer.",
      verified: true,
    },
    {
      id: "r2",
      productId: "halland-wool-coat",
      author: "Marcus V.",
      rating: 5,
      date: "1 month ago",
      title: "Quiet elegance",
      comment:
        "Impeccable shoulder drape and generous patch pockets. You can tell this was cut by master tailors.",
      verified: true,
    },
  ],
  "kust-waxed-field-jacket": [
    {
      id: "r3",
      productId: "kust-waxed-field-jacket",
      author: "Erik N.",
      rating: 5,
      date: "2 weeks ago",
      title: "Rugged yet remarkably refined",
      comment:
        "The waxed cotton is supple right out of the box and the flannel lining makes morning walks along the Gothenburg coast an absolute joy.",
      verified: true,
    },
  ],
};

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const storageKey = `nordhem.reviews.${productId}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews(DEFAULT_REVIEWS[productId] || [
          {
            id: "d1",
            productId,
            author: "Astrid K.",
            rating: 5,
            date: "1 month ago",
            title: "Sublime quality & material",
            comment:
              "Exceptional stitching and fabric drape. Feels like an heirloom garment built to last decades.",
            verified: true,
          },
        ]);
      }
    } catch {
      /* fallback */
    }
  }, [productId, storageKey]);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      toast.error("Please fill in your name and review comment.");
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      author: author.trim(),
      rating,
      date: "Just now",
      title: title.trim() || "Verified Review",
      comment: comment.trim(),
      verified: true,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    toast.success("Thank you! Your review has been published.");
    setShowModal(false);
    setAuthor("");
    setTitle("");
    setComment("");
  }

  const total = reviews.length;
  const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : "5.0";

  return (
    <div className="mt-20 border-t border-border pt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div>
          <p className="eyebrow">Feedback & Reviews</p>
          <h2 className="font-display text-3xl">Customer Experiences</h2>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(Number(avgRating)) ? "fill-amber-500 text-amber-500" : "text-border"}
                />
              ))}
            </div>
            <span className="text-sm font-medium tabular-nums">{avgRating} out of 5</span>
            <span className="text-xs text-muted-foreground">({total} {total === 1 ? "review" : "reviews"})</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-outline inline-flex items-center gap-2 text-xs uppercase tracking-widest py-3 px-6"
        >
          <MessageSquarePlus size={14} /> Write a Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-6 divide-y divide-border">
        {reviews.map((r) => (
          <div key={r.id} className="pt-6 first:pt-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={star <= r.rating ? "fill-amber-500 text-amber-500" : "text-border"}
                    />
                  ))}
                </div>
                <span className="font-medium text-sm">{r.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>

            <div className="flex items-center gap-1.5 pt-1 text-[0.7rem] text-muted-foreground">
              <span className="font-medium text-foreground">{r.author}</span>
              {r.verified && (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 size={11} /> Verified Buyer
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-up">
          <div className="relative w-full max-w-lg border border-border bg-card p-6 md:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div>
              <p className="eyebrow">Review Form</p>
              <h3 className="font-display text-2xl">Write a Customer Review</h3>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star size={20} className={s <= rating ? "fill-amber-500" : "text-border"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Astrid K."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full border border-border bg-background py-2 px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional fit and warmth"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-border bg-background py-2 px-3 text-xs focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow text-[0.65rem] block mb-1">Review Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about the fabric, cut, and fit..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-border bg-background py-2 px-3 text-xs focus:border-foreground focus:outline-none resize-none"
                />
              </div>

              <button type="submit" className="btn-solid w-full py-3 text-xs uppercase tracking-widest">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
