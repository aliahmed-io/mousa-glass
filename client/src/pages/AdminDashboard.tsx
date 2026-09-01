import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, Star, Plus, Edit, Trash2,
  CheckCircle, XCircle, Loader2, ArrowRight, ExternalLink, Search,
  AlertTriangle, Phone, MessageCircle, Layers, Banknote, Smartphone,
  ShieldCheck, RefreshCw, Eye, EyeOff, Sparkles, Filter, Check, Clock,
  FileSpreadsheet, Download, Printer
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const PRESET_IMAGES = [
  { label: "مقبض باب زجاجي", url: "/images/glass-door-product_113bd9cd.jpg" },
  { label: "اكسسوارات دوش", url: "/images/glass-shower_83a35009.jpg" },
  { label: "كوالين وأقفال", url: "/images/glass-products-hero_79a48c05.jpg" },
  { label: "مفصلات وماكينات", url: "/images/category-banner_dbe4fbaa.jpg" },
  { label: "قطع ومسامير تركيب", url: "/images/about-section_2b2aaa4a (1).jpg" },
  { label: "ألواح زجاج سيكوريت", url: "/images/glass-products-hero_91b8e903.jpg" },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filter & Search states
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  const [reviewStatusFilter, setReviewStatusFilter] = useState<"all" | "pending" | "approved">("all");

  // Modals state
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);

  const [inspectOrder, setInspectOrder] = useState<any>(null);

  // Forms state
  const [productForm, setProductForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: 0,
    salePrice: undefined as number | undefined,
    stock: 10,
    categoryId: 1,
    image: PRESET_IMAGES[0]?.url || "",
    sku: "",
    isActive: true,
    isFeatured: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    icon: "Folder",
    image: PRESET_IMAGES[0]?.url || "",
  });

  // Queries with React Query utils
  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: products, isLoading: productsLoading } = trpc.products.all.useQuery(undefined, { enabled: isAuthenticated });
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.listWithCount.useQuery(undefined, { enabled: isAuthenticated });
  const { data: orders, isLoading: ordersLoading } = trpc.orders.all.useQuery(undefined, { enabled: isAuthenticated });
  const { data: reviews, isLoading: reviewsLoading } = trpc.reviews.all.useQuery(undefined, { enabled: isAuthenticated });

  // Invalidate all related queries to keep storefront & admin in sync
  const invalidateAll = () => {
    utils.admin.stats.invalidate();
    utils.products.all.invalidate();
    utils.products.list.invalidate();
    utils.products.featured.invalidate();
    utils.categories.list.invalidate();
    utils.categories.listWithCount.invalidate();
    utils.orders.all.invalidate();
    utils.reviews.all.invalidate();
  };

  // Product Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم إضافة المنتج بنجاح وتحديث المتجر");
      setCreateProductOpen(false);
      setProductForm({
        name: "", nameAr: "", description: "", descriptionAr: "",
        price: 0, salePrice: undefined, stock: 10, categoryId: 1,
        image: PRESET_IMAGES[0]?.url || "", sku: "", isActive: true, isFeatured: false
      });
    },
    onError: (err) => toast.error(err.message || "حدث خطأ أثناء إضافة المنتج"),
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم تحديث بيانات المنتج وتحديث المتجر فوراً");
      setEditProduct(null);
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في التحديث"),
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم حذف المنتج بنجاح");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ أثناء الحذف"),
  });

  // Category Mutations
  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم إنشاء الفئة الجديدة بنجاح");
      setCreateCategoryOpen(false);
      setCategoryForm({ name: "", nameAr: "", description: "", icon: "Folder", image: PRESET_IMAGES[0]?.url || "" });
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في إنشاء الفئة"),
  });

  const updateCategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم تعديل الفئة بنجاح");
      setEditCategory(null);
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في تعديل الفئة"),
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم حذف الفئة بنجاح");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في حذف الفئة"),
  });

  // Order Mutations
  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم تحديث حالة الطلب بنجاح");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في تحديث الطلب"),
  });

  // Review Mutations
  const approveReviewMutation = trpc.reviews.approve.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم تعديل حالة التقييم وتحديث متوسط التقييم للمنتج");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });

  const deleteReviewMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم حذف التقييم وإعادة احتساب تقييم المنتج");
    },
    onError: (err) => toast.error(err.message || "حدث خطأ"),
  });

  // Seed Data Mutation
  const seedMutation = trpc.admin.seed.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("تم تطبيق البيانات التجريبية بنجاح");
    },
    onError: () => toast.error("حدث خطأ في إضافة البيانات التجريبية"),
  });

  // Status mapping
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    processing: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    shipped: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    delivered: "bg-green-500/20 text-green-400 border border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    processing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => {
      const matchSearch = productSearch === "" ||
        p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));

      const matchCategory = productCategoryFilter === "all" || p.categoryId === Number(productCategoryFilter);

      const matchStock =
        productStockFilter === "all" ? true :
        productStockFilter === "in_stock" ? p.stock > 5 :
        productStockFilter === "low_stock" ? p.stock > 0 && p.stock <= 5 :
        p.stock === 0;

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) => {
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const matchSearch = orderSearch === "" ||
        String(o.id).includes(orderSearch) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.filter((r: any) => {
      if (reviewStatusFilter === "all") return true;
      if (reviewStatusFilter === "approved") return r.isApproved;
      if (reviewStatusFilter === "pending") return !r.isApproved;
      return true;
    });
  }, [reviews, reviewStatusFilter]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => p.stock <= 5);
  }, [products]);

  // WhatsApp link generator
  const getWhatsAppLink = (phone: string, orderId: number, customerName: string, total: number) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const intPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `مرحباً ${customerName}، نتواصل معك بخصوص طلبك رقم #${orderId} بقيمة ${total} ج.م من موسى للزجاج والاكسسوارات.`
    );
    return `https://wa.me/${intPhone}?text=${text}`;
  };

  // Export Orders to CSV / Excel with UTF-8 BOM for Arabic support
  const exportOrdersToCSV = (targetOrders: any[]) => {
    if (!targetOrders || targetOrders.length === 0) {
      toast.error("لا توجد طلبات لتصديرها");
      return;
    }

    const headers = [
      "رقم الطلب",
      "اسم العميل",
      "رقم الهاتف",
      "البريد الإلكتروني",
      "عنوان الشحن",
      "المدينة / المحافظة",
      "طريقة الدفع",
      "حالة الطلب",
      "المجموع الفرعي (ج.م)",
      "رسوم الشحن (ج.م)",
      "المبلغ الإجمالي (ج.م)",
      "الأصناف المطلوبة",
      "ملاحظات العميل",
      "تاريخ ووقت الطلب",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = targetOrders.map((o) => {
      const itemsSummary = (o.items || [])
        .map((it: any) => `${it.nameAr || it.name} (${it.quantity}x ${it.price} ج.م)`)
        .join(" + ");

      const paymentLabel = o.paymentMethod === "instapay" ? "انستاباي مع المندوب" : "نقداً عند الاستلام (COD)";
      const statusLabel = statusLabels[o.status] || o.status;
      const subtotal = (o.total || 0) - (o.shippingFee || 0);
      const dateFormatted = new Date(o.createdAt).toLocaleString("ar-EG");

      return [
        escapeCSV(o.id),
        escapeCSV(o.customerName),
        escapeCSV(o.customerPhone),
        escapeCSV(o.customerEmail || "—"),
        escapeCSV(o.shippingAddress),
        escapeCSV(o.city || "القاهرة"),
        escapeCSV(paymentLabel),
        escapeCSV(statusLabel),
        escapeCSV(subtotal.toFixed(2)),
        escapeCSV((o.shippingFee || 0).toFixed(2)),
        escapeCSV((o.total || 0).toFixed(2)),
        escapeCSV(itemsSummary || "—"),
        escapeCSV(o.notes || "—"),
        escapeCSV(dateFormatted),
      ].join(",");
    });

    // UTF-8 BOM (\uFEFF) ensures Excel opens Arabic correctly
    const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `mousa-glass-orders-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`تم تصدير ${targetOrders.length} طلب إلى ملف Excel / CSV بنجاح`);
  };

  // Print Order Invoice & Waybill
  const printOrderInvoice = (order: any) => {
    if (!order) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة");
      return;
    }

    const itemsRows = (order.items || []).map((it: any, idx: number) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${it.nameAr || it.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${it.price} ج.م</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold;">${(it.quantity * it.price).toFixed(2)} ج.م</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>فاتورة وبوليصة طلب #${order.id} - موسى للزجاج</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #111; direction: rtl; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 24px; font-weight: bold; color: #111; }
          .logo span { color: #D4AF37; }
          .invoice-title { font-size: 20px; font-weight: bold; color: #333; text-align: left; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #111; color: #fff; padding: 12px 10px; font-size: 14px; text-align: right; }
          .totals { margin-right: auto; width: 320px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .totals-row.grand { font-size: 18px; font-weight: bold; color: #111; border-top: 2px solid #D4AF37; margin-top: 8px; padding-top: 8px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">موسى <span>للزجاج والاكسسوارات</span><br><small style="font-size: 12px; color: #666;">Mousa Glass Luxury Hardware</small></div>
          <div class="invoice-title">بوليصة وفاتورة شحن<br><span style="color: #D4AF37; font-size: 18px;">#${order.id}</span></div>
        </div>
        <div class="details-grid">
          <div>
            <p style="margin: 4px 0;"><strong>اسم العميل:</strong> ${order.customerName}</p>
            <p style="margin: 4px 0;"><strong>رقم الهاتف:</strong> ${order.customerPhone}</p>
            <p style="margin: 4px 0;"><strong>عنوان التوصيل:</strong> ${order.shippingAddress} (${order.city || "القاهرة"})</p>
            ${order.notes ? `<p style="margin: 4px 0;"><strong>ملاحظات:</strong> ${order.notes}</p>` : ''}
          </div>
          <div>
            <p style="margin: 4px 0;"><strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleDateString("ar-EG")} - ${new Date(order.createdAt).toLocaleTimeString("ar-EG")}</p>
            <p style="margin: 4px 0;"><strong>طريقة الدفع:</strong> <span style="font-weight: bold; color: #D4AF37;">${order.paymentMethod === "instapay" ? "انستاباي مع المندوب" : "نقداً عند الاستلام (COD)"}</span></p>
            <p style="margin: 4px 0;"><strong>حالة الطلب:</strong> ${statusLabels[order.status] || order.status}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">م</th>
              <th>المنتج / الصنف</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: center;">سعر الوحدة</th>
              <th style="text-align: center;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-row">
            <span>المجموع الفرعي:</span>
            <span>${((order.total || 0) - (order.shippingFee || 0)).toFixed(2)} ج.م</span>
          </div>
          <div class="totals-row">
            <span>تكلفة الشحن والتوصيل:</span>
            <span>${order.shippingFee === 0 ? "مجاني" : `${order.shippingFee} ج.م`}</span>
          </div>
          <div class="totals-row grand">
            <span>المبلغ الإجمالي المطلوب:</span>
            <span>${(order.total || 0).toFixed(2)} ج.م</span>
          </div>
        </div>
        <div class="footer">
          <p>شكراً لتعاملكم مع موسى للزجاج والاكسسوارات | خدمة العملاء: 01020848619 | الدفع عند الاستلام</p>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <p className="text-muted-foreground text-sm">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-border">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">منطقة الإدارة محمية</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {!isAuthenticated
              ? "يرجى تسجيل الدخول بحساب المدير للوصول للوحة التحكم."
              : "حسابك الحالي لا يمتلك صلاحية المدير. يرجى التواصل مع الإدارة."}
          </p>
          <Button onClick={() => navigate("/")} className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold w-full">
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-10 pt-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gold-gradient font-display">لوحة التحكم والإدارة</h1>
              <Badge className="bg-gold/20 text-gold border-gold/40 text-xs">مسؤول النظام</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              إدارة المنتجات، الفئات، الطلبات والتقييمات مع مزامنة لحظية للمتجر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/shop"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:border-gold/50 text-sm font-medium transition-all"
            >
              <ExternalLink className="w-4 h-4 text-gold" />
              <span>معاينة المتجر</span>
            </Link>

            <Button
              onClick={() => {
                setProductForm({
                  name: "", nameAr: "", description: "", descriptionAr: "",
                  price: 0, salePrice: undefined, stock: 10, categoryId: categories?.[0]?.id || 1,
                  image: PRESET_IMAGES[0]?.url || "", sku: "", isActive: true, isFeatured: false
                });
                setCreateProductOpen(true);
              }}
              className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold text-sm shadow-sm shadow-gold/20"
            >
              <Plus className="w-4 h-4 ml-1" /> إضافة منتج
            </Button>

            <Button
              onClick={() => {
                setCategoryForm({ name: "", nameAr: "", description: "", icon: "Folder", image: PRESET_IMAGES[0]?.url || "" });
                setCreateCategoryOpen(true);
              }}
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10 text-sm font-bold"
            >
              <Layers className="w-4 h-4 ml-1" /> إضافة فئة
            </Button>

            <Button
              onClick={() => seedMutation.mutate()}
              variant="ghost"
              size="sm"
              disabled={seedMutation.isPending}
              className="text-muted-foreground hover:text-gold text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ml-1 ${seedMutation.isPending ? "animate-spin" : ""}`} />
              بيانات تجريبية
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-card border border-border/80 p-1 flex flex-wrap h-auto w-full md:w-fit rounded-xl gap-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a] font-bold rounded-lg px-4 py-2">
              <LayoutDashboard className="w-4 h-4 ml-2" />
              المؤشرات العامة
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a] font-bold rounded-lg px-4 py-2">
              <Package className="w-4 h-4 ml-2" />
              إدارة المنتجات ({products?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a] font-bold rounded-lg px-4 py-2">
              <Layers className="w-4 h-4 ml-2" />
              إدارة الفئات ({categories?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a] font-bold rounded-lg px-4 py-2">
              <ShoppingCart className="w-4 h-4 ml-2" />
              الطلبات ({orders?.length ?? 0})
              {(stats?.pendingOrders ?? 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a] font-bold rounded-lg px-4 py-2">
              <Star className="w-4 h-4 ml-2" />
              التقييمات ({reviews?.length ?? 0})
              {(stats?.unapprovedReviews ?? 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* 6 Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Card 1: Revenue */}
              <div className="glass-card rounded-2xl p-5 gold-glow border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">إجمالي الإيرادات</span>
                  <Banknote className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-bold text-gold font-display">{stats?.revenue?.toLocaleString() ?? 0} <span className="text-xs font-normal">ج.م</span></p>
                <span className="text-[11px] text-muted-foreground">باستثناء الطلبات الملغاة</span>
              </div>

              {/* Card 2: Total Orders */}
              <div className="glass-card rounded-2xl p-5 gold-glow border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">إجمالي الطلبات</span>
                  <ShoppingCart className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-bold text-foreground font-display">{stats?.orders ?? 0}</p>
                <span className="text-[11px] text-muted-foreground">كل الطلبات المسجلة</span>
              </div>

              {/* Card 3: Pending Orders */}
              <div className="glass-card rounded-2xl p-5 border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-yellow-400 font-medium">بانتظار التأكيد</span>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400 font-display">{stats?.pendingOrders ?? 0}</p>
                <span className="text-[11px] text-yellow-400/80">تحتاج اتخاذ إجراء</span>
              </div>

              {/* Card 4: Products */}
              <div className="glass-card rounded-2xl p-5 gold-glow border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">إجمالي المنتجات</span>
                  <Package className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-bold text-foreground font-display">{stats?.products ?? 0}</p>
                <span className="text-[11px] text-muted-foreground">في الكتالوج</span>
              </div>

              {/* Card 5: Low Stock */}
              <div className="glass-card rounded-2xl p-5 border border-red-500/30 bg-red-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-red-400 font-medium">تنبيه المخزون</span>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400 font-display">
                  {(stats?.lowStock ?? 0) + (stats?.outOfStock ?? 0)}
                </p>
                <span className="text-[11px] text-red-400/80">
                  {stats?.outOfStock ?? 0} نفذ / {stats?.lowStock ?? 0} منخفض
                </span>
              </div>

              {/* Card 6: Pending Reviews */}
              <div className="glass-card rounded-2xl p-5 gold-glow border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">تقييمات للمراجعة</span>
                  <Star className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-bold text-foreground font-display">{stats?.unapprovedReviews ?? 0}</p>
                <span className="text-[11px] text-muted-foreground">بانتظار الموافقة</span>
              </div>
            </div>

            {/* Inventory Alerts Section */}
            {lowStockProducts.length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    <span>تنبيه: منتجات بحاجة لإعادة تعبئة المخزون ({lowStockProducts.length})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setActiveTab("products"); setProductStockFilter("low_stock"); }}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                  >
                    عرض الكل في المنتجات
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockProducts.slice(0, 3).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.nameAr} className="w-10 h-10 rounded-lg object-cover bg-background" />
                        <div>
                          <p className="text-sm font-semibold text-foreground truncate max-w-[150px]">{p.nameAr}</p>
                          <p className="text-xs text-muted-foreground">SKU: {p.sku || "—"}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={p.stock === 0 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
                          {p.stock === 0 ? "نفذ المخزون" : `متبقي ${p.stock}`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Section */}
            <div className="glass-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">أحدث طلبات الشراء</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("orders")}
                  className="border-gold/40 text-gold hover:bg-gold/10 text-xs"
                >
                  عرض جميع الطلبات
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                      <th className="pb-3 px-3">رقم الطلب</th>
                      <th className="pb-3 px-3">العميل</th>
                      <th className="pb-3 px-3">المبلغ</th>
                      <th className="pb-3 px-3">طريقة الدفع</th>
                      <th className="pb-3 px-3">الحالة</th>
                      <th className="pb-3 px-3">التاريخ</th>
                      <th className="pb-3 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {orders?.slice(0, 5).map((order: any) => (
                      <tr key={order.id} className="hover:bg-card/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gold">#{order.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </td>
                        <td className="py-3 px-3 font-bold text-foreground">{order.total} ج.م</td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">
                          {order.paymentMethod === "instapay" ? "انستاباي مع المندوب" : "كاش عند الاستلام"}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={statusColors[order.status] || ""}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectOrder(order)}
                            className="text-gold hover:bg-gold/10 text-xs"
                          >
                            معاينة
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!orders || orders.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات مسجلة بعد</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================= TAB 2: PRODUCTS MANAGEMENT ================= */}
          <TabsContent value="products" className="space-y-6">
            {/* Filter & Search Toolbar */}
            <div className="glass-card rounded-2xl p-4 border border-border flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex-1 w-full relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث باسم المنتج أو الكود SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pr-9 bg-card border-border text-foreground"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                  <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={productStockFilter} onValueChange={(val: any) => setProductStockFilter(val)}>
                  <SelectTrigger className="w-[150px] bg-card border-border text-foreground">
                    <SelectValue placeholder="المخزون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>
                    <SelectItem value="in_stock">متوفر (&gt;5)</SelectItem>
                    <SelectItem value="low_stock">مخزون منخفض (1-5)</SelectItem>
                    <SelectItem value="out_of_stock">نفذ المخزون (0)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setCreateProductOpen(true)}
                  className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
                >
                  <Plus className="w-4 h-4 ml-1" /> إضافة منتج
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <div className="glass-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/60 text-muted-foreground text-xs font-semibold">
                      <th className="py-3 px-4">المنتج</th>
                      <th className="py-3 px-4">السعر</th>
                      <th className="py-3 px-4">المخزون</th>
                      <th className="py-3 px-4">التقييم</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">مميز</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-card/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.nameAr}
                              className="w-12 h-12 rounded-lg object-cover bg-card shrink-0 border border-border"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/50/111111/D4AF37"; }}
                            />
                            <div>
                              <p className="font-bold text-foreground">{p.nameAr}</p>
                              <p className="text-xs text-muted-foreground font-mono">{p.sku || "بدون كود"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gold">{p.price} ج.م</span>
                          {p.salePrice && (
                            <span className="text-xs text-muted-foreground line-through mr-1.5">{p.salePrice} ج.م</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {p.stock === 0 ? (
                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">نفذ المخزون</Badge>
                          ) : p.stock <= 5 ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">منخفض ({p.stock})</Badge>
                          ) : (
                            <span className="text-foreground font-medium">{p.stock} قطعة</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                            <span className="font-bold text-foreground">{p.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateProductMutation.mutate({ id: p.id, isActive: !p.isActive })}
                            className="p-1 h-auto"
                          >
                            {p.isActive ? (
                              <Badge className="bg-green-500/20 text-green-400 cursor-pointer hover:opacity-80">نشط</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 cursor-pointer hover:opacity-80">معطل</Badge>
                            )}
                          </Button>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateProductMutation.mutate({ id: p.id, isFeatured: !p.isFeatured })}
                            className="p-1 h-auto"
                          >
                            {p.isFeatured ? (
                              <Badge className="bg-gold/20 text-gold border border-gold/40 cursor-pointer">مميز</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditProduct(p)}
                              className="text-muted-foreground hover:text-gold"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف المنتج "${p.nameAr}"؟`)) {
                                  deleteProductMutation.mutate({ id: p.id });
                                }
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">لا توجد منتجات مطابقة لخيارات البحث</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================= TAB 3: CATEGORIES MANAGEMENT ================= */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">فئات واقسام المتجر</h3>
                <p className="text-muted-foreground text-xs">إدارة الأقسام وتوزيع المنتجات في الكتالوج</p>
              </div>
              <Button
                onClick={() => {
                  setCategoryForm({ name: "", nameAr: "", description: "", icon: "Folder", image: PRESET_IMAGES[0]?.url || "" });
                  setCreateCategoryOpen(true);
                }}
                className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
              >
                <Plus className="w-4 h-4 ml-1" /> إضافة فئة جديدة
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((cat: any) => (
                <div key={cat.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-gold/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
                        فئة #{cat.id}
                      </span>
                      <Badge className="bg-card text-foreground border border-border">
                        {cat.productCount ?? 0} منتجات
                      </Badge>
                    </div>

                    <h4 className="font-bold text-lg text-foreground mb-1">{cat.nameAr}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{cat.name}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 mb-4">
                      {cat.description || "لا يوجد وصف لهذه الفئة"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">أيقونة: {cat.icon || "Default"}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditCategory(cat)}
                        className="text-muted-foreground hover:text-gold text-xs"
                      >
                        <Edit className="w-4 h-4 ml-1" /> تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if ((cat.productCount ?? 0) > 0) {
                            if (!confirm(`تنبيه: يوجد ${cat.productCount} منتج مرتبط بهذه الفئة. هل أنت متأكد من حذفها؟`)) return;
                          } else {
                            if (!confirm(`هل أنت متأكد من حذف الفئة "${cat.nameAr}"؟`)) return;
                          }
                          deleteCategoryMutation.mutate({ id: cat.id });
                        }}
                        className="text-destructive hover:bg-destructive/10 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ================= TAB 4: ORDERS MANAGEMENT ================= */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filter Tabs & Search & Export */}
            <div className="glass-card rounded-2xl p-4 border border-border flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex-1 w-full relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث برقم الطلب، اسم العميل أو الهاتف..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pr-9 bg-card border-border text-foreground"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={orderStatusFilter === st ? "default" : "outline"}
                    onClick={() => setOrderStatusFilter(st)}
                    className={orderStatusFilter === st ? "bg-gold text-[#0a0a0a] font-bold text-xs" : "border-border text-foreground text-xs"}
                  >
                    {st === "all" ? "الكل" : statusLabels[st] || st}
                  </Button>
                ))}

                {/* Export Orders to CSV / Excel button */}
                <Button
                  onClick={() => exportOrdersToCSV(filteredOrders.length > 0 ? filteredOrders : (orders || []))}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-emerald-900/30 mr-1"
                  title="تصدير الطلبات المعروضة إلى ملف Excel / CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تصدير Excel ({filteredOrders.length})</span>
                </Button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="glass-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/60 text-muted-foreground text-xs font-semibold">
                      <th className="py-3 px-4">رقم الطلب</th>
                      <th className="py-3 px-4">بيانات العميل</th>
                      <th className="py-3 px-4">المبلغ الإجمالي</th>
                      <th className="py-3 px-4">طريقة الدفع</th>
                      <th className="py-3 px-4">حالة الطلب</th>
                      <th className="py-3 px-4">تاريخ الطلب</th>
                      <th className="py-3 px-4 text-center">إجراءات سريعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-card/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gold">#{order.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone} ({order.city || "القاهرة"})</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gold">{order.total} ج.م</span>
                          {order.shippingFee === 0 ? (
                            <span className="text-[11px] text-green-400 block">شحن مجاني</span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground block">+ {order.shippingFee} شحن</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {order.paymentMethod === "instapay" ? (
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">انستاباي مع المندوب</Badge>
                          ) : (
                            <Badge className="bg-gold/10 text-gold border border-gold/30">كاش عند الاستلام</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) => updateOrderStatusMutation.mutate({ id: order.id, status: newStatus as any })}
                          >
                            <SelectTrigger className={`h-8 text-xs font-semibold ${statusColors[order.status] || ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 1-Click WhatsApp Quick Chat */}
                            <a
                              href={getWhatsAppLink(order.customerPhone, order.id, order.customerName, order.total)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                              title="محادثة واتساب سريعة"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* 1-Click Phone Call */}
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                              title="اتصال هاتف"
                            >
                              <Phone className="w-4 h-4" />
                            </a>

                            {/* Inspect Details */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setInspectOrder(order)}
                              className="text-gold hover:bg-gold/10 text-xs px-2"
                            >
                              معاينة
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">لا توجد طلبات مطابقة</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================= TAB 5: REVIEWS MODERATION ================= */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">مراجعة التقييمات</h3>
                <p className="text-muted-foreground text-xs">قبول أو حجب آراء وتقييمات العملاء مع تحديث متوسط تقييم المنتجات آلياً</p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={reviewStatusFilter === "all" ? "default" : "outline"}
                  onClick={() => setReviewStatusFilter("all")}
                  className={reviewStatusFilter === "all" ? "bg-gold text-[#0a0a0a] text-xs font-bold" : "border-border text-xs"}
                >
                  الكل ({reviews?.length ?? 0})
                </Button>
                <Button
                  size="sm"
                  variant={reviewStatusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setReviewStatusFilter("pending")}
                  className={reviewStatusFilter === "pending" ? "bg-gold text-[#0a0a0a] text-xs font-bold" : "border-border text-xs"}
                >
                  قيد المراجعة ({reviews?.filter((r: any) => !r.isApproved).length ?? 0})
                </Button>
                <Button
                  size="sm"
                  variant={reviewStatusFilter === "approved" ? "default" : "outline"}
                  onClick={() => setReviewStatusFilter("approved")}
                  className={reviewStatusFilter === "approved" ? "bg-gold text-[#0a0a0a] text-xs font-bold" : "border-border text-xs"}
                >
                  المعتمدة ({reviews?.filter((r: any) => r.isApproved).length ?? 0})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((review: any) => (
                <div key={review.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {review.product?.image && (
                          <img
                            src={review.product.image}
                            alt={review.product.nameAr}
                            className="w-12 h-12 rounded-lg object-cover bg-card border border-border"
                          />
                        )}
                        <div>
                          <p className="font-bold text-foreground text-sm">{review.product?.nameAr || `منتج #${review.productId}`}</p>
                          <p className="text-xs text-muted-foreground">{review.user?.name || review.customerName || "عميل زائر"}</p>
                        </div>
                      </div>

                      <Badge className={review.isApproved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                        {review.isApproved ? "معتمد" : "قيد المراجعة"}
                      </Badge>
                    </div>

                    {/* Rating stars */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i <= review.rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground mr-2">
                        {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    {/* Comment text */}
                    <p className="text-sm text-foreground/90 bg-card/60 p-3 rounded-xl border border-border/50 leading-relaxed mb-4">
                      {review.commentAr || review.comment || "بدون تعليق مكتوب"}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveReviewMutation.mutate({ id: review.id, isApproved: !review.isApproved })}
                      className={review.isApproved ? "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs" : "border-green-500/40 text-green-400 hover:bg-green-500/10 text-xs font-bold"}
                    >
                      {review.isApproved ? <EyeOff className="w-3.5 h-3.5 ml-1" /> : <Eye className="w-3.5 h-3.5 ml-1" />}
                      {review.isApproved ? "حجب التقييم" : "اعتماد ونشر"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذا التقييم نهائياً؟")) {
                          deleteReviewMutation.mutate({ id: review.id });
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {filteredReviews.length === 0 && (
              <p className="text-center text-muted-foreground py-12">لا توجد تقييمات مطابقة</p>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ================= MODAL 1: CREATE PRODUCT ================= */}
      <Dialog open={createProductOpen} onOpenChange={setCreateProductOpen}>
        <DialogContent className="bg-[#0f0f0f] border-border max-w-2xl text-right max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground text-right">إضافة منتج جديد للكتالوج</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الاسم بالعربية *</label>
                <Input
                  value={productForm.nameAr}
                  onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                  placeholder="مثال: مقبض باب زجاجي ذهبي فاخر"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الاسم بالإنجليزية *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Golden Glass Door Handle"
                  className="bg-card border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">السعر (ج.م) *</label>
                <Input
                  type="number"
                  value={productForm.price || ""}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">سعر العرض / الخصم</label>
                <Input
                  type="number"
                  value={productForm.salePrice || ""}
                  onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="اختياري"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الكمية بالمخزون *</label>
                <Input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  className="bg-card border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الفئة والتصنيف *</label>
                <Select
                  value={String(productForm.categoryId)}
                  onValueChange={(val) => setProductForm({ ...productForm, categoryId: Number(val) })}
                >
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">كود المنتج (SKU)</label>
                <Input
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="مثال: HDL-101"
                  className="bg-card border-border text-foreground font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1">الوصف بالعربية</label>
              <Input
                value={productForm.descriptionAr}
                onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                placeholder="وصف تفصيلي للخامة والمقاسات والاستخدام"
                className="bg-card border-border text-foreground"
              />
            </div>

            {/* Preset Image Selector */}
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-2">اختر صورة المنتج أو أدخل رابط مباشر:</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {PRESET_IMAGES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setProductForm({ ...productForm, image: preset.url })}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 aspect-square transition-all ${
                      productForm.image === preset.url ? "border-gold ring-2 ring-gold/40 scale-105" : "border-border hover:border-gold/40"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {productForm.image === preset.url && (
                      <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-gold font-bold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Input
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                placeholder="أو الصق رابط صورة مخصص..."
                className="bg-card border-border text-foreground text-xs"
              />
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="rounded border-border text-gold accent-gold"
                />
                <span>عرض كمنتج مميز بالرئيسية</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  className="rounded border-border text-gold accent-gold"
                />
                <span>تفعيل المنتج بالمتجر</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              onClick={() => {
                if (!productForm.nameAr || !productForm.price) {
                  toast.error("يرجى إدخال اسم المنتج والسعر");
                  return;
                }
                createProductMutation.mutate({
                  name: productForm.name || productForm.nameAr,
                  nameAr: productForm.nameAr,
                  description: productForm.descriptionAr || productForm.description,
                  descriptionAr: productForm.descriptionAr,
                  price: productForm.price,
                  salePrice: productForm.salePrice,
                  stock: productForm.stock,
                  categoryId: productForm.categoryId,
                  image: productForm.image || PRESET_IMAGES[0]?.url || "",
                  sku: productForm.sku,
                  isActive: productForm.isActive,
                  isFeatured: productForm.isFeatured,
                });
              }}
              className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "جاري الإنشاء..." : "حفظ وإنشاء المنتج"}
            </Button>
            <Button variant="ghost" onClick={() => setCreateProductOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: EDIT PRODUCT ================= */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="bg-[#0f0f0f] border-border max-w-2xl text-right max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground text-right">تعديل المنتج: {editProduct?.nameAr}</DialogTitle>
          </DialogHeader>

          {editProduct && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">الاسم بالعربية</label>
                  <Input
                    value={editProduct.nameAr}
                    onChange={(e) => setEditProduct({ ...editProduct, nameAr: e.target.value })}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">الاسم بالإنجليزية</label>
                  <Input
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="bg-card border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">السعر (ج.م)</label>
                  <Input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">سعر العرض / الخصم</label>
                  <Input
                    type="number"
                    value={editProduct.salePrice || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, salePrice: e.target.value ? Number(e.target.value) : null })}
                    placeholder="اختياري"
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">المخزون الحالي</label>
                  <Input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                    className="bg-card border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">الفئة</label>
                  <Select
                    value={String(editProduct.categoryId)}
                    onValueChange={(val) => setEditProduct({ ...editProduct, categoryId: Number(val) })}
                  >
                    <SelectTrigger className="bg-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs text-foreground/80 font-medium mb-1">كود المنتج (SKU)</label>
                  <Input
                    value={editProduct.sku || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                    className="bg-card border-border text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الوصف بالعربية</label>
                <Input
                  value={editProduct.descriptionAr || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, descriptionAr: e.target.value })}
                  className="bg-card border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-2">تحديث صورة المنتج:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setEditProduct({ ...editProduct, image: preset.url })}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 aspect-square transition-all ${
                        editProduct.image === preset.url ? "border-gold ring-2 ring-gold/40 scale-105" : "border-border hover:border-gold/40"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <Input
                  value={editProduct.image}
                  onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                  className="bg-card border-border text-foreground text-xs"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct.isFeatured}
                    onChange={(e) => setEditProduct({ ...editProduct, isFeatured: e.target.checked })}
                    className="rounded border-border text-gold accent-gold"
                  />
                  <span>منتج مميز</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct.isActive}
                    onChange={(e) => setEditProduct({ ...editProduct, isActive: e.target.checked })}
                    className="rounded border-border text-gold accent-gold"
                  />
                  <span>نشط بالمتجر</span>
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              onClick={() => {
                updateProductMutation.mutate({
                  id: editProduct.id,
                  name: editProduct.name,
                  nameAr: editProduct.nameAr,
                  description: editProduct.description,
                  descriptionAr: editProduct.descriptionAr,
                  price: editProduct.price,
                  salePrice: editProduct.salePrice,
                  stock: editProduct.stock,
                  categoryId: editProduct.categoryId,
                  image: editProduct.image,
                  sku: editProduct.sku,
                  isActive: editProduct.isActive,
                  isFeatured: editProduct.isFeatured,
                });
              }}
              className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
            <Button variant="ghost" onClick={() => setEditProduct(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 3: CREATE CATEGORY ================= */}
      <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
        <DialogContent className="bg-[#0f0f0f] border-border max-w-lg text-right">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground text-right">إضافة فئة جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1">اسم الفئة بالعربية *</label>
              <Input
                value={categoryForm.nameAr}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                placeholder="مثال: كوالين وأقفال زجاج"
                className="bg-card border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1">اسم الفئة بالإنجليزية *</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Glass Locks"
                className="bg-card border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1">وصف الفئة</label>
              <Input
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="وصف مختصر للأصناف التابعة لهذه الفئة"
                className="bg-card border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/80 font-medium mb-1">رمز الأيقونة (Lucide Icon)</label>
              <Input
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="DoorOpen, Lock, ShowerHead, GripHorizontal, etc."
                className="bg-card border-border text-foreground font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              onClick={() => {
                if (!categoryForm.nameAr || !categoryForm.name) {
                  toast.error("يرجى ملء اسم الفئة بالعربية والإنجليزية");
                  return;
                }
                createCategoryMutation.mutate(categoryForm);
              }}
              className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "جاري الإنشاء..." : "إنشاء الفئة"}
            </Button>
            <Button variant="ghost" onClick={() => setCreateCategoryOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 4: EDIT CATEGORY ================= */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent className="bg-[#0f0f0f] border-border max-w-lg text-right">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground text-right">تعديل الفئة: {editCategory?.nameAr}</DialogTitle>
          </DialogHeader>

          {editCategory && (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الاسم بالعربية</label>
                <Input
                  value={editCategory.nameAr}
                  onChange={(e) => setEditCategory({ ...editCategory, nameAr: e.target.value })}
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الاسم بالإنجليزية</label>
                <Input
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الوصف</label>
                <Input
                  value={editCategory.description || ""}
                  onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/80 font-medium mb-1">الأيقونة</label>
                <Input
                  value={editCategory.icon || ""}
                  onChange={(e) => setEditCategory({ ...editCategory, icon: e.target.value })}
                  className="bg-card border-border text-foreground font-mono text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              onClick={() => {
                updateCategoryMutation.mutate({
                  id: editCategory.id,
                  name: editCategory.name,
                  nameAr: editCategory.nameAr,
                  description: editCategory.description,
                  icon: editCategory.icon,
                  image: editCategory.image,
                });
              }}
              className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
            <Button variant="ghost" onClick={() => setEditCategory(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 5: INSPECT ORDER ================= */}
      <Dialog open={!!inspectOrder} onOpenChange={() => setInspectOrder(null)}>
        <DialogContent className="bg-[#0f0f0f] border-border max-w-2xl text-right max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground text-right">
                تفاصيل الطلب <span className="text-gold font-mono">#{inspectOrder?.id}</span>
              </DialogTitle>
              {inspectOrder && (
                <Badge className={statusColors[inspectOrder.status] || ""}>
                  {statusLabels[inspectOrder.status] || inspectOrder.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {inspectOrder && (
            <div className="space-y-6 py-2">
              {/* Customer Info Card */}
              <div className="glass-card rounded-xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div>
                    <p className="font-bold text-foreground">{inspectOrder.customerName}</p>
                    <p className="text-xs text-muted-foreground">{inspectOrder.customerPhone} {inspectOrder.customerEmail ? `| ${inspectOrder.customerEmail}` : ""}</p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={getWhatsAppLink(inspectOrder.customerPhone, inspectOrder.id, inspectOrder.customerName, inspectOrder.total)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب
                    </a>
                    <a
                      href={`tel:${inspectOrder.customerPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      اتصال
                    </a>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-foreground/80">
                  <p><span className="text-muted-foreground">عنوان الشحن:</span> {inspectOrder.shippingAddress}</p>
                  <p><span className="text-muted-foreground">المدينة:</span> {inspectOrder.city || "القاهرة"}</p>
                  {inspectOrder.notes && (
                    <p><span className="text-muted-foreground">ملاحظات العميل:</span> {inspectOrder.notes}</p>
                  )}
                  <p>
                    <span className="text-muted-foreground">طريقة الدفع:</span>{" "}
                    <span className="text-gold font-semibold">
                      {inspectOrder.paymentMethod === "instapay" ? "انستاباي مع المندوب" : "نقداً عند الاستلام (COD)"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="glass-card rounded-xl p-4 border border-border">
                <h4 className="text-sm font-bold text-foreground mb-3 border-b border-border/50 pb-2">المنتجات المطلوبة:</h4>
                <div className="space-y-2">
                  {inspectOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2.5">
                        {item.image && (
                          <img src={item.image} alt={item.nameAr} className="w-10 h-10 rounded-lg object-cover bg-card border border-border" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.nameAr || item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} × {item.price} ج.م</p>
                        </div>
                      </div>
                      <span className="text-gold font-bold text-sm">{(item.quantity * item.price).toFixed(2)} ج.م</span>
                    </div>
                  ))}
                </div>

                {/* Total breakdown */}
                <div className="border-t border-border pt-3 mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{(inspectOrder.total - inspectOrder.shippingFee).toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم الشحن</span>
                    <span>{inspectOrder.shippingFee === 0 ? "مجاني" : `${inspectOrder.shippingFee} ج.م`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/50">
                    <span>الإجمالي المستحق</span>
                    <span className="text-gold text-base">{inspectOrder.total.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Status Changer */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
                <span className="text-sm font-semibold text-foreground">تعديل حالة الطلب:</span>
                <Select
                  value={inspectOrder.status}
                  onValueChange={(val) => {
                    updateOrderStatusMutation.mutate({ id: inspectOrder.id, status: val as any });
                    setInspectOrder({ ...inspectOrder, status: val });
                  }}
                >
                  <SelectTrigger className={`w-[180px] text-xs font-bold ${statusColors[inspectOrder.status] || ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-between items-center">
            <Button
              onClick={() => printOrderInvoice(inspectOrder)}
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10 font-bold gap-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة وبوليصة الشحن</span>
            </Button>

            <Button onClick={() => setInspectOrder(null)} className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold text-xs">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

