import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { useProductsStore, useLookbookStore, useOrdersStore } from "@/lib/products-store";
import { type Product, formatPrice, EUR_TO_GHS_RATE } from "@/data/products";
import {
  fileToDataUrl,
  getAdminConfig,
  saveAdminConfig,
  setAdminPassword,
  verifyAdminPassword,
  exportDatabaseBackup,
  exportProductsToCSV,
  importDatabaseBackup,
  generateSupabaseSchemaSQL,
  type AdminOrder,
} from "@/lib/database";
import { getStoredPromoCodes, saveStoredPromoCodes, type PromoCode } from "@/lib/discounts";
import {
  getStoredReviews,
  saveStoredReviews,
  deleteProductReview,
  toggleReviewApproval,
  type ProductReview,
} from "@/lib/reviews";
import {
  getStoredSubscribers,
  saveStoredSubscribers,
  deleteSubscriber,
  exportSubscribersToCSV,
  type NewsletterSubscriber,
} from "@/lib/subscribers";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  EyeOff,
  Database,
  Lock,
  Unlock,
  KeyRound,
  Layers,
  ArrowRight,
  RefreshCw,
  Download,
  FileCode,
  Search,
  ExternalLink,
  Package,
  ShoppingBag,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  ShieldCheck,
  Tag,
  Star,
  Users,
  Mail,
  ToggleLeft,
  ToggleRight,
  Percent,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminRouteComponent,
});

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const TROUSER_SIZES = ["24", "26", "28", "30", "32", "34", "36"];
const ACCESSORY_SIZES = ["ONE SIZE"];

const SCANDINAVIAN_PRESET_IMAGES = [
  {
    name: "Undyed Gotland Wool Coat",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800",
  },
  {
    name: "Heavy Oatmeal Ribbed Turtleneck",
    url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800",
  },
  {
    name: "Washed Baltic Linen Shirt",
    url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800",
  },
  {
    name: "Tailored Sand Twill Trouser",
    url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800",
  },
  {
    name: "Dry Waxed Forest Jacket",
    url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800",
  },
];

function AdminRouteComponent() {
  const { products, categories, addProduct, updateProduct, deleteProduct, resetProducts } =
    useProductsStore();

  const { lookbook, addLookbookItem, deleteLookbookItem, resetLookbook } = useLookbookStore();

  const { orders, auditLogs, updateStatus } = useOrdersStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("nordhem_admin_authenticated") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Set / Change Password UI States
  const [isChangingPasswordMode, setIsChangingPasswordMode] = useState(false);
  const [currentPwForChange, setCurrentPwForChange] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);

  // Tab State: 'overview' | 'catalog' | 'upload' | 'lookbook' | 'orders' | 'promotions' | 'reviews' | 'subscribers' | 'database'
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "catalog"
    | "upload"
    | "lookbook"
    | "orders"
    | "promotions"
    | "reviews"
    | "subscribers"
    | "database"
  >("overview");

  // Catalog View Mode
  const [catalogViewMode, setCatalogViewMode] = useState<"table" | "grid">("table");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">(195);
  const [formCategory, setFormCategory] = useState("Knitwear");
  const [customCategory, setCustomCategory] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formHoverImage, setFormHoverImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDetails, setFormDetails] = useState<string[]>([
    "100% natural organic fibres",
    "Tailored in Portugal",
    "Dry clean only",
  ]);
  const [formSizes, setFormSizes] = useState<string[]>(["XS", "S", "M", "L", "XL"]);
  const [formOutOfStockSizes, setFormOutOfStockSizes] = useState<string[]>([]);
  const [formFeatured, setFormFeatured] = useState(true);
  const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);
  const [isUploadingHover, setIsUploadingHover] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Catalog Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedStockFilter, setSelectedStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK">(
    "ALL",
  );
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "name">("newest");

  // Lookbook Form
  const [lookbookSrc, setLookbookSrc] = useState("");
  const [lookbookAlt, setLookbookAlt] = useState("");
  const [lookbookCaption, setLookbookCaption] = useState("");
  const [lookbookSeason, setLookbookSeason] = useState("Autumn / Winter 2026");
  const [isUploadingLookbook, setIsUploadingLookbook] = useState(false);

  // Promotions State
  const [promos, setPromos] = useState<PromoCode[]>(() => getStoredPromoCodes());
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<PromoCode["discountType"]>("PERCENTAGE");
  const [newPromoVal, setNewPromoVal] = useState<number>(15);
  const [newPromoMinSpend, setNewPromoMinSpend] = useState<number>(0);
  const [newPromoDesc, setNewPromoDesc] = useState("");

  // Reviews State
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(() => getStoredReviews());
  const [reviewFilterProduct, setReviewFilterProduct] = useState("ALL");

  // Subscribers State
  const [subscribersList, setSubscribersList] = useState<NewsletterSubscriber[]>(() =>
    getStoredSubscribers(),
  );
  const [subscriberSearch, setSubscriberSearch] = useState("");

  // Database / Cloud Sync
  const [supabaseUrl, setSupabaseUrl] = useState(() => getAdminConfig().supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getAdminConfig().supabaseAnonKey);
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  // File Input Refs
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const hoverFileRef = useRef<HTMLInputElement>(null);
  const lookbookFileRef = useRef<HTMLInputElement>(null);
  const backupImportRef = useRef<HTMLInputElement>(null);

  // Listen for storage events
  useEffect(() => {
    const handlePromoSync = () => setPromos(getStoredPromoCodes());
    const handleReviewsSync = () => setReviewsList(getStoredReviews());
    const handleSubsSync = () => setSubscribersList(getStoredSubscribers());

    window.addEventListener("nordhem_promo_sync", handlePromoSync);
    window.addEventListener("nordhem_reviews_sync", handleReviewsSync);
    window.addEventListener("nordhem_subscribers_sync", handleSubsSync);

    return () => {
      window.removeEventListener("nordhem_promo_sync", handlePromoSync);
      window.removeEventListener("nordhem_reviews_sync", handleReviewsSync);
      window.removeEventListener("nordhem_subscribers_sync", handleSubsSync);
    };
  }, []);

  // Unlock Handler
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      sessionStorage.setItem("nordhem_admin_authenticated", "true");
      setPinError(false);
      toast.success("Atelier Studio unlocked successfully");
    } else {
      setPinError(true);
      toast.error("Incorrect password. Default is 1234.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("nordhem_admin_authenticated");
    setPasswordInput("");
    toast.info("Atelier Studio locked");
  };

  // Set / Change Password Handler
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!isAuthenticated) {
      if (currentPwForChange && !verifyAdminPassword(currentPwForChange)) {
        toast.error("Current password incorrect");
        return;
      }
    }

    setAdminPassword(newPassword.trim());
    toast.success("Admin password successfully updated!");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPwForChange("");
    setIsChangingPasswordMode(false);
    setShowNewPasswordModal(false);

    if (!isAuthenticated) {
      setIsAuthenticated(true);
      sessionStorage.setItem("nordhem_admin_authenticated", "true");
    }
  };

  const handleResetPasswordToDefault = () => {
    if (window.confirm("Reset admin password back to default ('1234')?")) {
      setAdminPassword("1234");
      toast.success("Admin password reset to 1234");
    }
  };

  // Populate Form for Editing
  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormSlug(p.id);
    setFormPrice(p.price);
    setFormCategory(p.category);
    setCustomCategory("");
    setFormImage(p.imageUrl || p.image);
    setFormHoverImage(p.hoverImageUrl || p.hoverImage || p.imageUrl || p.image);
    setFormDescription(p.description);
    setFormDetails(p.details && p.details.length > 0 ? p.details : ["100% natural fibres"]);
    setFormSizes(p.sizes || ["XS", "S", "M", "L", "XL"]);
    setFormOutOfStockSizes(p.outOfStockSizes || []);
    setFormFeatured(p.featured);
    setActiveTab("upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormPrice(195);
    setFormCategory(categories[0] || "Knitwear");
    setCustomCategory("");
    setFormImage("");
    setFormHoverImage("");
    setFormDescription("");
    setFormDetails(["100% natural organic fibres", "Tailored in Portugal", "Dry clean only"]);
    setFormSizes(["XS", "S", "M", "L", "XL"]);
    setFormOutOfStockSizes([]);
    setFormFeatured(false);
  };

  // Image Upload Handlers
  const handlePrimaryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPrimary(true);
      const dataUrl = await fileToDataUrl(file);
      setFormImage(dataUrl);
      if (!formHoverImage) setFormHoverImage(dataUrl);
      toast.success("Primary garment image loaded");
    } catch {
      toast.error("Failed to process image file");
    } finally {
      setIsUploadingPrimary(false);
    }
  };

  const handleHoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingHover(true);
      const dataUrl = await fileToDataUrl(file);
      setFormHoverImage(dataUrl);
      toast.success("Secondary hover image loaded");
    } catch {
      toast.error("Failed to process image file");
    } finally {
      setIsUploadingHover(false);
    }
  };

  const handleLookbookFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLookbook(true);
      const dataUrl = await fileToDataUrl(file);
      setLookbookSrc(dataUrl);
      toast.success("Editorial campaign image loaded");
    } catch {
      toast.error("Failed to process image file");
    } finally {
      setIsUploadingLookbook(false);
    }
  };

  // Sizing Handlers
  const toggleSizeSelection = (size: string) => {
    if (formSizes.includes(size)) {
      if (formSizes.length === 1) {
        toast.error("Garment must have at least one available size");
        return;
      }
      setFormSizes(formSizes.filter((s) => s !== size));
      setFormOutOfStockSizes(formOutOfStockSizes.filter((s) => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  const toggleSizeStock = (size: string) => {
    if (formOutOfStockSizes.includes(size)) {
      setFormOutOfStockSizes(formOutOfStockSizes.filter((s) => s !== size));
    } else {
      setFormOutOfStockSizes([...formOutOfStockSizes, size]);
    }
  };

  const handleDetailChange = (index: number, val: string) => {
    const next = [...formDetails];
    next[index] = val;
    setFormDetails(next);
  };

  const addDetailField = () => setFormDetails([...formDetails, ""]);
  const removeDetailField = (index: number) => {
    if (formDetails.length <= 1) return;
    setFormDetails(formDetails.filter((_, i) => i !== index));
  };

  // Product Submit
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a garment name");
      return;
    }
    if (!formPrice || Number(formPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!formImage) {
      toast.error("Please upload or select a primary garment photo");
      return;
    }

    const finalCategory =
      formCategory === "CUSTOM" && customCategory.trim() ? customCategory.trim() : formCategory;

    const cleanedDetails = formDetails.map((d) => d.trim()).filter(Boolean);

    try {
      if (editingId) {
        updateProduct(editingId, {
          name: formName.trim(),
          price: Number(formPrice),
          category: finalCategory,
          image: formImage,
          imageUrl: formImage,
          hoverImage: formHoverImage || formImage,
          hoverImageUrl: formHoverImage || formImage,
          description: formDescription.trim(),
          details: cleanedDetails,
          sizes: formSizes,
          outOfStockSizes: formOutOfStockSizes,
          featured: formFeatured,
        });
        toast.success(`Updated "${formName}" in catalog`);
      } else {
        const created = addProduct({
          id: formSlug.trim() || undefined,
          name: formName.trim(),
          price: Number(formPrice),
          category: finalCategory,
          image: formImage,
          imageUrl: formImage,
          hoverImage: formHoverImage || formImage,
          hoverImageUrl: formHoverImage || formImage,
          description: formDescription.trim(),
          details: cleanedDetails,
          sizes: formSizes,
          outOfStockSizes: formOutOfStockSizes,
          featured: formFeatured,
        });
        toast.success(`Created "${created.name}" in catalog`);
      }

      resetForm();
      setActiveTab("catalog");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      toast.error(message);
    }
  };

  const handleDuplicateProduct = (p: Product) => {
    const clone = {
      ...p,
      id: `${p.id}-copy`,
      name: `${p.name} (Copy)`,
      featured: false,
    };
    addProduct(clone);
    toast.success(`Duplicated "${p.name}"`);
  };

  const handleDeleteProduct = (p: Product) => {
    if (window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
      deleteProduct(p.id);
      toast.info(`Deleted "${p.name}"`);
      if (editingId === p.id) resetForm();
    }
  };

  const handleBulkDelete = () => {
    if (
      selectedProductIds.length > 0 &&
      window.confirm(`Delete ${selectedProductIds.length} selected garments?`)
    ) {
      selectedProductIds.forEach((id) => deleteProduct(id));
      setSelectedProductIds([]);
      toast.success("Bulk delete complete");
    }
  };

  const handleBulkToggleFeatured = (featured: boolean) => {
    selectedProductIds.forEach((id) => updateProduct(id, { featured }));
    toast.success(`Updated featured status for ${selectedProductIds.length} garments`);
    setSelectedProductIds([]);
  };

  // Promo Code Operations
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const code = newPromoCode.trim().toUpperCase();
    if (promos.some((p) => p.code.toUpperCase() === code)) {
      toast.error(`Code ${code} already exists`);
      return;
    }

    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code,
      discountType: newPromoType,
      discountValue: Number(newPromoVal) || 15,
      minSpend: Number(newPromoMinSpend) || 0,
      active: true,
      usageCount: 0,
      description:
        newPromoDesc.trim() ||
        `${newPromoVal}% off${newPromoMinSpend ? ` orders over €${newPromoMinSpend}` : ""}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPromo, ...promos];
    saveStoredPromoCodes(updated);
    setPromos(updated);
    setNewPromoCode("");
    setNewPromoDesc("");
    toast.success(`Promo code ${code} created`);
  };

  const handleTogglePromoActive = (id: string) => {
    const updated = promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    saveStoredPromoCodes(updated);
    setPromos(updated);
    toast.info("Promo code status updated");
  };

  const handleDeletePromo = (id: string) => {
    if (window.confirm("Delete this promo code?")) {
      const updated = promos.filter((p) => p.id !== id);
      saveStoredPromoCodes(updated);
      setPromos(updated);
      toast.success("Promo code deleted");
    }
  };

  // Review Operations
  const handleToggleReview = (id: string) => {
    toggleReviewApproval(id);
    setReviewsList(getStoredReviews());
    toast.info("Review visibility updated");
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm("Delete this customer review?")) {
      deleteProductReview(id);
      setReviewsList(getStoredReviews());
      toast.success("Review deleted");
    }
  };

  // Subscriber Operations
  const handleDeleteSub = (id: string) => {
    deleteSubscriber(id);
    setSubscribersList(getStoredSubscribers());
    toast.success("Subscriber removed");
  };

  const handleExportSubsCSV = () => {
    const csv = exportSubscribersToCSV();
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `nordhem-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Subscribers exported to CSV");
  };

  // Lookbook Submit
  const handleSubmitLookbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookbookSrc) {
      toast.error("Please upload or provide an image for the campaign look");
      return;
    }
    addLookbookItem({
      src: lookbookSrc,
      alt: lookbookAlt.trim() || "Nordhem Campaign Look",
      caption: lookbookCaption.trim() || lookbookAlt.trim(),
      season: lookbookSeason.trim(),
    });
    setLookbookSrc("");
    setLookbookAlt("");
    setLookbookCaption("");
    toast.success("Campaign look added to Lookbook");
  };

  // Database Backup
  const handleExportBackup = () => {
    const backup = exportDatabaseBackup();
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `nordhem-database-backup-${new Date().toISOString().split("T")[0]}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Database exported to JSON");
  };

  const handleExportCSV = () => {
    const csv = exportProductsToCSV();
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `nordhem-catalog-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Catalog exported to CSV");
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDatabaseBackup(content);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} products`);
      } else {
        toast.error(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetCatalog = () => {
    if (
      window.confirm(
        "Restore factory Scandinavian catalog seed data? This will revert custom additions.",
      )
    ) {
      resetProducts();
      resetLookbook();
      toast.success("Catalog restored to default Nordic pieces");
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdminConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });
    toast.success("Atelier cloud configuration updated");
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategoryFilter === "ALL" || p.category === selectedCategoryFilter;
        const hasOutOfStock = (p.outOfStockSizes || []).length > 0;
        const matchesStock =
          selectedStockFilter === "ALL"
            ? true
            : selectedStockFilter === "LOW_STOCK"
              ? hasOutOfStock
              : !hasOutOfStock;
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchQuery, selectedCategoryFilter, selectedStockFilter, sortBy]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    if (reviewFilterProduct === "ALL") return reviewsList;
    return reviewsList.filter((r) => r.productId === reviewFilterProduct);
  }, [reviewsList, reviewFilterProduct]);

  // Filtered Subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribersList.filter((s) =>
      s.email.toLowerCase().includes(subscriberSearch.toLowerCase()),
    );
  }, [subscribersList, subscriberSearch]);

  // Overall Inventory Stats
  const totalCatalogValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.price, 0);
  }, [products]);

  const outOfStockItemsCount = useMemo(() => {
    return products.filter((p) => (p.outOfStockSizes || []).length > 0).length;
  }, [products]);

  const avgPrice = useMemo(() => {
    return products.length > 0 ? Math.round(totalCatalogValue / products.length) : 0;
  }, [products, totalCatalogValue]);

  // 1. PIN / PASSWORD LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md border border-border bg-card p-10 text-center shadow-xs">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground">
            <Lock className="h-6 w-6 text-clay" />
          </div>
          <p className="eyebrow text-clay">NORDHEM ATELIER</p>
          <h1 className="mt-1 text-3xl font-light tracking-tight text-foreground font-display">
            {isChangingPasswordMode ? "Set Admin Password" : "Executive Studio"}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {isChangingPasswordMode
              ? "Define your custom admin password for unlocking the atelier."
              : "Enter your atelier password to manage the catalog database, lookbooks, and orders."}
          </p>

          {!isChangingPasswordMode ? (
            <form onSubmit={handleUnlock} className="mt-8 space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter Password (Default: 1234)"
                  className="field pr-10 text-center font-mono text-lg tracking-wider"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {pinError && (
                  <p className="mt-2 text-xs text-destructive flex items-center justify-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Incorrect password. Default passcode is 1234.
                  </p>
                )}
              </div>

              <button type="submit" className="btn-solid w-full cursor-pointer">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Atelier Studio
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPasswordMode(true);
                    setPinError(false);
                  }}
                  className="text-xs text-clay hover:underline flex items-center justify-center gap-1.5 w-full cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Set Your Own Admin Password
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveNewPassword} className="mt-8 space-y-4 text-left">
              <div>
                <label className="eyebrow block mb-1">Current Password (or 1234)</label>
                <input
                  type="password"
                  value={currentPwForChange}
                  onChange={(e) => setCurrentPwForChange(e.target.value)}
                  placeholder="Current password (Default: 1234)"
                  className="field text-xs font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">New Custom Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (e.g. MySecret2026)"
                  className="field text-xs font-mono border-clay"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="field text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" className="btn-solid w-full cursor-pointer">
                  <Check className="mr-2 h-4 w-4" />
                  Save Password & Unlock
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPasswordMode(false)}
                  className="btn-outline w-full text-xs py-2 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 border-t border-border pt-5 text-center flex items-center justify-between text-xs text-muted-foreground">
            <Link to="/" className="link-underline hover:text-foreground">
              ← Storefront
            </Link>
            <span className="font-mono text-[11px] text-muted-foreground/80">Secured Atelier</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN EXECUTIVE ADMIN DASHBOARD (9 MODULAR HUBS)
  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header & Atelier Status */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="eyebrow text-clay">NORDHEM ATELIER MANAGEMENT</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Database Live & Syncing
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-light tracking-tight text-foreground sm:text-4xl font-display">
            Nordhem Atelier CMS & Product Database
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowNewPasswordModal(true)}
            className="btn-outline flex items-center gap-1.5 text-xs py-2 px-3.5 cursor-pointer hover:border-clay"
            title="Change Password"
          >
            <KeyRound className="h-3.5 w-3.5 text-clay" />
            Password
          </button>
          <Link
            to="/shop"
            target="_blank"
            className="btn-outline flex items-center gap-1.5 text-xs py-2 px-4 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            Live Storefront
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
          <button
            onClick={handleLogout}
            className="btn-outline flex items-center gap-1.5 text-xs py-2 px-3.5 cursor-pointer hover:border-destructive hover:text-destructive"
            title="Lock Atelier"
          >
            <Lock className="h-3.5 w-3.5" />
            Lock
          </button>
        </div>
      </div>

      {/* Navigation Tabs (9 Hubs) */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Catalog ({products.length})
        </button>

        <button
          onClick={() => {
            if (editingId) resetForm();
            setActiveTab("upload");
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "upload"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          {editingId ? "Edit Garment" : "Upload Piece"}
        </button>

        <button
          onClick={() => setActiveTab("lookbook")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "lookbook"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Lookbooks ({lookbook.length})
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "orders"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("promotions")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "promotions"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          Promotions ({promos.length})
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          Reviews ({reviewsList.length})
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "subscribers"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Subscribers ({subscribersList.length})
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "database"
              ? "border-b-2 border-primary font-medium text-foreground bg-secondary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          Database & Security
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Catalog Inventory</p>
                <Package className="h-4 w-4 text-clay" />
              </div>
              <p className="mt-2 text-3xl font-light text-foreground">{products.length}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Active Scandinavian designs</p>
            </div>

            <div className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Stock Health</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-light text-foreground">
                {Math.round(((products.length - outOfStockItemsCount) / products.length) * 100)}%
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {products.length - outOfStockItemsCount} fully in stock
              </p>
            </div>

            <div className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Stockout Alerts</p>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-3xl font-light text-amber-600">{outOfStockItemsCount}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Partial size depletion</p>
            </div>

            <div className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Average Unit Price</p>
                <TrendingUp className="h-4 w-4 text-clay" />
              </div>
              <p className="mt-2 text-3xl font-light text-foreground">€{avgPrice}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatPrice(avgPrice)}</p>
            </div>

            <div className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Catalog Valuation</p>
                <Globe className="h-4 w-4 text-clay" />
              </div>
              <p className="mt-2 text-3xl font-light text-foreground">
                {formatPrice(totalCatalogValue)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                €{totalCatalogValue.toLocaleString()} EUR total
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="border border-border bg-card p-6 lg:col-span-7">
              <h3 className="text-lg font-light text-foreground mb-4 font-display">
                Collection Category Distribution
              </h3>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  const percentage = Math.round((count / products.length) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{cat}</span>
                        <span className="text-muted-foreground">
                          {count} pieces ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-clay transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="border border-border bg-card p-6">
                <h3 className="text-lg font-light text-foreground mb-3 font-display">
                  Atelier Quick Operations
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab("upload");
                    }}
                    className="btn-solid py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Piece
                  </button>
                  <button
                    onClick={() => setActiveTab("promotions")}
                    className="btn-outline py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Promo Codes
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="btn-outline py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Backup DB
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="btn-outline py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    SECURITY & PASSWORD
                  </span>
                  <button
                    onClick={() => setShowNewPasswordModal(true)}
                    className="text-xs text-clay hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="h-3 w-3" />
                    Change Password
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Custom admin authentication is active. You can change your password anytime or
                  configure Supabase cloud access.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-light text-foreground font-display">
                  Atelier Activity & Database Audit Log
                </h3>
                <p className="text-xs text-muted-foreground">
                  Timestamped history of garment additions, price revisions, and exports.
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {auditLogs.length} events logged
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 text-xs last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-xs ${
                        log.action === "CREATE"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : log.action === "UPDATE"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : log.action === "DELETE"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-secondary text-foreground"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-medium text-foreground">{log.target}</span>
                    <span className="text-muted-foreground hidden sm:inline">— {log.details}</span>
                  </div>
                  <div className="text-right font-mono text-[10px] text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG */}
      {activeTab === "catalog" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by garment title, SKU, or category..."
                className="w-full bg-background pl-9 pr-4 py-2 text-xs border border-border focus:outline-none focus:border-clay"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-background px-3 py-2 text-xs border border-border focus:outline-none focus:border-clay"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedStockFilter}
                onChange={(e) =>
                  setSelectedStockFilter(e.target.value as "ALL" | "IN_STOCK" | "LOW_STOCK")
                }
                className="bg-background px-3 py-2 text-xs border border-border focus:outline-none focus:border-clay"
              >
                <option value="ALL">All Stock Status</option>
                <option value="IN_STOCK">Fully Available</option>
                <option value="LOW_STOCK">Has Depleted Sizes</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "price-asc" | "price-desc" | "name")
                }
                className="bg-background px-3 py-2 text-xs border border-border focus:outline-none focus:border-clay"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <div className="flex border border-border">
                <button
                  type="button"
                  onClick={() => setCatalogViewMode("table")}
                  className={`p-2 text-xs transition-colors cursor-pointer ${
                    catalogViewMode === "table" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                  title="Spreadsheet Table View"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogViewMode("grid")}
                  className={`p-2 text-xs transition-colors cursor-pointer ${
                    catalogViewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                  title="Editorial Grid View"
                >
                  <Layers className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("upload");
                }}
                className="btn-solid py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Piece
              </button>
            </div>
          </div>

          {selectedProductIds.length > 0 && (
            <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-2 text-xs">
              <span>{selectedProductIds.length} garments selected</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkToggleFeatured(true)}
                  className="bg-primary-foreground/20 hover:bg-primary-foreground/30 px-2 py-1 text-[11px] cursor-pointer"
                >
                  Mark Featured
                </button>
                <button
                  onClick={() => handleBulkToggleFeatured(false)}
                  className="bg-primary-foreground/20 hover:bg-primary-foreground/30 px-2 py-1 text-[11px] cursor-pointer"
                >
                  Unmark Featured
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-destructive text-white hover:bg-destructive/90 px-2 py-1 text-[11px] cursor-pointer"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="underline ml-2 text-[11px] cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {catalogViewMode === "table" && (
            <div className="border border-border bg-card overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedProductIds.length === filteredProducts.length &&
                          filteredProducts.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds(filteredProducts.map((p) => p.id));
                          } else {
                            setSelectedProductIds([]);
                          }
                        }}
                        className="accent-primary"
                      />
                    </th>
                    <th className="p-3 w-16">Image</th>
                    <th className="p-3">Garment / SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (EUR / GHS)</th>
                    <th className="p-3">Stock & Sizing</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    const oosCount = (p.outOfStockSizes || []).length;
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-secondary/20 transition-colors ${
                          isSelected ? "bg-secondary/30" : ""
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds([...selectedProductIds, p.id]);
                              } else {
                                setSelectedProductIds(
                                  selectedProductIds.filter((id) => id !== p.id),
                                );
                              }
                            }}
                            className="accent-primary"
                          />
                        </td>
                        <td className="p-3">
                          <div className="h-12 w-10 overflow-hidden bg-secondary border border-border">
                            <img
                              src={p.imageUrl || p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{p.id}</div>
                        </td>
                        <td className="p-3">
                          <span className="rounded-xs bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-foreground">€{p.price}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {formatPrice(p.price)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.sizes.map((s) => {
                              const isOos = (p.outOfStockSizes || []).includes(s);
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    const nextOos = isOos
                                      ? (p.outOfStockSizes || []).filter((item) => item !== s)
                                      : [...(p.outOfStockSizes || []), s];
                                    updateProduct(p.id, { outOfStockSizes: nextOos });
                                    toast.success(
                                      `Size ${s} marked ${isOos ? "In Stock" : "Out of Stock"}`,
                                    );
                                  }}
                                  className={`px-1.5 py-0.5 text-[9px] border transition-colors cursor-pointer ${
                                    isOos
                                      ? "line-through text-muted-foreground bg-secondary/50 border-border"
                                      : "text-foreground bg-background border-border hover:border-clay"
                                  }`}
                                  title="Click to toggle size stock"
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                          {oosCount > 0 && (
                            <p className="mt-1 text-[10px] text-amber-600 font-medium">
                              {oosCount} size(s) out of stock
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          {p.featured ? (
                            <span className="rounded-xs bg-clay/10 text-clay px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium">
                              Featured
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Standard</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEditing(p)}
                              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Edit piece"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(p)}
                              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Duplicate piece"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Delete piece"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <Link
                              to="/product/$productId"
                              params={{ productId: p.id }}
                              target="_blank"
                              className="p-1.5 text-muted-foreground hover:text-clay cursor-pointer"
                              title="View PDP"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {catalogViewMode === "grid" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => {
                const outOfStockCount = (p.outOfStockSizes || []).length;
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col border border-border bg-card transition-all hover:border-clay/60"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-secondary">
                      <img
                        src={p.imageUrl || p.image}
                        alt={p.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      {p.featured && (
                        <span className="absolute top-2 left-2 rounded-xs bg-clay px-2 py-0.5 text-[9px] uppercase tracking-widest text-white">
                          Featured
                        </span>
                      )}
                      <span className="absolute top-2 right-2 rounded-xs bg-background/90 px-2 py-0.5 text-[10px] uppercase tracking-wider backdrop-blur-xs">
                        {p.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-normal text-foreground">{p.name}</h3>
                          <p className="text-[11px] font-mono text-muted-foreground">{p.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {formatPrice(p.price)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">€{p.price} EUR</p>
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {p.description || "No description provided."}
                      </p>

                      <div className="mt-3 border-t border-border pt-3">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Sizes ({p.sizes.length}):</span>
                          {outOfStockCount > 0 ? (
                            <span className="text-amber-600 font-medium">
                              {outOfStockCount} out of stock
                            </span>
                          ) : (
                            <span className="text-emerald-600">All available</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {p.sizes.map((s) => {
                            const isOos = (p.outOfStockSizes || []).includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  const nextOos = isOos
                                    ? (p.outOfStockSizes || []).filter((item) => item !== s)
                                    : [...(p.outOfStockSizes || []), s];
                                  updateProduct(p.id, { outOfStockSizes: nextOos });
                                  toast.success(
                                    `Size ${s} marked ${isOos ? "In Stock" : "Out of Stock"}`,
                                  );
                                }}
                                className={`px-1.5 py-0.5 text-[10px] border transition-colors cursor-pointer ${
                                  isOos
                                    ? "border-border text-muted-foreground line-through bg-secondary/50"
                                    : "border-border text-foreground bg-background hover:border-clay"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(p)}
                            className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <Link
                          to="/product/$productId"
                          params={{ productId: p.id }}
                          target="_blank"
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-clay link-underline cursor-pointer"
                        >
                          View PDP
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPLOAD */}
      {activeTab === "upload" && (
        <div className="mt-6">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="eyebrow text-clay">
                {editingId ? `EDITING: ${formSlug}` : "ATELIER SPECIFICATION"}
              </p>
              <h2 className="text-2xl font-light text-foreground font-display">
                {editingId ? `Update "${formName || "Garment"}"` : "Upload Scandinavian Garment"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="btn-outline py-2 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Live Preview
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline py-2 px-3.5 text-xs cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <div className="border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="eyebrow">PRIMARY LOOK (3:4 PORTRAIT)</span>
                  {formImage && (
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Loaded</span>
                  )}
                </div>

                {formImage ? (
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-secondary border border-border">
                    <img
                      src={formImage}
                      alt="Primary Garment Preview"
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => primaryFileRef.current?.click()}
                        className="btn-solid py-1.5 px-3 text-[11px] cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="bg-destructive text-white py-1.5 px-3 text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => primaryFileRef.current?.click()}
                    className="flex aspect-3/4 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-secondary/30 p-6 text-center transition-colors hover:border-clay hover:bg-secondary/50"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs font-medium text-foreground">
                      {isUploadingPrimary ? "Processing image..." : "Upload Primary Garment Photo"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Drag & drop JPG, PNG, WEBP or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={primaryFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePrimaryFileSelect}
                  className="hidden"
                />

                <div className="mt-3">
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Or direct image URL:
                  </label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="field text-xs"
                  />
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Quick Curated Nordic Presets:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SCANDINAVIAN_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormImage(preset.url);
                          if (!formHoverImage) setFormHoverImage(preset.url);
                          toast.success(`Applied preset: ${preset.name}`);
                        }}
                        className="text-[10px] bg-secondary hover:bg-clay hover:text-white px-2 py-1 rounded-xs transition-colors cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="eyebrow">SECONDARY HOVER / DETAIL PHOTO</span>
                  {formHoverImage && (
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Loaded</span>
                  )}
                </div>

                {formHoverImage ? (
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-secondary border border-border">
                    <img
                      src={formHoverImage}
                      alt="Hover Detail Preview"
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => hoverFileRef.current?.click()}
                        className="btn-solid py-1.5 px-3 text-[11px] cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormHoverImage("")}
                        className="bg-destructive text-white py-1.5 px-3 text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => hoverFileRef.current?.click()}
                    className="flex aspect-3/4 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-secondary/30 p-6 text-center transition-colors hover:border-clay hover:bg-secondary/50"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs font-medium text-foreground">
                      {isUploadingHover ? "Processing image..." : "Upload Hover Detail Photo"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Appears on mouse hover in the product grid
                    </p>
                  </div>
                )}

                <input
                  ref={hoverFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHoverFileSelect}
                  className="hidden"
                />

                <div className="mt-3">
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Or direct hover image URL:
                  </label>
                  <input
                    type="url"
                    value={formHoverImage}
                    onChange={(e) => setFormHoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="field text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-7">
              <div className="border border-border bg-card p-6">
                <h3 className="text-lg font-light text-foreground mb-4 font-display">
                  Garment Identity & Classification
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="eyebrow block mb-1">Garment Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        if (!editingId) {
                          setFormSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, ""),
                          );
                        }
                      }}
                      placeholder="e.g. Gotland Wool Overcoat"
                      className="field text-sm"
                    />
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">SKU / URL Slug</label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="e.g. gotland-wool-overcoat"
                      className="field text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="field text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="CUSTOM">+ Add New Custom Category</option>
                    </select>

                    {formCategory === "CUSTOM" && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter new category name..."
                        className="field text-xs mt-2 border-clay"
                        autoFocus
                      />
                    )}
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Price in EUR (€) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 340"
                      className="field text-sm"
                    />
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Cedis Conversion Preview (GH₵)</label>
                    <div className="pt-2 text-sm font-medium text-foreground">
                      {formPrice ? formatPrice(Number(formPrice)) : "GH₵0"}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        (@ {EUR_TO_GHS_RATE} GHS/EUR)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-light text-foreground font-display">
                    Sizing & Stock Availability
                  </h3>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setFormSizes(STANDARD_SIZES)}
                      className="text-muted-foreground hover:text-clay link-underline cursor-pointer"
                    >
                      Standard (XS-XXL)
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormSizes(TROUSER_SIZES)}
                      className="text-muted-foreground hover:text-clay link-underline cursor-pointer"
                    >
                      Waist (24-36)
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormSizes(ACCESSORY_SIZES)}
                      className="text-muted-foreground hover:text-clay link-underline cursor-pointer"
                    >
                      One Size
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Check available sizes for this piece. Click "OOS" badge to toggle out-of-stock
                  sizes.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ...STANDARD_SIZES,
                    ...TROUSER_SIZES.filter((s) => !STANDARD_SIZES.includes(s)),
                  ].map((size) => {
                    const isSelected = formSizes.includes(size);
                    const isOos = formOutOfStockSizes.includes(size);

                    return (
                      <div
                        key={size}
                        className={`flex items-center justify-between p-2.5 border transition-all ${
                          isSelected
                            ? "border-primary bg-background"
                            : "border-border/60 opacity-60 bg-secondary/20"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSizeSelection(size)}
                            className="accent-primary h-3.5 w-3.5"
                          />
                          <span className="text-xs font-mono font-medium">{size}</span>
                        </label>

                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => toggleSizeStock(size)}
                            className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider transition-colors cursor-pointer ${
                              isOos
                                ? "bg-amber-600/10 text-amber-600 border border-amber-600/30"
                                : "bg-emerald-600/10 text-emerald-600 border border-emerald-600/30"
                            }`}
                          >
                            {isOos ? "OOS" : "In Stock"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-border bg-card p-6">
                <h3 className="text-lg font-light text-foreground mb-4 font-display">
                  Scandinavian Details & Materials
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="eyebrow block mb-1">Editorial Narrative Description</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="A relaxed overshirt cut from dense Gotland wool twill with horn buttons..."
                      className="field text-xs resize-y"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="eyebrow">Craftsmanship & Care Bullet Points</label>
                      <button
                        type="button"
                        onClick={addDetailField}
                        className="text-xs text-clay hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Add Detail Line
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formDetails.map((detail, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs font-mono">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={detail}
                            onChange={(e) => handleDetailChange(index, e.target.value)}
                            placeholder="e.g. 100% extra-fine merino wool"
                            className="field text-xs flex-1"
                          />
                          {formDetails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDetailField(index)}
                              className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="accent-primary h-4 w-4"
                      />
                      <span className="text-xs font-medium text-foreground">
                        Feature this garment on Homepage carousel
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline py-3 px-6 text-xs cursor-pointer"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="btn-solid py-3 px-8 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {editingId ? "Save Garment Changes" : "Publish to Catalog"}
                </button>
              </div>
            </div>
          </form>

          {showPreviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="max-w-xl w-full border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <p className="eyebrow text-clay">STOREFRONT LIVE PREVIEW</p>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="mt-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 aspect-3/4 overflow-hidden bg-secondary border border-border">
                    <img
                      src={
                        formImage ||
                        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800"
                      }
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col justify-between">
                    <div>
                      <p className="eyebrow">{formCategory}</p>
                      <h3 className="text-xl font-light text-foreground mt-1 font-display">
                        {formName || "Untitled Scandinavian Piece"}
                      </h3>
                      <p className="mt-2 text-base font-medium text-foreground">
                        {formPrice ? formatPrice(Number(formPrice)) : "GH₵0"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {formDescription ||
                          "A minimalist Scandinavian silhouette crafted from natural fibres."}
                      </p>

                      <div className="mt-4">
                        <p className="text-[11px] text-muted-foreground mb-1.5">Sizes:</p>
                        <div className="flex flex-wrap gap-1">
                          {formSizes.map((s) => (
                            <span
                              key={s}
                              className={`px-2 py-1 text-[10px] border ${
                                formOutOfStockSizes.includes(s)
                                  ? "line-through text-muted-foreground border-border opacity-50"
                                  : "border-border text-foreground"
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="btn-solid w-full text-xs py-2 cursor-pointer"
                      >
                        Add to bag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LOOKBOOK */}
      {activeTab === "lookbook" && (
        <div className="mt-6 space-y-8">
          <div className="border border-border bg-card p-6">
            <h2 className="text-xl font-light text-foreground mb-1 font-display">
              Add Campaign Lookbook Frame
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Upload high-resolution editorial photography for seasonal Scandinavian lookbooks.
            </p>

            <form
              onSubmit={handleSubmitLookbook}
              className="grid grid-cols-1 gap-6 md:grid-cols-12"
            >
              <div className="md:col-span-4">
                {lookbookSrc ? (
                  <div className="relative aspect-3/4 overflow-hidden border border-border bg-secondary">
                    <img
                      src={lookbookSrc}
                      alt="Campaign preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setLookbookSrc("")}
                      className="absolute top-2 right-2 bg-destructive text-white p-1 text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => lookbookFileRef.current?.click()}
                    className="flex aspect-3/4 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-secondary/30 p-4 text-center hover:border-clay"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-xs font-medium">
                      {isUploadingLookbook ? "Processing..." : "Upload Campaign Image"}
                    </p>
                  </div>
                )}
                <input
                  ref={lookbookFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLookbookFileSelect}
                  className="hidden"
                />
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="eyebrow block mb-1">Image URL (Optional if uploaded)</label>
                  <input
                    type="url"
                    value={lookbookSrc}
                    onChange={(e) => setLookbookSrc(e.target.value)}
                    placeholder="https://..."
                    className="field text-xs"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Alt Description / Title</label>
                  <input
                    type="text"
                    value={lookbookAlt}
                    onChange={(e) => setLookbookAlt(e.target.value)}
                    placeholder="e.g. Model in layered oatmeal knitwear on Gotland coast"
                    className="field text-xs"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Season / Collection</label>
                  <input
                    type="text"
                    value={lookbookSeason}
                    onChange={(e) => setLookbookSeason(e.target.value)}
                    placeholder="e.g. Autumn / Winter 2026"
                    className="field text-xs"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Editorial Caption</label>
                  <textarea
                    rows={2}
                    value={lookbookCaption}
                    onChange={(e) => setLookbookCaption(e.target.value)}
                    placeholder="Close detail of hand in pocket of sand wool coat..."
                    className="field text-xs resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="btn-solid py-2 px-6 text-xs cursor-pointer">
                    Add Lookbook Frame
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light text-foreground font-display">
                Current Lookbook Frames ({lookbook.length})
              </h3>
              <button
                onClick={() => {
                  if (window.confirm("Reset lookbook to default collection images?")) {
                    resetLookbook();
                    toast.success("Lookbook reset");
                  }
                }}
                className="text-xs text-muted-foreground hover:text-clay link-underline cursor-pointer"
              >
                Reset Default Lookbook
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {lookbook.map((item, index) => (
                <div key={item.id || index} className="group relative border border-border bg-card">
                  <div className="aspect-3/4 overflow-hidden bg-secondary">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="eyebrow">{item.season || `Look ${index + 1}`}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.alt || item.caption}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this lookbook image?")) {
                        deleteLookbookItem(item.id);
                        toast.info("Lookbook image deleted");
                      }
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100 cursor-pointer"
                    title="Delete look"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS */}
      {activeTab === "orders" && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="eyebrow text-clay">DISPATCH & FULFILLMENT</p>
              <h2 className="text-2xl font-light text-foreground font-display">
                Client Orders & Dispatch Hub
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {orders.length} registered orders
            </span>
          </div>

          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total (EUR / GHS)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-mono font-medium text-foreground">{o.id}</td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{o.customerName}</div>
                      <div className="text-[10px] text-muted-foreground">{o.email}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        {o.items.map((item, i) => (
                          <div key={i} className="text-muted-foreground">
                            {item.qty}x {item.name} ({item.size})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">€{o.total}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatPrice(o.total)}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-xs ${
                          o.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                            : o.status === "Dispatched"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value as AdminOrder["status"])}
                        className="bg-background border border-border text-xs px-2 py-1 focus:border-clay cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PROMOTIONS & VOUCHERS */}
      {activeTab === "promotions" && (
        <div className="mt-6 space-y-8">
          {/* Create Promo Code Card */}
          <div className="border border-border bg-card p-6">
            <h2 className="text-xl font-light text-foreground mb-1 font-display">
              Create Promotional Coupon Code
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Create client vouchers for seasonal sales, newsletter incentives, or VIP discounts.
            </p>

            <form
              onSubmit={handleCreatePromo}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
            >
              <div>
                <label className="eyebrow block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. COPENHAGEN20"
                  className="field text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Discount Type</label>
                <select
                  value={newPromoType}
                  onChange={(e) => setNewPromoType(e.target.value as PromoCode["discountType"])}
                  className="field text-xs"
                >
                  <option value="PERCENTAGE">Percentage (%) Off</option>
                  <option value="FIXED">Fixed Amount (€) Off</option>
                  <option value="FREE_SHIPPING">Free Express Shipping</option>
                </select>
              </div>

              <div>
                <label className="eyebrow block mb-1">
                  {newPromoType === "PERCENTAGE"
                    ? "Discount Value (%)"
                    : newPromoType === "FIXED"
                      ? "Discount Value (€)"
                      : "Shipping Value (€)"}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newPromoVal}
                  onChange={(e) => setNewPromoVal(Number(e.target.value))}
                  className="field text-xs"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Min Spend (€ EUR)</label>
                <input
                  type="number"
                  min={0}
                  value={newPromoMinSpend}
                  onChange={(e) => setNewPromoMinSpend(Number(e.target.value))}
                  placeholder="0 (No minimum)"
                  className="field text-xs"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="eyebrow block mb-1">Public Description</label>
                <input
                  type="text"
                  value={newPromoDesc}
                  onChange={(e) => setNewPromoDesc(e.target.value)}
                  placeholder="e.g. 20% off all Autumn knitwear over €150"
                  className="field text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-solid w-full py-2.5 px-4 text-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create Voucher
                </button>
              </div>
            </form>
          </div>

          {/* Active Promo Codes List */}
          <div className="border border-border bg-card overflow-x-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-light text-foreground font-display">
                Active Client Vouchers & Codes ({promos.length})
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="p-3">Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Benefit</th>
                  <th className="p-3">Min Spend</th>
                  <th className="p-3">Usage Count</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-mono font-semibold text-foreground">{p.code}</td>
                    <td className="p-3">
                      <span className="rounded-xs bg-secondary px-2 py-0.5 text-[10px] font-mono">
                        {p.discountType}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-foreground">{p.description}</td>
                    <td className="p-3 text-muted-foreground">
                      {p.minSpend && p.minSpend > 0 ? `€${p.minSpend}` : "None"}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{p.usageCount} orders</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleTogglePromoActive(p.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-xs transition-colors cursor-pointer ${
                          p.active
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete code"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: REVIEWS MODERATION */}
      {activeTab === "reviews" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-clay">CUSTOMER FEEDBACK</p>
              <h2 className="text-xl font-light text-foreground font-display">
                Client Reviews Moderation ({reviewsList.length})
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">Filter by piece:</label>
              <select
                value={reviewFilterProduct}
                onChange={(e) => setReviewFilterProduct(e.target.value)}
                className="field text-xs bg-background"
              >
                <option value="ALL">All Garments</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="border border-border bg-card p-5 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={
                            star <= r.rating ? "fill-amber-500 text-amber-500" : "text-border"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-medium text-sm text-foreground">{r.headline}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      (SKU: {r.productId})
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    <span className="font-medium text-foreground">{r.authorName}</span>
                    {r.verifiedBuyer && (
                      <span className="text-emerald-600 flex items-center gap-1 font-medium text-[10px]">
                        <CheckCircle2 size={11} /> Verified Buyer
                      </span>
                    )}
                    <span>·</span>
                    <span className="rounded-xs bg-secondary px-1.5 py-0.5 text-[9px] font-mono">
                      Fit: {r.fitRating.replace(/_/g, " ")}
                    </span>
                    <span>·</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-center">
                  <button
                    onClick={() => handleToggleReview(r.id)}
                    className={`px-3 py-1 text-xs rounded-xs border transition-colors cursor-pointer ${
                      r.approved
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {r.approved ? "Approved" : "Hidden"}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SUBSCRIBERS */}
      {activeTab === "subscribers" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                placeholder="Search subscriber emails..."
                className="w-full bg-background pl-9 pr-4 py-2 text-xs border border-border focus:outline-none focus:border-clay"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSubsCSV}
                className="btn-outline py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export CSV for Mailchimp / Klaviyo
              </button>
            </div>
          </div>

          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="p-3">Subscriber Email</th>
                  <th className="p-3">Origin Source</th>
                  <th className="p-3">VIP Membership Tier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Join Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {s.email}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[10px]">{s.source}</td>
                    <td className="p-3">
                      <span className="rounded-xs bg-clay/10 text-clay px-2 py-0.5 text-[10px] font-medium">
                        {s.vipTier || "Bronze Member"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                      {new Date(s.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteSub(s.id)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Remove subscriber"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: DATABASE & SECURITY */}
      {activeTab === "database" && (
        <div className="mt-6 space-y-8">
          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-clay" />
                <h3 className="text-lg font-light text-foreground font-display">
                  Admin Authentication & Password Settings
                </h3>
              </div>
              <span className="text-xs text-emerald-600 font-medium">● Protected Area</span>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              Set a strong custom password to secure the Nordhem Atelier Studio against unauthorized
              edits and uploads.
            </p>

            <form
              onSubmit={handleSaveNewPassword}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl"
            >
              <div>
                <label className="eyebrow block mb-1">New Custom Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="field text-xs font-mono"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="field text-xs font-mono"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="btn-solid py-2.5 px-5 text-xs cursor-pointer flex-1"
                >
                  Save Password
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Default factory password: <code>1234</code>
              </span>
              <button
                type="button"
                onClick={handleResetPasswordToDefault}
                className="text-clay hover:underline cursor-pointer"
              >
                Reset Password to Default (1234)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-clay" />
                <h3 className="text-lg font-light text-foreground font-display">
                  JSON Database Backup
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Download a full JSON snapshot of all {products.length} garments, lookbook campaigns,
                and orders.
              </p>
              <button
                onClick={handleExportBackup}
                className="btn-solid py-2 px-5 text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-5 w-5 text-clay" />
                <h3 className="text-lg font-light text-foreground font-display">
                  CSV Catalog Export
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Export garment specifications, prices, sizing, and descriptions into Excel/CSV
                format.
              </p>
              <button
                onClick={handleExportCSV}
                className="btn-outline py-2 px-5 text-xs flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5 text-clay" />
                <h3 className="text-lg font-light text-foreground font-display">
                  Restore Database
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Restore or batch upload catalog products from a previously exported JSON backup
                file.
              </p>
              <input
                ref={backupImportRef}
                type="file"
                accept=".json"
                onChange={handleImportBackupFile}
                className="hidden"
              />
              <button
                onClick={() => backupImportRef.current?.click()}
                className="btn-outline py-2 px-5 text-xs flex items-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Select Backup JSON
              </button>
            </div>
          </div>

          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-light text-foreground flex items-center gap-2 font-display">
                  <Database className="h-5 w-5 text-clay" />
                  Supabase Cloud PostgreSQL Adapter
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Replicate your Scandinavian atelier database into a high-availability cloud
                  PostgreSQL cluster.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlSchema(!showSqlSchema)}
                className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5" />
                {showSqlSchema ? "Hide SQL Migration" : "View SQL Migration"}
              </button>
            </div>

            {showSqlSchema && (
              <div className="mb-6 rounded-xs bg-secondary/80 p-4 text-xs font-mono border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">PostgreSQL Setup Script:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateSupabaseSchemaSQL());
                      toast.success("SQL Schema copied to clipboard!");
                    }}
                    className="text-clay hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    Copy SQL
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-60 text-muted-foreground">
                  {generateSupabaseSchemaSQL()}
                </pre>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="eyebrow block mb-1">Supabase Project URL</label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="field text-xs font-mono"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Supabase Anon Public Key</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="field text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-2">
                <button type="submit" className="btn-solid py-2 px-6 text-xs cursor-pointer">
                  Save Cloud Configuration
                </button>
              </div>
            </form>
          </div>

          <div className="border border-border bg-card p-6">
            <h3 className="text-lg font-light text-foreground mb-4 font-display">
              Factory Catalog Reset
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Revert all pieces, prices, and lookbooks back to original Scandinavian seed data.
            </p>
            <button
              type="button"
              onClick={handleResetCatalog}
              className="btn-outline py-2 px-4 text-xs border-destructive text-destructive hover:bg-destructive hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset to Nordic Seed Data
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {showNewPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-w-md w-full border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-clay" />
                <h3 className="text-base font-medium text-foreground">Change Admin Password</h3>
              </div>
              <button
                onClick={() => setShowNewPasswordModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="mt-4 space-y-4">
              <div>
                <label className="eyebrow block mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new custom password"
                  className="field text-xs font-mono border-clay"
                  autoFocus
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="field text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPasswordModal(false)}
                  className="btn-outline py-2 px-4 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-solid py-2 px-5 text-xs cursor-pointer">
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
