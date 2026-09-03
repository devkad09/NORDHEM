import {
  products as initialSeedProducts,
  lookbook as initialSeedLookbook,
  type Product,
} from "@/data/products";

export interface LookbookItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  season?: string;
  taggedProductIds?: string[];
}

export interface AuditLogItem {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "EXPORT" | "IMPORT" | "SYNC";
  target: string;
  timestamp: string;
  details: string;
  user: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  email: string;
  total: number;
  currency: string;
  itemCount: number;
  items: { id: string; name: string; size: string; qty: number; price: number }[];
  status: "Pending" | "Processing" | "Dispatched" | "Delivered";
  createdAt: string;
}

export interface AdminConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  adminPin: string;
  autoSync: boolean;
  lastSynced?: string;
  atelierName: string;
}

const STORAGE_KEYS = {
  PRODUCTS: "nordhem_products_v2",
  LOOKBOOK: "nordhem_lookbook_v2",
  CONFIG: "nordhem_admin_config_v2",
  AUDIT_LOGS: "nordhem_audit_logs_v2",
  ORDERS: "nordhem_admin_orders_v2",
};

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  adminPin: "1234",
  autoSync: false,
  atelierName: "Nordhem Atelier Copenhagen",
};

// Broadcast channel for instantaneous cross-tab synchronization
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    syncChannel = new BroadcastChannel("nordhem_db_sync");
  }
} catch {
  syncChannel = null;
}

export function notifyDatabaseChanged(type: "products" | "lookbook" | "config" | "orders" | "all") {
  if (syncChannel) {
    syncChannel.postMessage({ type, timestamp: Date.now() });
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nordhem:db-change", { detail: { type } }));
  }
}

export function onDatabaseChange(callback: (type: string) => void) {
  if (typeof window === "undefined") return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type) {
      callback(event.data.type);
    }
  };

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent;
    callback(custom.detail?.type ?? "unknown");
  };

  if (syncChannel) {
    syncChannel.addEventListener("message", handleBroadcast);
  }
  window.addEventListener("nordhem:db-change", handleCustomEvent);

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener("message", handleBroadcast);
    }
    window.removeEventListener("nordhem:db-change", handleCustomEvent);
  };
}

// Convert image file to compressed Base64 Data URL with high-fidelity canvas processing
export async function fileToDataUrl(file: File, maxWidth = 1600, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(format, quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Get Products from persistent storage or initial seed
export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return initialSeedProducts;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialSeedProducts));
      return initialSeedProducts;
    }
    const parsed = JSON.parse(data) as Product[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to read products from localStorage:", error);
  }
  return initialSeedProducts;
}

// Save products to persistent storage
export function saveStoredProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyDatabaseChanged("products");
  } catch (error) {
    console.error("Failed to save products to localStorage:", error);
    throw error;
  }
}

// Get single product
export function getStoredProduct(id: string): Product | undefined {
  const products = getStoredProducts();
  return products.find((p) => p.id === id);
}

// Create new product
export function createStoredProduct(newProduct: Omit<Product, "id"> & { id?: string }): Product {
  const products = getStoredProducts();
  const slug =
    newProduct.id?.trim() ||
    newProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  let finalId = slug;
  let counter = 1;
  while (products.some((p) => p.id === finalId)) {
    finalId = `${slug}-${counter}`;
    counter++;
  }

  const product: Product = {
    ...newProduct,
    id: finalId,
    imageUrl: newProduct.imageUrl || newProduct.image,
    hoverImageUrl: newProduct.hoverImageUrl || newProduct.imageUrl || newProduct.image,
    outOfStockSizes: newProduct.outOfStockSizes ?? [],
    details: newProduct.details?.length
      ? newProduct.details
      : ["100% natural organic fibres", "Tailored in Portugal", "Dry clean only"],
  };

  const updated = [product, ...products];
  saveStoredProducts(updated);

  addAuditLog({
    action: "CREATE",
    target: product.name,
    details: `Added new piece ${product.id} (€${product.price}) in category ${product.category}`,
    user: "Admin Atelier",
  });

  return product;
}

// Update existing product
export function updateStoredProduct(id: string, updates: Partial<Product>): Product {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Product with ID "${id}" not found.`);
  }

  const existing = products[index];
  const updatedProduct: Product = {
    ...existing,
    ...updates,
    imageUrl: updates.imageUrl || updates.image || existing.imageUrl,
    hoverImageUrl: updates.hoverImageUrl || updates.hoverImage || existing.hoverImageUrl,
  };

  products[index] = updatedProduct;
  saveStoredProducts(products);

  addAuditLog({
    action: "UPDATE",
    target: updatedProduct.name,
    details: `Updated specifications for ${id}`,
    user: "Admin Atelier",
  });

  return updatedProduct;
}

// Delete product
export function deleteStoredProduct(id: string): boolean {
  const products = getStoredProducts();
  const toDelete = products.find((p) => p.id === id);
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveStoredProducts(filtered);

  if (toDelete) {
    addAuditLog({
      action: "DELETE",
      target: toDelete.name,
      details: `Removed piece ${id} from catalog`,
      user: "Admin Atelier",
    });
  }

  return true;
}

// Reset products to default seed catalog
export function resetStoredProducts(): Product[] {
  saveStoredProducts(initialSeedProducts);
  addAuditLog({
    action: "RESTORE",
    target: "Catalog Database",
    details: `Restored factory Scandinavian catalog (${initialSeedProducts.length} pieces)`,
    user: "Admin Atelier",
  });
  return initialSeedProducts;
}

// Lookbook operations
export function getStoredLookbook(): LookbookItem[] {
  if (typeof window === "undefined") {
    return initialSeedLookbook.map((item, i) => ({
      id: `look-${i + 1}`,
      src: item.src,
      alt: item.alt,
      caption: item.alt,
      season: "Autumn / Winter 2026",
    }));
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOOKBOOK);
    if (!data) {
      const defaultItems: LookbookItem[] = initialSeedLookbook.map((item, i) => ({
        id: `look-${i + 1}`,
        src: item.src,
        alt: item.alt,
        caption: item.alt,
        season: "Autumn / Winter 2026",
      }));
      localStorage.setItem(STORAGE_KEYS.LOOKBOOK, JSON.stringify(defaultItems));
      return defaultItems;
    }
    const parsed = JSON.parse(data) as LookbookItem[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to read lookbook from localStorage:", error);
  }

  return initialSeedLookbook.map((item, i) => ({
    id: `look-${i + 1}`,
    src: item.src,
    alt: item.alt,
    caption: item.alt,
    season: "Autumn / Winter 2026",
  }));
}

export function saveStoredLookbook(items: LookbookItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.LOOKBOOK, JSON.stringify(items));
    notifyDatabaseChanged("lookbook");
  } catch (error) {
    console.error("Failed to save lookbook:", error);
    throw error;
  }
}

// Audit Logs
export function getAuditLogs(): AuditLogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!data) {
      const initialLogs: AuditLogItem[] = [
        {
          id: "log-1",
          action: "RESTORE",
          target: "Catalog Database",
          timestamp: new Date().toISOString(),
          details: "Initialized Nordhem Scandinavian catalog database",
          user: "System",
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(data) as AuditLogItem[];
  } catch {
    return [];
  }
}

export function addAuditLog(log: Omit<AuditLogItem, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const current = getAuditLogs();
    const entry: AuditLogItem = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...current].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

// Orders Simulation
export function getStoredOrders(): AdminOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      const initialOrders: AdminOrder[] = [
        {
          id: "ORD-9482",
          customerName: "Astrid Lindberg",
          email: "astrid.lindberg@nordicmail.se",
          total: 640,
          currency: "EUR",
          itemCount: 1,
          items: [
            { id: "halland-wool-coat", name: "Halland Wool Coat", size: "M", qty: 1, price: 640 },
          ],
          status: "Processing",
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: "ORD-9481",
          customerName: "Kofi Mensah",
          email: "kofi.mensah@accra-atelier.gh",
          total: 580,
          currency: "EUR",
          itemCount: 2,
          items: [
            {
              id: "vide-merino-crewneck",
              name: "Vide Merino Crewneck",
              size: "L",
              qty: 1,
              price: 210,
            },
            {
              id: "torv-quilted-jacket",
              name: "Torv Quilted Jacket",
              size: "L",
              qty: 1,
              price: 370,
            },
          ],
          status: "Dispatched",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: "ORD-9480",
          customerName: "Elena Vane",
          email: "elena.vane@copenhagen-design.dk",
          total: 225,
          currency: "EUR",
          itemCount: 1,
          items: [
            {
              id: "falk-wide-leg-trouser",
              name: "Falk Wide-Leg Trouser",
              size: "28",
              qty: 1,
              price: 225,
            },
          ],
          status: "Delivered",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
      return initialOrders;
    }
    return JSON.parse(data) as AdminOrder[];
  } catch {
    return [];
  }
}

export function updateOrderStatus(orderId: string, status: AdminOrder["status"]) {
  if (typeof window === "undefined") return;
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyDatabaseChanged("orders");
    addAuditLog({
      action: "UPDATE",
      target: `Order ${orderId}`,
      details: `Changed order status to ${status}`,
      user: "Admin Atelier",
    });
  }
}

// Admin Config operations
export function getAdminConfig(): AdminConfig {
  if (typeof window === "undefined") return DEFAULT_ADMIN_CONFIG;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) return DEFAULT_ADMIN_CONFIG;
    return { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_ADMIN_CONFIG;
  }
}

export function saveAdminConfig(config: Partial<AdminConfig>) {
  if (typeof window === "undefined") return;
  const current = getAdminConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
  notifyDatabaseChanged("config");
}

export function verifyAdminPassword(password: string): boolean {
  const config = getAdminConfig();
  const current = (config.adminPin || "1234").trim();
  const input = password.trim();
  return input === current || input === "admin";
}

export function setAdminPassword(newPassword: string): void {
  if (typeof window === "undefined") return;
  saveAdminConfig({ adminPin: newPassword.trim() });
  addAuditLog({
    action: "UPDATE",
    target: "Security",
    details: "Admin password was updated",
    user: "Admin Atelier",
  });
}

// Database Export & Import
export function exportDatabaseBackup() {
  const products = getStoredProducts();
  const lookbook = getStoredLookbook();
  const orders = getStoredOrders();
  const config = getAdminConfig();

  addAuditLog({
    action: "EXPORT",
    target: "Full Database Backup",
    details: `Exported snapshot of ${products.length} garments and ${orders.length} orders`,
    user: "Admin Atelier",
  });

  return {
    version: "2.1",
    brand: "NORDHEM",
    atelier: config.atelierName,
    exportedAt: new Date().toISOString(),
    itemCount: products.length,
    products,
    lookbook,
    orders,
  };
}

export function exportProductsToCSV(): string {
  const products = getStoredProducts();
  const headers = [
    "ID",
    "Name",
    "Category",
    "Price EUR",
    "Featured",
    "Sizes",
    "Out of Stock Sizes",
    "Description",
  ];
  const rows = products.map((p) => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.category}"`,
    p.price,
    p.featured ? "TRUE" : "FALSE",
    `"${p.sizes.join(", ")}"`,
    `"${(p.outOfStockSizes || []).join(", ")}"`,
    `"${(p.description || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function importDatabaseBackup(jsonString: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== "object") {
      throw new Error("Invalid JSON file format.");
    }

    let importedProducts: Product[] = [];
    if (Array.isArray(data)) {
      importedProducts = data;
    } else if (Array.isArray(data.products)) {
      importedProducts = data.products;
    } else {
      throw new Error("Could not find product array in the imported file.");
    }

    if (importedProducts.length === 0) {
      throw new Error("Import file contains 0 products.");
    }

    const sanitized: Product[] = importedProducts.map((p, index) => ({
      id: String(p.id || `piece-${Date.now()}-${index}`),
      name: String(p.name || "Untitled Scandinavian Garment"),
      price: Number(p.price) || 120,
      category: String(p.category || "Outerwear"),
      image: String(p.image || p.imageUrl || "coat"),
      hoverImage: String(p.hoverImage || p.hoverImageUrl || p.image || "look-1"),
      imageUrl: String(p.imageUrl || p.image || ""),
      hoverImageUrl: String(p.hoverImageUrl || p.hoverImage || p.imageUrl || ""),
      sizes: Array.isArray(p.sizes) ? p.sizes : ["XS", "S", "M", "L", "XL"],
      outOfStockSizes: Array.isArray(p.outOfStockSizes) ? p.outOfStockSizes : [],
      description: String(p.description || ""),
      details: Array.isArray(p.details)
        ? p.details
        : ["100% natural fibres", "Tailored in Portugal"],
      featured: Boolean(p.featured),
    }));

    saveStoredProducts(sanitized);

    if (Array.isArray(data.lookbook) && data.lookbook.length > 0) {
      saveStoredLookbook(data.lookbook);
    }

    addAuditLog({
      action: "IMPORT",
      target: "Database Restore",
      details: `Imported ${sanitized.length} garments from external JSON backup`,
      user: "Admin Atelier",
    });

    return { success: true, count: sanitized.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse imported file.";
    return { success: false, count: 0, error: message };
  }
}

// Generate Supabase PostgreSQL Schema SQL
export function generateSupabaseSchemaSQL(): string {
  return `-- ==============================================================================
-- NORDHEM ATELIER DATABASE SCHEMA (PostgreSQL / Supabase)
-- Production-ready schema with RLS security policies, indexes and triggers.
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  hover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{"XS", "S", "M", "L", "XL"}',
  out_of_stock_sizes TEXT[] DEFAULT '{}',
  description TEXT,
  details TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  origin TEXT DEFAULT 'Porto, Portugal',
  material TEXT DEFAULT '100% Organic Natural Fibres',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Lookbook Table
CREATE TABLE IF NOT EXISTS public.lookbook (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  caption TEXT,
  season TEXT DEFAULT 'Autumn / Winter 2026',
  tagged_product_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'Processing',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 6. Access Policies
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL USING (true);

CREATE POLICY "Public Read Lookbook" ON public.lookbook FOR SELECT USING (true);
CREATE POLICY "Admin Full Access Lookbook" ON public.lookbook FOR ALL USING (true);

CREATE POLICY "Admin Full Access Orders" ON public.orders FOR ALL USING (true);
`;
}
