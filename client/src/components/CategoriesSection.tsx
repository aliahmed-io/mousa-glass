/**
 * Categories Section - Asymmetric grid with Art Deco accents
 * Glassmorphism cards with gold geometric frames
 * RTL Arabic content
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { DoorOpen, ShowerHead, Wrench, GripHorizontal, Lock, Square } from "lucide-react";

const CATEGORIES = [
  {
    icon: DoorOpen,
    title: "مقابض الأبواب",
    description: "مقابض زجاجية بتصاميم عصرية وكلاسيكية من أفضل الخامات",
    count: "120+ منتج",
    image: "/images/glass-door-product_113bd9cd.jpg",
  },
  {
    icon: ShowerHead,
    title: "اكسسوارات الدوش",
    description: "منتجات زجاجية عالية الجودة بتصاميم أنيقة للحمامات",
    count: "85+ منتج",
    image: "/images/glass-shower_83a35009.jpg",
  },
  {
    icon: Lock,
    title: "كوالين الزجاج",
    description: "أقفال وكوالين متعددة الأحجام بمقاومة عالية",
    count: "60+ منتج",
    image: "/images/glass-products-hero_79a48c05.jpg",
  },
  {
    icon: GripHorizontal,
    title: "مفصلات الأبواب",
    description: "مفصلات حركة ومفصلات أرضية وسقفية بجودة عالمية",
    count: "45+ منتج",
    image: "/images/glass-products-hero_91b8e903.jpg",
  },
  {
    icon: Wrench,
    title: "قطع التركيب",
    description: "مسامير وبراغي وأدوات تركيب احترافية دقيقة",
    count: "150+ منتج",
    image: "/images/glass-door-product_113bd9cd.jpg",
  },
  {
    icon: Square,
    title: "ألواح زجاجية",
    description: "زجاج مقسى ومصفح بمختلف السماكات والمقاسات",
    count: "50+ منتج",
    image: "/images/category-banner_dbe4fbaa.jpg",
  },
];

export default function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="categories" className="py-24 relative">
      <div className="container">
        {/* Section header with Art Deco framing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative"
        >
          {/* Decorative diamond */}
          <div className="w-4 h-4 rotate-45 border border-[#D4AF37]/30 mx-auto mb-6" />
          <span className="text-[#D4AF37]/50 text-sm font-semibold tracking-wider uppercase">
            تصنيفاتنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
            <span className="text-gold-gradient">فئات المنتجات</span>
          </h2>
          <p className="text-[#F5F0E8]/50 max-w-xl mx-auto text-lg">
            تشكيلة شاملة من أكسسوارات الزجاج لكل حاجة عندك
          </p>
          {/* Art Deco divider */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-16 h-[1px] bg-gradient-to-l from-[#D4AF37]/40 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-[#D4AF37]/40" />
            <div className="w-16 h-[1px] bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-[#D4AF37]/8 hover:-translate-y-1"
            >
              {/* Card image background */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                
                {/* Icon */}
                <div className="absolute top-4 left-4 w-11 h-11 rounded-lg bg-[#0A0A0A]/60 backdrop-blur-md border border-[#D4AF37]/20 flex items-center justify-center group-hover:border-[#D4AF37]/40 transition-all duration-300">
                  <cat.icon size={22} className="text-[#D4AF37]" />
                </div>

                {/* Count badge */}
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-md bg-[#D4AF37]/10 backdrop-blur-md border border-[#D4AF37]/20">
                  <span className="text-[#D4AF37] text-xs font-semibold">{cat.count}</span>
                </div>
              </div>

              {/* Card content */}
              <div className="p-5 bg-[#0D0D0D] border-x border-b border-[#D4AF37]/10 group-hover:border-[#D4AF37]/25 transition-colors duration-300">
                <h3 className="text-[#F5F0E8] font-bold text-base group-hover:text-[#D4AF37] transition-colors duration-300">
                  {cat.title}
                </h3>
                <p className="text-[#F5F0E8]/40 text-sm mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
