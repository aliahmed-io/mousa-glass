import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/commerce";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { items, subtotalAmount, updateQuantity, removeItem } = useCart();

  return (
    <StoreLayout>
      <main className="min-h-[70vh] bg-[#08090d] py-12">
        <div className="container">
          <p className="text-sm font-bold tracking-[.22em] text-[#d4af37]/70">طلبك</p>
          <h1 className="mt-3 text-4xl font-black"><span className="text-gold-gradient">سلة المشتريات</span></h1>
          {items.length === 0 ? (
            <div className="mt-9 rounded-xl border border-dashed border-[#d4af37]/30 bg-[#0d0d12] p-12 text-center">
              <h2 className="text-xl font-black">سلتك فارغة</h2>
              <p className="mt-2 text-sm text-[#f5f0e8]/55">تصفح المنتجات لإضافة القطع التي تحتاجها.</p>
              <Link href="/shop"><Button className="mt-6 rounded-full bg-gold-gradient font-black text-black">تصفح المتجر</Button></Link>
            </div>
          ) : (
            <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_370px]">
              <section className="overflow-hidden rounded-xl border border-[#d4af37]/15 bg-[#0d0d12]">
                {items.map(item => (
                  <article key={`${item.productId}:${item.variantId ?? "base"}`} className="flex gap-4 border-b border-[#d4af37]/10 p-4 last:border-0 sm:p-5">
                    <Link href={`/products/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black"><img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /></Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.slug}`} className="font-black text-[#f5f0e8] hover:text-[#d4af37]">{item.name}</Link>
                      {item.variantLabel && <p className="mt-1 text-xs font-bold text-[#f5f0e8]/55">{item.variantLabel}</p>}
                      <p className="mt-1 text-sm font-bold text-[#d4af37]">{formatMoney(item.priceAmount)}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex h-9 items-center rounded-lg border border-[#d4af37]/20 bg-black/25">
                          <button aria-label="تقليل الكمية" className="grid h-full w-8 place-items-center hover:bg-[#d4af37]/10" onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button aria-label="زيادة الكمية" className="grid h-full w-8 place-items-center hover:bg-[#d4af37]/10 disabled:opacity-40" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button aria-label={`حذف ${item.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-[#f5f0e8]/40 hover:bg-rose-500/10 hover:text-rose-300" onClick={() => removeItem(item.productId, item.variantId)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="hidden pt-1 font-black text-[#d4af37] sm:block">{formatMoney(item.priceAmount * item.quantity)}</p>
                  </article>
                ))}
              </section>
              <aside className="h-fit rounded-xl border border-[#d4af37]/20 bg-[#0d0d12] p-6">
                <h2 className="text-xl font-black text-[#f5f0e8]">ملخص الطلب</h2>
                <div className="mt-6 flex justify-between text-sm text-[#f5f0e8]/60"><span>إجمالي المنتجات</span><span className="font-bold text-[#f5f0e8]">{formatMoney(subtotalAmount)}</span></div>
                <p className="mt-4 text-xs leading-6 text-[#f5f0e8]/45">تظهر تكلفة التوصيل عند إتمام الطلب وفق إعدادات المتجر.</p>
                <div className="my-6 border-t border-[#d4af37]/15" />
                <div className="flex justify-between text-lg font-black"><span>المجموع</span><span className="text-[#d4af37]">{formatMoney(subtotalAmount)}</span></div>
                <Link href="/checkout" className="mt-6 block"><Button className="w-full rounded-full bg-gold-gradient font-black text-black hover:opacity-90">تابع لإتمام الطلب <ArrowLeft className="mr-2 h-4 w-4" /></Button></Link>
              </aside>
            </div>
          )}
        </div>
      </main>
    </StoreLayout>
  );
}
