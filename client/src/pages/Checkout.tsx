import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  ArrowRight, ShoppingBag, CheckCircle, Banknote, Smartphone,
  MapPin, Phone, User, MessageCircle, Clock, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const LOCAL_STORAGE_KEY = "mousa_saved_customer_info";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "instapay">("cash");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    shippingAddress: "",
    city: "",
    notes: "",
  });

  // Pre-fill from authenticated user profile or saved localStorage
  useEffect(() => {
    try {
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedLocal = savedLocal ? JSON.parse(savedLocal) : null;

      setForm({
        customerName: user?.name || parsedLocal?.customerName || "",
        customerPhone: (user as any)?.phone || parsedLocal?.customerPhone || "",
        customerEmail: user?.email || parsedLocal?.customerEmail || "",
        shippingAddress: (user as any)?.address || parsedLocal?.shippingAddress || "",
        city: (user as any)?.city || parsedLocal?.city || "القاهرة",
        notes: (user as any)?.notes || parsedLocal?.notes || "",
      });
    } catch {
      // ignore JSON parse errors
    }
  }, [user]);

  const { data: cartItems } = trpc.cart.get.useQuery();

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      // Save info locally for quick checkout next time
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      } catch {}
      setStep("success");
      setOrderId(data.orderId);
      toast.success("تم تأكيد طلبك بنجاح!");
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ في إنشاء الطلب");
    },
  });

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    return sum + (item.product?.price ?? 0) * item.quantity;
  }, 0) ?? 0;
  const shipping = subtotal > 1500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.shippingAddress.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية (الاسم، الهاتف، العنوان)");
      return;
    }
    const items = cartItems?.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.product?.name ?? "",
      nameAr: item.product?.nameAr ?? "",
      price: item.product?.price ?? 0,
      image: item.product?.image ?? "",
    })) ?? [];

    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    createOrder.mutate({
      items,
      total,
      shippingFee: shipping,
      paymentMethod,
      ...form,
    });
  };

  if (step === "success") {
    const whatsappOrderMessage = encodeURIComponent(
      `مرحباً موسى للزجاج، أود متابعة طلبي رقم #${orderId}.\nالاسم: ${form.customerName}\nالهاتف: ${form.customerPhone}\nالإجمالي: ${total} ج.م\nطريقة الدفع: ${paymentMethod === "cash" ? "نقداً عند الاستلام" : "انستاباي مع المندوب"}`
    );

    return (
      <div dir="rtl" className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="container py-28 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 font-display">تم تسجيل طلبك بنجاح!</h2>
          <div className="glass-card rounded-2xl p-6 mb-6 text-right space-y-3">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <span className="text-muted-foreground text-sm">رقم الطلب</span>
              <span className="text-gold font-mono font-bold text-lg">#{orderId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <span className="text-muted-foreground text-sm">إجمالي المبلغ</span>
              <span className="text-foreground font-bold">{total.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <span className="text-muted-foreground text-sm">طريقة الدفع</span>
              <span className="text-gold text-sm font-semibold">
                {paymentMethod === "cash" ? "نقداً عند الاستلام مع المندوب" : "انستاباي عند الاستلام مع المندوب"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">عنوان التوصيل</span>
              <span className="text-foreground text-sm font-medium">{form.shippingAddress} ({form.city || "القاهرة"})</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            سيقوم فريق خدمة عملاء موسى للزجاج بالتواصل معك هاتفياً أو عبر واتساب لتأكيد موعد شحن وتوصيل الطلب.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/201020848619?text=${whatsappOrderMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              متابعة الطلب عبر واتساب
            </a>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10 rounded-full py-6 font-bold"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (!cartItems?.length) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="container py-32 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">سلة المشتريات فارغة</h2>
          <p className="text-muted-foreground mb-6">تصفح منتجاتنا الفاخرة وأضف ما يناسبك إلى السلة</p>
          <Button onClick={() => navigate("/shop")} className="bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold">
            تصفح المتجر الآن
          </Button>
        </div>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-12 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gold-gradient font-display mb-2">إتمام الطلب والشحن</h1>
          <p className="text-muted-foreground text-sm">
            {isAuthenticated ? `أهلاً بك، ${user?.name || "عميلنا المميز"}. تم ملء بياناتك المحفوظة تلقائياً.` : "يرجى كتابة عنوان ورقم هاتف التوصيل بدقة لضمان سرعة الشحن."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="glass-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-3">
                <MapPin className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-bold text-foreground">بيانات التوصيل والشحن</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground/80 font-medium mb-1.5">الاسم الكامل *</label>
                  <Input
                    value={form.customerName}
                    onChange={(e) => setForm({...form, customerName: e.target.value})}
                    className="bg-card border-border text-foreground focus-visible:ring-gold"
                    placeholder="مثال: م. أحمد مصطفى"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground/80 font-medium mb-1.5">رقم الهاتف (واتساب) *</label>
                  <Input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setForm({...form, customerPhone: e.target.value})}
                    className="bg-card border-border text-foreground focus-visible:ring-gold"
                    placeholder="010XXXXXXXX"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-foreground/80 font-medium mb-1.5">البريد الإلكتروني (اختياري)</label>
                  <Input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({...form, customerEmail: e.target.value})}
                    className="bg-card border-border text-foreground focus-visible:ring-gold"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-foreground/80 font-medium mb-1.5">العنوان بالتفصيل *</label>
                  <Input
                    value={form.shippingAddress}
                    onChange={(e) => setForm({...form, shippingAddress: e.target.value})}
                    className="bg-card border-border text-foreground focus-visible:ring-gold"
                    placeholder="الشارع، رقم العمارة، رقم الشقة أو اسم المعرض / الشركة"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground/80 font-medium mb-1.5">المدينة / المحافظة</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({...form, city: e.target.value})}
                    className="bg-card border-border text-foreground focus-visible:ring-gold"
                    placeholder="القاهرة، الجيزة، الإسكندرية..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground/80 font-medium mb-1.5">ملاحظات التوصيل أو مواعيد التواجد</label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                    className="bg-card border-border text-foreground focus-visible:ring-gold"
                    placeholder="ملاحظة للمندوب أو مقاسات خاصة"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
                <Banknote className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-bold text-foreground">طريقة الدفع عند الاستلام</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Cash */}
                <div
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === "cash"
                      ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold/40 shadow-sm shadow-gold/20"
                      : "border-border bg-card/50 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  <Banknote className={`w-6 h-6 mt-0.5 ${paymentMethod === "cash" ? "text-gold" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-bold text-sm text-foreground">الدفع نقداً عند الاستلام (COD)</p>
                    <p className="text-xs text-muted-foreground mt-1">ادفع كاش مباشرة لمندوب الشحن عند معاينة واستلام الطلب</p>
                  </div>
                </div>

                {/* Option 2: InstaPay */}
                <div
                  onClick={() => setPaymentMethod("instapay")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === "instapay"
                      ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold/40 shadow-sm shadow-gold/20"
                      : "border-border bg-card/50 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  <Smartphone className={`w-6 h-6 mt-0.5 ${paymentMethod === "instapay" ? "text-gold" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-bold text-sm text-foreground">انستاباي عند الاستلام (InstaPay)</p>
                    <p className="text-xs text-muted-foreground mt-1">تحويل لحظي عبر تطبيق انستاباي لحساب الشركة مع المندوب مباشرة</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-card/80 border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
                <span>ضمان معاينة جميع القطع والمفصلات والاكسسوارات مع مندوب التسليم قبل إتمام الدفع.</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold text-lg py-6 shadow-lg shadow-gold/20 hover:scale-[1.01] transition-all"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "جاري تسجيل طلبك..." : "تأكيد الطلب الآن"}
              {!createOrder.isPending && <ArrowRight className="w-5 h-5 mr-2 rotate-180" />}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="glass-card rounded-2xl p-6 h-fit border border-border sticky top-28">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border/50 pb-3">ملخص سلة الشراء</h3>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-card overflow-hidden shrink-0 border border-border">
                    <img
                      src={item.product?.image || "/images/glass-door-product_113bd9cd.jpg"}
                      alt={item.product?.nameAr}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/60/111111/D4AF37"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.product?.nameAr ?? "منتج"}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} × {(item.product?.price ?? 0)} ج.م</p>
                  </div>
                  <span className="text-gold text-sm font-bold shrink-0">{((item.product?.price ?? 0) * item.quantity).toFixed(2)} ج.م</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2.5">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>تكلفة الشحن والتوصيل</span>
                <span>{shipping === 0 ? <span className="text-green-400 font-bold">مجاني</span> : `${shipping} ج.م`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-[11px] text-green-400">ميزة الشحن المجاني مفعلة للطلبات الأكثر من 1500 ج.م</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                <span className="text-base">المبلغ الإجمالي</span>
                <span className="text-gold text-2xl font-bold">{total.toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

