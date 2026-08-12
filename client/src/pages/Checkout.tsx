import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ArrowRight, ShoppingBag, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Checkout() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    shippingAddress: "", city: "", notes: "",
  });

  const { data: cartItems } = trpc.cart.get.useQuery();

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => { setStep("success"); setOrderId(data.orderId); },
    onError: () => toast.error("حدث خطأ في إنشاء الطلب"),
  });

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    return sum + (item.product?.price ?? 0) * item.quantity;
  }, 0) ?? 0;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.shippingAddress) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
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
      items, total, shippingFee: shipping,
      ...form,
    });
  };

  if (step === "success") {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">تم إنشاء الطلب بنجاح!</h2>
          <p className="text-muted-foreground mb-2">رقم الطلب: #{orderId}</p>
          <p className="text-muted-foreground mb-8">سيتم التواصل معك قريباً لتأكيد الطلب</p>
          <Button onClick={() => navigate("/")} className="bg-gold text-[#0a0a0a] hover:bg-gold-light">
            العودة للصفحة الرئيسية
          </Button>
        </div>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (!cartItems?.length) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">السلة فارغة</h2>
          <Button onClick={() => navigate("/shop")} className="bg-gold text-[#0a0a0a] hover:bg-gold-light">
            تصفح المنتجات
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

      <section className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">بيانات التوصيل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">الاسم الكامل *</label>
                  <Input
                    value={form.customerName}
                    onChange={(e) => setForm({...form, customerName: e.target.value})}
                    className="bg-card border-border text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">رقم الهاتف *</label>
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setForm({...form, customerPhone: e.target.value})}
                    className="bg-card border-border text-foreground"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({...form, customerEmail: e.target.value})}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">العنوان *</label>
                  <Input
                    value={form.shippingAddress}
                    onChange={(e) => setForm({...form, shippingAddress: e.target.value})}
                    className="bg-card border-border text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">المدينة</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({...form, city: e.target.value})}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">ملاحظات</label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                    className="bg-card border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Payment method info */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">طريقة الدفع</h3>
              <div className="flex items-center gap-3 p-3 border border-gold/30 rounded-lg bg-gold/5">
                <CheckCircle className="w-5 h-5 text-gold" />
                <span className="text-foreground">الدفع عند الاستلام (COD)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                يمكنك الدفع نقداً عند استلام الطلب أو عبر فودافون كاش
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold text-lg py-6"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
              {!createOrder.isPending && <ArrowRight className="w-5 h-5 mr-2 rotate-180" />}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="glass-card rounded-xl p-6 h-fit">
            <h3 className="text-lg font-bold text-foreground mb-4">ملخص الطلب</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.product?.nameAr ?? "..."}</p>
                    <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                  <span className="text-gold text-sm font-bold">{((item.product?.price ?? 0) * item.quantity).toFixed(2)} ج.م</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>الشحن</span>
                <span>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>الإجمالي</span>
                <span className="text-gold text-xl">{total.toFixed(2)} ج.م</span>
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
