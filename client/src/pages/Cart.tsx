import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Cart() {
  const [, navigate] = useLocation();
  const { data: cartItems, isLoading, refetch } = trpc.cart.get.useQuery(undefined, { enabled: true });

  const updateQty = trpc.cart.update.useMutation({
    onSuccess: () => { refetch(); toast.success("تم تحديث السلة"); },
  });

  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => { refetch(); toast.success("تم الحذف"); },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => { refetch(); toast.success("تم تفريغ السلة"); },
  });

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    return sum + (item.product?.price ?? 0) * item.quantity;
  }, 0) ?? 0;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse w-96 h-64 bg-card rounded-xl" />
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
          <p className="text-muted-foreground mb-8">لم تضف أي منتجات إلى سلة التسوق بعد</p>
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
        <h1 className="text-3xl font-bold text-foreground mb-8">سلة التسوق</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item: any) => {
              const product = item.product;
              return (
                <div key={item.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-card flex-shrink-0">
                    {product && (
                      <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80/111111/D4AF37?text="; }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{product?.nameAr ?? "..."}</h3>
                    <p className="text-gold font-bold">{product?.price ?? 0} ج.م</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => updateQty.mutate({ cartId: item.id, quantity: item.quantity - 1 })}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center text-foreground">{item.quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => updateQty.mutate({ cartId: item.id, quantity: item.quantity + 1 })}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem.mutate({ cartId: item.id })} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="glass-card rounded-xl p-6 h-fit">
            <h3 className="text-lg font-bold text-foreground mb-6">ملخص الطلب</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>الشحن</span>
                <span>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-500">شحن مجاني للطلبات أكثر من 500 ج.م</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                <span>الإجمالي</span>
                <span className="text-gold text-xl">{total.toFixed(2)} ج.م</span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
            >
              إتمام الطلب
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/shop")}
              className="w-full mt-3 text-muted-foreground hover:text-foreground"
            >
              متابعة التسوق
            </Button>
            <Button
              variant="ghost"
              onClick={() => { if (confirm("هل أنت متأكد من تفريغ السلة؟")) clearCart.mutate(); }}
              className="w-full mt-2 text-destructive hover:text-destructive/80"
            >
              تفريغ السلة
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
