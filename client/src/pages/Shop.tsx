import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatMoney, primaryImage } from "@/lib/commerce";
import { responsiveStagingProductImage } from "@/lib/responsiveStagingImages";
import { trpc } from "@/lib/trpc";
import { ArrowDownUp, Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";

type CatalogSort = "featured" | "newest" | "price_asc" | "price_desc" | "name_asc";

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "featured", label: "الترتيب المقترح" },
  { value: "newest", label: "الأحدث أولاً" },
  { value: "price_asc", label: "السعر: الأقل أولاً" },
  { value: "price_desc", label: "السعر: الأعلى أولاً" },
  { value: "name_asc", label: "الاسم: أ–ي" },
];

function isCatalogSort(value: string | null): value is CatalogSort {
  return value === "featured" || value === "newest" || value === "price_asc" || value === "price_desc" || value === "name_asc";
}

export default function Shop() {
  const searchParams = useSearch();
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(() => params.get("category") ?? "");
  const [sort, setSort] = useState<CatalogSort>(() => {
    const requestedSort = params.get("sort");
    return isCatalogSort(requestedSort) ? requestedSort : "featured";
  });
  useEffect(() => {
    setCategory(params.get("category") ?? "");
    const requestedSort = params.get("sort");
    setSort(isCatalogSort(requestedSort) ? requestedSort : "featured");
  }, [params]);
  const input = useMemo(() => ({ page: 1, limit: 24, search: search || undefined, categorySlug: category || undefined, sort }), [search, category, sort]);
  const { data, isLoading } = trpc.products.list.useQuery(input);
  const categories = trpc.categories.list.useQuery();
  const { addItem } = useCart();
  const updateCatalogParam = (key: "category" | "sort", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(next.size ? `/shop?${next.toString()}` : "/shop");
  };
  const resetCatalog = () => {
    setSearch("");
    navigate("/shop");
  };
  return <StoreLayout><main id="main-content" role="main" className="min-h-[70vh] bg-[#08090d] py-12 sm:py-16"><div className="container"><div className="max-w-2xl"><p className="text-sm font-bold tracking-[.22em] text-[#d4af37]/70">متجر موسى</p><h1 className="mt-3 text-4xl font-black text-[#f5f0e8] md:text-5xl"><span className="text-gold-gradient">كل إكسسوارات الزجاج</span></h1><p className="mt-4 leading-7 text-[#f5f0e8]/60">اختر القطع المناسبة لمشروعك وأضفها إلى السلة لإتمام طلبك بسهولة.</p></div>
    <section aria-label="بحث وفرز المنتجات" className="mt-10 rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-3 sm:p-4"><div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]"><label className="relative"><span className="sr-only">ابحث في المتجر</span><Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#d4af37]/65" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث عن منتج أو إكسسوار" className="h-12 w-full rounded-lg border border-[#d4af37]/15 bg-black/30 px-4 pr-12 text-sm text-[#f5f0e8] placeholder:text-[#f5f0e8]/35 focus:border-[#d4af37]/60 focus:outline-none" /></label><label className="relative"><span className="sr-only">اختر قسم المنتجات</span><SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d4af37]/65" /><select aria-label="اختر قسم المنتجات" value={category} onChange={event => { setCategory(event.target.value); updateCatalogParam("category", event.target.value); }} className="h-12 w-full appearance-none rounded-lg border border-[#d4af37]/15 bg-black/30 px-4 pr-11 text-sm text-[#f5f0e8] focus:border-[#d4af37]/60 focus:outline-none"><option value="">كل الأقسام</option>{categories.data?.map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label><label className="relative"><span className="sr-only">رتّب المنتجات</span><ArrowDownUp className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d4af37]/65" /><select aria-label="رتّب المنتجات" value={sort} onChange={event => { const value = event.target.value as CatalogSort; setSort(value); updateCatalogParam("sort", value === "featured" ? "" : value); }} className="h-12 w-full appearance-none rounded-lg border border-[#d4af37]/15 bg-black/30 px-4 pr-11 text-sm text-[#f5f0e8] focus:border-[#d4af37]/60 focus:outline-none">{sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
      <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-1" aria-label="تصفية سريعة حسب القسم"><Button size="sm" type="button" onClick={() => { setCategory(""); updateCatalogParam("category", ""); }} className={`shrink-0 snap-start rounded-full px-4 ${!category ? "bg-[#d4af37] text-black hover:bg-[#f0d369]" : "border border-[#d4af37]/25 bg-transparent text-[#f5f0e8] hover:bg-white/5"}`}>كل الأقسام</Button>{categories.data?.map(item => <Button key={item.id} size="sm" type="button" onClick={() => { setCategory(item.slug); updateCatalogParam("category", item.slug); }} className={`shrink-0 snap-start rounded-full px-4 ${category === item.slug ? "bg-[#d4af37] text-black hover:bg-[#f0d369]" : "border border-[#d4af37]/25 bg-transparent text-[#f5f0e8] hover:bg-white/5"}`}>{item.name}</Button>)}</div></section>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p aria-live="polite" className="text-sm text-[#f5f0e8]/50">{data ? `${data.total} منتج متاح` : "جارٍ تحميل المنتجات…"}</p>{(search || category || sort !== "featured") && <Button type="button" variant="outline" size="sm" className="w-fit rounded-full border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10" onClick={resetCatalog}><X className="ml-1.5 h-4 w-4" />مسح البحث والتصفية</Button>}</div>
    <div className="mt-5 grid min-h-44 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">{isLoading && <div className="col-span-full min-h-44 animate-pulse rounded-xl border border-[#d4af37]/10 bg-[#16161d]" aria-label="جارٍ تحميل المنتجات" />}{data?.products.map(product => <article key={product.id} className="group overflow-hidden rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/45"><Link href={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-black"><img {...responsiveStagingProductImage(primaryImage(product.images))} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></Link><div className="p-4 sm:p-5"><p className="text-xs font-semibold text-[#d4af37]/65">{product.category?.name || "إكسسوارات زجاج"}</p><Link href={`/products/${product.slug}`} className="mt-1 block min-h-12 text-lg font-black text-[#f5f0e8] transition hover:text-[#d4af37]">{product.name}</Link><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#f5f0e8]/50">{product.description || "قطع مختارة لتركيبات الزجاج."}</p><div className="mt-5 flex items-center justify-between gap-3"><div><p className="text-xl font-black text-[#d4af37]">{formatMoney(product.priceAmount)}</p><p className={`mt-1 text-xs ${product.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>{product.stock > 0 ? `متوفر: ${product.stock}` : "غير متوفر حاليًا"}</p></div><Button disabled={product.stock < 1} size="sm" className="min-h-10 rounded-full bg-[#d4af37] px-4 font-bold text-black hover:bg-[#f0d369]" onClick={() => addItem({ productId: product.id, slug: product.slug, name: product.name, priceAmount: product.priceAmount, imageUrl: primaryImage(product.images), stock: product.stock })}><ShoppingCart className="ml-1.5 h-4 w-4" />أضف</Button></div></div></article>)}{!isLoading && data?.products.length === 0 && <div className="col-span-full min-h-44 rounded-xl border border-dashed border-[#d4af37]/30 bg-[#0d0d12] p-8 text-center sm:p-12"><h2 className="font-black text-[#f5f0e8]">لا توجد منتجات مطابقة</h2><p className="mt-2 text-sm text-[#f5f0e8]/50">جرّب كلمة بحث أو قسمًا مختلفًا.</p></div>}</div></div></main></StoreLayout>;
}
