export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: "FOOTER_FORM" | "POPUP_MODAL" | "VIP_REWARDS" | "CHECKOUT";
  joinedAt: string;
  vipTier?: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
}

const SUBSCRIBERS_STORAGE_KEY = "nordhem_subscribers_v2";

const DEFAULT_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: "sub-1",
    email: "elena.vane@copenhagen-design.dk",
    source: "VIP_REWARDS",
    joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    vipTier: "Silver Member",
    status: "ACTIVE",
  },
  {
    id: "sub-2",
    email: "clara.j@stockholm-arch.se",
    source: "FOOTER_FORM",
    joinedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    vipTier: "Bronze Member",
    status: "ACTIVE",
  },
  {
    id: "sub-3",
    email: "johan.lind@oslo-textile.no",
    source: "CHECKOUT",
    joinedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    vipTier: "Gold Member",
    status: "ACTIVE",
  },
  {
    id: "sub-4",
    email: "sophia.h@helsinki-studio.fi",
    source: "POPUP_MODAL",
    joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    vipTier: "Bronze Member",
    status: "ACTIVE",
  },
];

export function getStoredSubscribers(): NewsletterSubscriber[] {
  if (typeof window === "undefined") return DEFAULT_SUBSCRIBERS;
  try {
    const data = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIBERS));
      return DEFAULT_SUBSCRIBERS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SUBSCRIBERS;
  }
}

export function saveStoredSubscribers(subs: NewsletterSubscriber[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subs));
  window.dispatchEvent(new CustomEvent("nordhem_subscribers_sync"));
}

export function addSubscriber(
  email: string,
  source: NewsletterSubscriber["source"] = "FOOTER_FORM",
): { success: boolean; isNew: boolean } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return { success: false, isNew: false };

  const current = getStoredSubscribers();
  const existing = current.find((s) => s.email.toLowerCase() === cleanEmail);

  if (existing) {
    return { success: true, isNew: false };
  }

  const newSub: NewsletterSubscriber = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    email: cleanEmail,
    source,
    joinedAt: new Date().toISOString(),
    vipTier: "Bronze Member",
    status: "ACTIVE",
  };

  saveStoredSubscribers([newSub, ...current]);
  return { success: true, isNew: true };
}

export function deleteSubscriber(id: string) {
  const current = getStoredSubscribers();
  saveStoredSubscribers(current.filter((s) => s.id !== id));
}

export function exportSubscribersToCSV(): string {
  const subs = getStoredSubscribers();
  const headers = ["ID", "Email", "Source", "VIP Tier", "Status", "Joined Date"];
  const rows = subs.map((s) => [
    s.id,
    s.email,
    s.source,
    s.vipTier || "Bronze",
    s.status,
    new Date(s.joinedAt).toLocaleDateString(),
  ]);

  return [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
}
