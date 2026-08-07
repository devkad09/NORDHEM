import { useState, type FormEvent } from "react";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Thank you. You are on the list — we write rarely.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "max-w-sm" : "mx-auto max-w-md"}>
      <div className="flex items-end gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className="field"
        />
        <button
          type="submit"
          className="eyebrow link-underline whitespace-nowrap pb-2 text-foreground"
        >
          Sign up
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}
