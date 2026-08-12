import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useParams } from "wouter";
import { Star, ShoppingCart, ArrowRight, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  const id = Number(params.id);
  const { data: product, isLoading } = trpc.products.byId.useQuery({ id });
  const { data: reviews } = trpc.reviews.byProduct.useQuery({ productId: id });
  const { data: categories } = trpc.categories.list.useQuery();

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => toast.success("تمت الإضافة إلى السلة"),
    onError: () => toast.error("حدث خطأ"),
  });

  const utils = trpc.useUtils();
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة التقييم — بانتظار موافقة الإدارة"); setComment(""); utils.reviews.byProduct.invalidate({ productId: id }); },
    onError: () => toast.error("حدث خطأ"),
  });

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse w-96 h-96 bg-card rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">المنتج غير موجود</p>
      </div>
    );
  }

  const category = categories?.find(c => c.id === product.categoryId);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate("/shop")} className="hover:text-gold transition-colors">المتجر</button>
          <span>/</span>
          <span className="text-foreground">{category?.nameAr}</span>
        </div>
      </div>

      {/* Product Section */}
      <section className="container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden glass-card gold-glow">
            <img
              src={product.image}
              alt={product.nameAr}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x600/111111/D4AF37?text=" + product.nameAr; }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-gold text-sm font-medium mb-2">{category?.nameAr}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.nameAr}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= Math.round(product.rating) ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-muted-foreground">({product.reviewCount} تقييم)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gold">{product.price} ج.م</span>
              {product.salePrice && (
                <span className="text-xl text-muted-foreground line-through">{product.salePrice} ج.م</span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.descriptionAr || product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`inline-block w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} قطعة متوفرة` : "نفذ من المخزون"}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg">
                <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-10 text-center text-foreground">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
              <Button
                onClick={() => {
                  addToCart.mutate({ productId: product.id, quantity });
                }}
                className="flex-1 bg-gold text-[#0a0a0a] hover:bg-gold-light font-bold"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                أضف إلى السلة
              </Button>
            </div>

            {/* SKU */}
            <p className="text-xs text-muted-foreground">رمز المنتج: {product.sku}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">التقييمات والمراجعات</h2>

          {/* Add Review Form */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">أضف تقييمك</h3>
            <div className="flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer transition-colors ${i <= rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
                  onClick={() => setRating(i)}
                />
              ))}
            </div>
            {!isAuthenticated && (
              <div className="mb-3">
                <Input
                  placeholder="اسمك (اختياري)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="bg-card border-border text-foreground mb-3"
                />
              </div>
            )}
            <div className="flex gap-3">
              <Input
                placeholder="اكتب تعليقك..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-card border-border text-foreground"
              />
              <Button
                onClick={() => createReview.mutate({ productId: id, rating, comment, commentAr: comment, customerName: reviewerName || user?.name || "زائر" })}
                className="bg-gold text-[#0a0a0a] hover:bg-gold-light"
                disabled={createReview.isPending}
              >
                إرسال
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                {(review.commentAr || review.comment) && (
                  <p className="text-foreground">{review.commentAr || review.comment}</p>
                )}
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-8">لا توجد تقييمات بعد. كن الأول!</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
