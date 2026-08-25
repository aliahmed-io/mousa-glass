import StoreLayout from "@/components/StoreLayout";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatMoney, primaryImage } from "@/lib/commerce";
import { productJsonLd } from "@/lib/seo";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug });
  const settings = trpc.store.settings.useQuery();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const { addItem } = useCart();

  const selectedVariant = useMemo(() => product?.variants.find(variant => variant.id === selectedVariantId) ?? null, [product?.variants, selectedVariantId]);
  const purchasable = selectedVariant ?? product;
  const effectiveStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const effectivePrice = selectedVariant?.priceAmount ?? product?.priceAmount ?? 0;
  const effectiveCompareAt = selectedVariant?.compareAtAmount ?? product?.compareAtAmount ?? null;

  if (isLoading) return <StoreLayout><main className="container py-14"><div className="h-96 animate-pulse rounded-xl bg-[#16161d]" /></main></StoreLayout>;
  if (!product) return <StoreLayout><main className="container py-20 text-center"><h1 className="text-2xl font-black">المنتج غير موجود</h1><Link href="/shop"><Button variant="outline" className="mt-5 border-[#d4af37]/40 text-[#d4af37]">العودة للمتجر</Button></Link></main></StoreLayout>;

  const image = primaryImage(product.images);
  const chooseVariant = (variantId: number | null) => {
    setSelectedVariantId(variantId);
    const variant = product.variants.find(item => item.id === variantId) ?? null;
    setQuantity(value => Math.min(value, variant?.stock ?? product.stock));
  };

  return (
    <StoreLayout>
      <SeoJsonLd id="mousa-product-jsonld" data={productJsonLd({ isCatalogStaging: settings.data?.isCatalogStaging, product })} />
      <main className="min-h-[70vh] bg-[#08090d] py-8 sm:py-14">
        <div className="container">
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[#d4af37] hover:text-[#f5f0e8]"><ArrowRight className="h-4 w-4" />العودة للمتجر</Link>
          <div className="mt-5 grid gap-7 sm:mt-7 sm:gap-9 lg:grid-cols-[1.05fr_.95fr]">
            <div className="overflow-hidden rounded-xl border border-[#d4af37]/15 bg-black"><img src={image} alt={product.name} loading="eager" fetchPriority="high" decoding="async" className="aspect-square h-full w-full object-cover" /></div>
            <section className="flex flex-col justify-center">
              <p className="text-sm font-bold text-[#d4af37]/70">{product.category?.name || "إكسسوارات زجاج"}</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-[#f5f0e8] sm:text-4xl">{product.name}</h1>
              <div className="mt-5 flex flex-wrap items-baseline gap-3"><p className="text-3xl font-black text-[#d4af37]">{formatMoney(effectivePrice)}</p>{effectiveCompareAt && <p className="text-base font-bold text-[#f5f0e8]/40 line-through">{formatMoney(effectiveCompareAt)}</p>}</div>
              {effectiveCompareAt && <p className="mt-1 text-xs font-bold text-emerald-300">سعر عرض تجريبي موضح قبل إضافة المنتج للسلة</p>}
              <p className="mt-6 whitespace-pre-wrap leading-8 text-[#f5f0e8]/65 sm:mt-7">{product.description || "تواصل معنا لمساعدتك في اختيار المقاس أو التكوين المناسب."}</p>
              {product.variants.length > 0 && (
                <fieldset className="mt-7">
                  <legend className="text-sm font-black">اختر التكوين</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => chooseVariant(null)} className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${selectedVariantId === null ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]" : "border-[#d4af37]/20 text-[#f5f0e8]/70 hover:border-[#d4af37]/50"}`}>القياسي</button>
                    {product.variants.map(variant => <button key={variant.id} type="button" onClick={() => chooseVariant(variant.id)} disabled={!variant.isActive || variant.stock === 0} className={`rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedVariantId === variant.id ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]" : "border-[#d4af37]/20 text-[#f5f0e8]/70 hover:border-[#d4af37]/50"}`}>{variant.label}</button>)}
                  </div>
                </fieldset>
              )}
              <div className="mt-7"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold ${effectiveStock > 0 ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-rose-400/25 bg-rose-400/10 text-rose-300"}`}><Check className="h-4 w-4" />{effectiveStock > 0 ? `متوفر في المخزون: ${effectiveStock}` : "غير متوفر حاليًا"}</span></div>
              {effectiveStock > 0 && <div className="mt-8 flex flex-col gap-3 sm:flex-row"><div className="flex h-12 items-center self-start rounded-lg border border-[#d4af37]/20 bg-black/30"><button aria-label="تقليل الكمية" className="grid h-full w-11 place-items-center hover:bg-[#d4af37]/10" onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus className="h-4 w-4" /></button><span className="w-10 text-center font-bold">{quantity}</span><button aria-label="زيادة الكمية" className="grid h-full w-11 place-items-center hover:bg-[#d4af37]/10" onClick={() => setQuantity(value => Math.min(effectiveStock, value + 1))}><Plus className="h-4 w-4" /></button></div><Button size="lg" className="min-h-12 flex-1 rounded-full bg-gold-gradient font-black text-black hover:opacity-90" onClick={() => addItem({ productId: product.id, variantId: selectedVariant?.id ?? null, variantLabel: selectedVariant?.label ?? null, slug: product.slug, name: product.name, priceAmount: effectivePrice, imageUrl: image, stock: effectiveStock }, quantity)}><ShoppingCart className="ml-2 h-5 w-5" />أضف {quantity} إلى السلة</Button></div>}
              <div className="mt-8 rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-5 text-sm leading-7 text-[#f5f0e8]/60">الدفع متاح عند الاستلام أو بتحويل InstaPay مع رفع صورة إثبات التحويل. سيتم تأكيد طلبك مباشرة عبر واتساب.</div>
            </section>
          </div>
        </div>
      </main>
    </StoreLayout>
  );
}
