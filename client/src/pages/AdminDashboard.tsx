import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, Star, Plus, Edit, Trash2,
  CheckCircle, XCircle, Loader2, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [editOrderStatus, setEditOrderStatus] = useState<string>("");
  const [createProduct, setCreateProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({ nameAr: "", nameEn: "", descriptionAr: "", price: 0, stock: 0, categoryId: 1, image: "", isFeatured: false, isActive: true });

  // Queries
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: products, refetch: refetchProducts } = trpc.products.all.useQuery(undefined, { enabled: isAuthenticated });
  const { data: orders, refetch: refetchOrders } = trpc.orders.all.useQuery(undefined, { enabled: isAuthenticated });
  const { data: reviews, refetch: refetchReviews } = trpc.reviews.all.useQuery(undefined, { enabled: isAuthenticated });

  // Mutations
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("تم حذف المنتج"); },
    onError: () => toast.error("حدث خطأ"),
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("تم تحديث المنتج"); setEditProduct(null); },
    onError: () => toast.error("حدث خطأ"),
  });

  const updateOrderStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { refetchOrders(); toast.success("تم تحديث حالة الطلب"); setEditOrder(null); },
    onError: () => toast.error("حدث خطأ"),
  });

  const approveReview = trpc.reviews.approve.useMutation({
    onSuccess: () => { refetchReviews(); toast.success("تم تحديث التقييم"); },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteReview = trpc.reviews.delete.useMutation({
    onSuccess: () => { refetchReviews(); toast.success("تم حذف التقييم"); },
    onError: () => toast.error("حدث خطأ"),
  });

  const seedData = trpc.admin.seed.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("تم إضافة البيانات التجريبية"); },
    onError: () => toast.error("حدث خطأ"),
  });

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("تم إنشاء المنتج"); setCreateProduct(false); },
    onError: () => toast.error("حدث خطأ"),
  });

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">غير مصرح بالوصول</h2>
          <p className="text-muted-foreground mb-6">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
          <Button onClick={() => navigate("/")} className="bg-gold text-[#0a0a0a]">
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">لا تملك صلاحية الوصول</h2>
          <p className="text-muted-foreground mb-6">هذه الصفحة متاحة للمدراء فقط</p>
          <Button onClick={() => navigate("/")} className="bg-gold text-[#0a0a0a]">
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    processing: "bg-purple-500/20 text-purple-400",
    shipped: "bg-indigo-500/20 text-indigo-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    processing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setCreateProduct(true)}
              className="bg-gold text-[#0a0a0a] hover:bg-gold-light"
            >
              <Plus className="w-4 h-4 ml-2" /> إضافة منتج
            </Button>
            <Button
              onClick={() => seedData.mutate()}
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10"
            >
              إضافة بيانات تجريبية
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border mb-8">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a]">
              <LayoutDashboard className="w-4 h-4 ml-2" />
              الرئيسية
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a]">
              <Package className="w-4 h-4 ml-2" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a]">
              <ShoppingCart className="w-4 h-4 ml-2" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gold data-[state=active]:text-[#0a0a0a]">
              <Star className="w-4 h-4 ml-2" />
              التقييمات
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card rounded-xl p-6 gold-glow">
                <Package className="w-8 h-8 text-gold mb-3" />
                <p className="text-muted-foreground text-sm">المنتجات</p>
                <p className="text-3xl font-bold text-foreground">{stats?.products ?? 0}</p>
              </div>
              <div className="glass-card rounded-xl p-6 gold-glow">
                <ShoppingCart className="w-8 h-8 text-gold mb-3" />
                <p className="text-muted-foreground text-sm">الطلبات</p>
                <p className="text-3xl font-bold text-foreground">{stats?.orders ?? 0}</p>
              </div>
              <div className="glass-card rounded-xl p-6 gold-glow">
                <Star className="w-8 h-8 text-gold mb-3" />
                <p className="text-muted-foreground text-sm">التقييمات</p>
                <p className="text-3xl font-bold text-foreground">{stats?.reviews ?? 0}</p>
              </div>
              <div className="glass-card rounded-xl p-6 gold-glow">
                <p className="text-3xl font-bold text-gold mb-1">{stats?.revenue ? stats.revenue.toFixed(0) : 0}</p>
                <p className="text-muted-foreground text-sm">إجمالي الإيرادات (ج.م)</p>
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">المنتج</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">السعر</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">المخزون</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">التقييم</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">الحالة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product: any) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-card">
                            <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40/111111/D4AF37"; }} />
                          </div>
                          <div>
                            <p className="text-foreground text-sm font-medium">{product.nameAr}</p>
                            <p className="text-muted-foreground text-xs">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gold">{product.price} ج.م</td>
                      <td className="py-3 px-4 text-foreground">{product.stock}</td>
                      <td className="py-3 px-4">
                        <span className="text-gold">{product.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs"> ({product.reviewCount})</span>
                      </td>
                      <td className="py-3 px-4">
                        {product.isFeatured && <Badge className="bg-gold/20 text-gold mr-1">مميز</Badge>}
                        {product.isActive ? (
                          <Badge className="bg-green-500/20 text-green-400">نشط</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400">معطل</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditProduct(product)}>
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            if (confirm("هل أنت متأكد؟")) deleteProduct.mutate({ id: product.id });
                          }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">رقم الطلب</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">العميل</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">المبلغ</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">الحالة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">التاريخ</th>
                    <th className="text-right py-3 px-4 text-muted-foreground text-sm">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order: any) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-4 text-foreground">#{order.id}</td>
                      <td className="py-3 px-4">
                        <p className="text-foreground text-sm">{order.customerName}</p>
                        <p className="text-muted-foreground text-xs">{order.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-gold">{order.total} ج.م</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[order.status] ?? ""}>
                          {statusLabels[order.status] ?? order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost" onClick={() => { setEditOrder(order); setEditOrderStatus(order.status); }}>
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد طلبات بعد</p>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {reviews?.map((review: any) => (
                <div key={review.id} className="glass-card rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-medium">{review.commentAr || review.comment || "بدون تعليق"}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= review.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => approveReview.mutate({ id: review.id, isApproved: !review.isApproved })}>
                        {review.isApproved ? <XCircle className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (confirm("هل أنت متأكد؟")) deleteReview.mutate({ id: review.id });
                      }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    منتج #{review.productId} | {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              ))}
              {reviews?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد تقييمات</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={createProduct} onOpenChange={() => setCreateProduct(false)}>
        <DialogContent className="bg-[#0a0a0a] border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">الاسم (عربي) *</label>
              <Input value={newProductForm.nameAr} onChange={(e) => setNewProductForm({...newProductForm, nameAr: e.target.value})} className="bg-card border-border text-foreground" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">الاسم (إنجليزي) *</label>
              <Input value={newProductForm.nameEn} onChange={(e) => setNewProductForm({...newProductForm, nameEn: e.target.value})} className="bg-card border-border text-foreground" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">الوصف (عربي)</label>
              <Input value={newProductForm.descriptionAr} onChange={(e) => setNewProductForm({...newProductForm, descriptionAr: e.target.value})} className="bg-card border-border text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">السعر *</label>
                <Input type="number" value={newProductForm.price || ""} onChange={(e) => setNewProductForm({...newProductForm, price: Number(e.target.value)})} className="bg-card border-border text-foreground" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">المخزون *</label>
                <Input type="number" value={newProductForm.stock || ""} onChange={(e) => setNewProductForm({...newProductForm, stock: Number(e.target.value)})} className="bg-card border-border text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">رابط الصورة</label>
              <Input value={newProductForm.image} onChange={(e) => setNewProductForm({...newProductForm, image: e.target.value})} className="bg-card border-border text-foreground" placeholder="/manus-storage/..." />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">الفئة</label>
              <Select value={String(newProductForm.categoryId)} onValueChange={(val) => setNewProductForm({...newProductForm, categoryId: Number(val)})}>
                <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">مقابض الأبواب</SelectItem>
                  <SelectItem value="2">اكسسوارات الدوش</SelectItem>
                  <SelectItem value="3">كوالين الزجاج</SelectItem>
                  <SelectItem value="4">مفصلات الأبواب</SelectItem>
                  <SelectItem value="5">قطع التركيب</SelectItem>
                  <SelectItem value="6">ألواح زجاجية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newProductForm.isFeatured} onChange={(e) => setNewProductForm({...newProductForm, isFeatured: e.target.checked})} id="new-featured" />
                <label htmlFor="new-featured" className="text-sm text-foreground">مميز</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newProductForm.isActive} onChange={(e) => setNewProductForm({...newProductForm, isActive: e.target.checked})} id="new-active" />
                <label htmlFor="new-active" className="text-sm text-foreground">نشط</label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                if (!newProductForm.nameAr || !newProductForm.price) { toast.error("يرجى ملء الحقول المطلوبة"); return; }
                createProductMutation.mutate({ name: newProductForm.nameEn || newProductForm.nameAr, nameAr: newProductForm.nameAr, description: newProductForm.descriptionAr, descriptionAr: newProductForm.descriptionAr, price: newProductForm.price, stock: newProductForm.stock, categoryId: newProductForm.categoryId, image: newProductForm.image || "/manus-storage/pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d.jpeg", isFeatured: newProductForm.isFeatured, isActive: newProductForm.isActive });
              }} className="bg-gold text-[#0a0a0a]" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? "جاري..." : "إنشاء المنتج"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="bg-[#0a0a0a] border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">الاسم (عربي)</label>
                <Input
                  defaultValue={editProduct.nameAr}
                  id="edit-nameAr"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">السعر</label>
                <Input
                  type="number"
                  defaultValue={editProduct.price}
                  id="edit-price"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">المخزون</label>
                <Input
                  type="number"
                  defaultValue={editProduct.stock}
                  id="edit-stock"
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={editProduct.isActive} id="edit-active" />
                  <label htmlFor="edit-active" className="text-sm text-foreground">نشط</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={editProduct.isFeatured} id="edit-featured" />
                  <label htmlFor="edit-featured" className="text-sm text-foreground">مميز</label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  const nameAr = (document.getElementById("edit-nameAr") as HTMLInputElement)?.value;
                  const price = Number((document.getElementById("edit-price") as HTMLInputElement)?.value);
                  const stock = Number((document.getElementById("edit-stock") as HTMLInputElement)?.value);
                  const isActive = (document.getElementById("edit-active") as HTMLInputElement)?.checked;
                  const isFeatured = (document.getElementById("edit-featured") as HTMLInputElement)?.checked;
                  updateProduct.mutate({ id: editProduct.id, nameAr, price, stock, isActive, isFeatured });
                }} className="bg-gold text-[#0a0a0a]">
                  حفظ
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Dialog */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="bg-[#0a0a0a] border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">تعديل حالة الطلب #{editOrder?.id}</DialogTitle>
          </DialogHeader>
          {editOrder && (
            <div className="space-y-4">
              <div className="glass-card rounded-lg p-4">
                <p className="text-foreground font-medium">{editOrder.customerName}</p>
                <p className="text-muted-foreground text-sm">{editOrder.customerPhone}</p>
                <p className="text-muted-foreground text-sm">{editOrder.shippingAddress}</p>
                <p className="text-gold font-bold mt-2">{editOrder.total} ج.م</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">الحالة</label>
              <Select value={editOrderStatus} onValueChange={(val) => setEditOrderStatus(val)}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  updateOrderStatus.mutate({ id: editOrder.id, status: editOrderStatus || editOrder.status });
                }} className="bg-gold text-[#0a0a0a]">
                  حفظ
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
