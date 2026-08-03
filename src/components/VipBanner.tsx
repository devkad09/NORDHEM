import { useState } from "react";
import { Sparkles, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function VipBanner() {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!open) return null;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success("Welcome to Nordhem Atelier Circle! Check your email for VIP benefits.");
  }

  return (
    <div className="border-y border-border bg-card py-6 px-5 relative overflow-hidden">
      <button
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
        aria-label="Dismiss VIP banner"
      >
        <X size={16} />
      </button>

      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <p className="eyebrow flex items-center justify-center md:justify-start gap-1.5 text-amber-700 font-semibold">
            <Sparkles size={13} /> Nordhem Atelier Circle
          </p>
          <h3 className="font-display text-xl md:text-2xl">Exclusive Small-Batch Access & Atelier Perks</h3>
          <p className="text-xs text-muted-foreground max-w-lg">
            Join 4,200+ members for 24-hour early drop access, complimentary express shipping, and annual repair credits.
          </p>
        </div>

        {!subscribed ? (
          <form onSubmit={handleJoin} className="flex gap-2 w-full max-w-sm">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-background py-2.5 px-3 text-xs focus:border-foreground focus:outline-none"
            />
            <button type="submit" className="btn-solid px-5 text-xs uppercase tracking-widest flex-shrink-0">
              Join Circle
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-emerald-700 font-medium text-xs bg-emerald-50 border border-emerald-200 px-4 py-2 rounded">
            <CheckCircle2 size={16} /> You are enrolled in Nordhem Circle!
          </div>
        )}
      </div>
    </div>
  );
}
