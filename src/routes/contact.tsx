import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Nordhem" },
      {
        name: "description",
        content:
          "Questions about sizing, orders or repairs? Write to the Nordhem studio in Copenhagen — we answer within two working days.",
      },
      { property: "og:title", content: "Contact — Nordhem" },
      { property: "og:description", content: "Write to the Nordhem studio in Copenhagen." },
    ],
  }),
  component: Contact,
});

type Errors = { name?: string; email?: string; message?: string };

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "A little more detail, please.";
    return next;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  return (
    <div className="mx-auto grid max-w-[110rem] gap-14 px-5 py-14 md:grid-cols-2 md:px-10 md:py-24">
      <div className="max-w-md">
        <p className="eyebrow">Get in touch</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Contact</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Sizing, orders, repairs, or something else entirely. We read everything and answer within
          two working days.
        </p>
        <dl className="mt-10 space-y-6 text-sm">
          <div>
            <dt className="eyebrow">Studio</dt>
            <dd className="mt-2 text-muted-foreground">Ravnsborggade 14, 2200 Copenhagen N</dd>
          </div>
          <div>
            <dt className="eyebrow">Email</dt>
            <dd className="mt-2 text-muted-foreground">studio@nordhem.example</dd>
          </div>
          <div>
            <dt className="eyebrow">Hours</dt>
            <dd className="mt-2 text-muted-foreground">Monday to Friday, 09—17 CET</dd>
          </div>
        </dl>
      </div>

      <div className="md:pt-16">
        {sent ? (
          <div className="border border-border p-10">
            <h2 className="font-display text-2xl">Message received</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Thank you, {form.name.trim()}. We will write back to {form.email} shortly.
            </p>
            <button
              onClick={() => {
                setForm({ name: "", email: "", message: "" });
                setSent(false);
              }}
              className="eyebrow link-underline mt-8 text-foreground"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="max-w-md space-y-8">
            <div>
              <label htmlFor="name" className="eyebrow">
                Name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field mt-2"
                placeholder="Your name"
              />
              {errors.name && <p className="mt-2 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="eyebrow">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field mt-2"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-2 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="eyebrow">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="field mt-2 resize-none"
                placeholder="How can we help?"
              />
              {errors.message && <p className="mt-2 text-xs text-destructive">{errors.message}</p>}
            </div>

            <button type="submit" className="btn-solid w-full">
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
