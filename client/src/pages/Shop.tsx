import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { Search, Filter, Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ScrollProgress from "@/components/ScrollToTop";

export default function Shop() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "rating" | "name">("newest");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    search: search || undefined,
    categoryId,
    sortBy,
    page,
    limit,
  });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => toast.success("تمت الإضافة إلى السلة"),
    onError: () => toast.error("حدث خطأ"),
  });

  const total = productsData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />
      <ScrollProgress />

      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#111]" />
        <div className="relative container">
          <h1 className="text-4xl md:text-5xl font-bold text-gold-gradient mb-4 font-display">
            متجر موسى
          </h1>
          <p className="text-muted-foreground text-lg">اكتشف مجموعتنا الكاملة من اكسسوارات الزجاج الفاخرة</p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="container py-12">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryId?.toString() || "all"} onValueChange={(v) => { setCategoryId(v === "all" ? undefined : Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setPage(1); }}>
              <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price_low">السعر: من الأقل</SelectItem>
                <SelectItem value="price_high">السعر: من الأعلى</SelectItem>
                <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                <SelectItem value="name">الاسم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-muted-foreground mb-6">عرض {productsData?.products.length ?? 0} من {total} منتج</p>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-xl h-80" />
            ))}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">لا توجد منتجات مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsData?.products.map((product) => (
              <div key={product.id} className="group glass-card rounded-xl overflow-hidden transition-all duration-300 hover:gold-glow hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden bg-card">
                  <img
                    src={product.image}
                    alt={product.nameAr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400/111111/D4AF37?text=" + product.nameAr; }}
                  />
                  {product.salePrice && (
                    <span className="absolute top-3 left-3 bg-destructive text-white text-xs px-2 py-1 rounded-full">خصم</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-1 line-clamp-1">{product.nameAr}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gold font-bold text-lg">{product.price} ج.م</span>
                    {product.salePrice && (
                      <span className="text-muted-foreground text-sm line-through">{product.salePrice} ج.م</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex-1 text-gold border-gold hover:bg-gold/10"
                    >
                      عرض التفاصيل
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        addToCart.mutate({ productId: product.id, quantity: 1 });
                      }}
                      className="bg-gold text-[#0a0a0a] hover:bg-gold-light"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? "bg-gold text-[#0a0a0a]" : "border-border text-foreground"}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
