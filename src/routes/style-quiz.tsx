import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Check,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Award,
} from "lucide-react";
import { products, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useRewards } from "@/lib/rewards";
import { toast } from "sonner";

export const Route = createFileRoute("/style-quiz")({
  head: () => ({
    meta: [
      { title: "Personal Style Quiz & Capsule Recommender — Nordhem" },
      {
        name: "description",
        content:
          "Discover your tailored Scandinavian capsule wardrobe based on your aesthetic, climate, and fit preferences.",
      },
      { property: "og:title", content: "Style Quiz — Nordhem" },
    ],
  }),
  component: StyleQuiz,
});

type QuizState = {
  aesthetic: string;
  fit: string;
  season: string;
};

const QUESTIONS = [
  {
    id: "aesthetic",
    title: "Select your core Scandinavian aesthetic",
    subtitle: "How do you prefer your personal style to feel day-to-day?",
    options: [
      {
        value: "minimalist",
        title: "Nordic Minimalist",
        desc: "Clean lines, natural raw textures, understated monochrome neutrals.",
        color: "bg-stone-200/50",
      },
      {
        value: "tailored",
        title: "Monochrome Tailoring",
        desc: "Structured wool coats, crisp poplin shirts, dark charcoal trousers.",
        color: "bg-slate-200/50",
      },
      {
        value: "hygge",
        title: "Scandinavian Hygge",
        desc: "Ultra-soft cashmere, thick merino knits, shearling accents.",
        color: "bg-amber-100/50",
      },
      {
        value: "coastal",
        title: "Coastal Earth Tones",
        desc: "Washed linen, oat-toned cardigans, warm clay details.",
        color: "bg-yellow-100/40",
      },
    ],
  },
  {
    id: "fit",
    title: "Preferred Silhouette & Fit",
    subtitle: "How should your clothes drape and move with you?",
    options: [
      {
        value: "relaxed",
        title: "Relaxed & Generous",
        desc: "Roomy proportions allowing effortless natural movement and layering.",
      },
      {
        value: "structured",
        title: "Tailored & Defined",
        desc: "Crisp shoulders, clean hems, and intentional structural drape.",
      },
      {
        value: "versatile",
        title: "Fluid & Balanced",
        desc: "A harmonious balance of unstructured tops with neat trousers.",
      },
    ],
  },
  {
    id: "season",
    title: "Primary Environment & Layering Need",
    subtitle: "Where will this capsule wardrobe take you?",
    options: [
      {
        value: "winter",
        title: "Nordic Winter Layering",
        desc: "Heavy wool coats, thick knits, wind-resistant outerwear.",
      },
      {
        value: "spring",
        title: "Mild Spring & Summer Lightness",
        desc: "Breathable linen, light tees, relaxed cotton poplin.",
      },
      {
        value: "allseason",
        title: "All-Season Core Capsule",
        desc: "Modular year-round basics easily layered up or down.",
      },
    ],
  },
];

function StyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizState>({
    aesthetic: "",
    fit: "",
    season: "",
  });
  const [resultCapsule, setResultCapsule] = useState<Product[] | null>(null);

  const { add } = useCart();
  const { formatPrice } = useCurrency();
  const { addPoints } = useRewards();

  const handleSelectOption = (key: keyof QuizState, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      calculateCapsule();
    }
  };

  const calculateCapsule = () => {
    // Select 3 items: 1 Outerwear/Coat/Jacket, 1 Knit/Shirt, 1 Trouser
    let outerwear = products.find((p) => p.category === "Outerwear" && p.id.includes("coat"));
    if (answers.aesthetic === "hygge") {
      outerwear = products.find((p) => p.id.includes("shearling")) || outerwear;
    } else if (answers.aesthetic === "tailored") {
      outerwear = products.find((p) => p.id.includes("coat")) || outerwear;
    } else if (answers.season === "spring") {
      outerwear = products.find((p) => p.id.includes("quilted")) || outerwear;
    }

    let top = products.find((p) => p.category === "Knitwear");
    if (answers.aesthetic === "coastal" || answers.season === "spring") {
      top = products.find((p) => p.id.includes("linen-shirt")) || top;
    } else if (answers.aesthetic === "hygge") {
      top = products.find((p) => p.id.includes("cashmere")) || top;
    } else if (answers.aesthetic === "tailored") {
      top = products.find((p) => p.id.includes("turtleneck")) || top;
    }

    let bottom = products.find((p) => p.category === "Trousers");
    if (answers.fit === "structured" || answers.aesthetic === "tailored") {
      bottom = products.find((p) => p.id.includes("tapered")) || bottom;
    } else {
      bottom = products.find((p) => p.id.includes("wide")) || bottom;
    }

    const selected = [outerwear, top, bottom].filter(Boolean) as Product[];
    setResultCapsule(selected);
    addPoints(200, "Completed Nordhem Personal Style Quiz");
    toast.success("Capsule Wardrobe Calculated! Earned 200 Nordic Circle Points.");
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({ aesthetic: "", fit: "", season: "" });
    setResultCapsule(null);
  };

  const addCapsuleToCart = () => {
    if (!resultCapsule) return;
    resultCapsule.forEach((item) => {
      const defaultSize = item.sizes[0] || "M";
      add(item.id, defaultSize, 1);
    });
    toast.success(
      `Added ${resultCapsule.length} capsule pieces to your cart with bundle discount!`,
    );
  };

  const currentQ = QUESTIONS[step];
  const currentAnswerKey = currentQ.id as keyof QuizState;
  const isCurrentSelected = Boolean(answers[currentAnswerKey]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground mb-4">
          <Sparkles size={13} className="text-accent" />
          Nordic Capsule Matcher
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-foreground">
          Find Your Nordhem Capsule
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
          Answer 3 brief questions about your daily aesthetic and climate preferences to receive a
          tailored 3-piece Scandinavian wardrobe.
        </p>
      </div>

      {!resultCapsule ? (
        <div className="mt-12 mx-auto max-w-2xl bg-card border border-border rounded-xs p-6 md:p-10 shadow-xs">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}% Completed</span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-clay transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          <h2 className="font-display text-2xl text-foreground font-normal">{currentQ.title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6">{currentQ.subtitle}</p>

          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentAnswerKey] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(currentAnswerKey, opt.value)}
                  className={`w-full text-left p-4 rounded-xs border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? "border-primary bg-secondary/60 shadow-xs"
                      : "border-border hover:border-foreground/40 bg-background/50"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{opt.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
            <button
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
              className="btn-outline py-2 px-4 text-xs disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowLeft size={14} className="mr-2" /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isCurrentSelected}
              className="btn-solid py-2.5 px-6 text-xs cursor-pointer"
            >
              {step === QUESTIONS.length - 1 ? (
                <>
                  Generate My Capsule <Sparkles size={14} className="ml-2" />
                </>
              ) : (
                <>
                  Next Step <ArrowRight size={14} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-10 animate-fade-up">
          <div className="bg-card border border-border rounded-xs p-6 md:p-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs text-accent font-medium uppercase tracking-widest mb-2">
              <Award size={14} /> Nordic Circle Member Bonus
            </div>
            <h2 className="font-display text-3xl text-foreground">Your Tailored Nordic Capsule</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Curated specifically for your {answers.aesthetic} preference and {answers.season}{" "}
              needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resultCapsule.map((product) => (
              <div
                key={product.id}
                className="group border border-border bg-card p-4 rounded-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-3/4 overflow-hidden bg-secondary relative mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-xs px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground border border-border">
                      {product.category}
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-foreground">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <Link
                    to="/product/$productId"
                    params={{ productId: product.id }}
                    className="text-xs underline text-foreground/70 hover:text-foreground"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary/40 border border-border rounded-xs p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
            <div>
              <span className="eyebrow">Capsule Total (3 Pieces)</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display text-3xl font-light text-foreground">
                  {formatPrice(resultCapsule.reduce((acc, p) => acc + p.price, 0) * 0.9)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(resultCapsule.reduce((acc, p) => acc + p.price, 0))}
                </span>
                <span className="text-xs bg-clay/20 text-clay px-2 py-0.5 font-medium border border-clay/30">
                  10% Bundle Savings
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Includes complimentary zero-emission eco shipping.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={resetQuiz}
                className="btn-outline text-xs py-3 px-5 flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Retake Quiz
              </button>
              <button
                onClick={addCapsuleToCart}
                className="btn-solid text-xs py-3 px-6 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={14} /> Add Capsule to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
