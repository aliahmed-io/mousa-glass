/**
 * Products Section - Featured products with refined gold accents
 * Glassmorphism cards with hover effects
 * Expert, confident tone in copy
 */
import { motion } from "framer-motion";
import { Phone, Star, ShoppingCart, Eye } from "lucide-react";

const PRODUCTS = [
  {
    id: 1,
    title: "مقبض باب زجاجي ذهبي",
    category: "مقابض",
    price: "450",
    image: "/images/glass-door-product_113bd9cd.jpg",
    rating: 4.8,
    badge: "الأكثر طلباً",
  },
  {
    id: 2,
    title: "دوش زجاجي بدون إطار",
    category: "دوش",
    price: "1,200",
    image: "/images/glass-shower_83a35009.jpg",
    rating: 4.9,
    badge: "وصل حديثاً",
  },
  {
    id: 3,
    title: "مفصلة أرضية زجاجية",
    category: "مفصلات",
    price: "680",
    image: "/images/glass-products-hero_91b8e903.jpg",
    rating: 4.7,
    badge: "",
  },
  {
    id: 4,
    title: "كوالين زجاجية مقسى",
    category: "كوالين",
    price: "320",
    image: "/images/category-banner_dbe4fbaa.jpg",
    rating: 4.6,
    badge: "عرض خاص",
  },
  {
    id: 5,
    title: "مقبض شريطي كروم",
    category: "مقابض",
    price: "380",
    image: "/images/glass-door-product_113bd9cd.jpg",
    rating: 4.5,
    badge: "",
  },
  {
    id: 6,
    title: "طقم اكسسوارات حمام كامل",
    category: "دوش",
    price: "2,400",
    image: "/images/glass-shower_83a35009.jpg",
    rating: 5.0,
    badge: "الأعلى تقييماً",
  },
];

export default function ProductsSection() {
  return (
    <section id="products" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/[0.01] to-transparent" />

      <div className="container relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-4 h-4 rotate-45 border border-[#D4AF37]/30 mx-auto mb-6" />
          <span className="text-[#D4AF37]/50 text-sm font-semibold tracking-wider uppercase">
            اختياراتنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
            <span className="text-gold-gradient">منتجاتنا المميزة</span>
          </h2>
          <p className="text-[#F5F0E8]/50 max-w-xl mx-auto text-lg">
            منتجات مختارة بعناية من أفضل الخامات بضمان الجودة
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-16 h-[1px] bg-gradient-to-l from-[#D4AF37]/40 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-[#D4AF37]/40" />
            <div className="w-16 h-[1px] bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-xl overflow-hidden bg-[#0D0D0D] border border-[#D4AF37]/10 transition-all duration-500 hover:border-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/5 hover:-translate-y-1"
            >
              {/* Product image */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent" />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-md bg-[#D4AF37] text-black text-xs font-bold">
                    {product.badge}
                  </div>
                )}

                {/* Quick actions */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  <button className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-black font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#E8C84A] transition-colors active:scale-95">
                    <ShoppingCart size={14} />
                    اطلب الآن
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95">
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {/* Product info */}
              <div className="p-5">
                <span className="text-[#D4AF37]/60 text-xs font-medium">{product.category}</span>
                <h3 className="text-[#F5F0E8] font-bold text-base mt-1 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {product.title}
                </h3>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#D4AF37]" fill="#D4AF37" />
                    <span className="text-[#F5F0E8]/60 text-sm">{product.rating}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[#D4AF37] font-black text-xl">{product.price}</span>
                    <span className="text-[#F5F0E8]/30 text-xs mr-1">ج.م</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="tel:01020848619"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] font-bold hover:bg-[#D4AF37]/10 transition-all duration-300"
          >
            <Phone size={18} />
            للتواصل حول المنتجات والاستفسار
          </a>
        </motion.div>
      </div>
    </section>
  );
}
