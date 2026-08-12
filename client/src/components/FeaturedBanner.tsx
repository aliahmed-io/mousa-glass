/**
 * Featured Banner - Full-width with Art Deco geometric accents
 * Refined copy focusing on craftsmanship and precision
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, ArrowDown } from "lucide-react";

export default function FeaturedBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/category-banner_dbe4fbaa.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{
            transform: isInView ? "scale(1.05)" : "scale(1.15)",
            transition: "transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
      </div>

      {/* Art Deco geometric accents */}
      <div className="absolute top-12 right-24 w-24 h-24 rotate-45 border border-[#D4AF37]/10 hidden md:block" />
      <div className="absolute bottom-12 left-24 w-16 h-16 rotate-45 border border-[#D4AF37]/15 hidden md:block" />

      {/* Content */}
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[#D4AF37]/40 text-sm font-semibold tracking-wider uppercase block mb-4">
            جودة عالمية
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-5">
            <span className="text-gold-gradient">زجاج يقاوم الزمن</span>
            <br />
            <span className="text-[#F5F0E8]">وتصاميم تثري المكان</span>
          </h2>
          <p className="text-[#F5F0E8]/50 text-base max-w-xl mx-auto mb-8">
            منتجاتنا مصنوعة بأعلى معايير الجودة العالمية — من ألمانيا وتركيا مباشرة لموقعك
          </p>

          <div className="flex items-center justify-center gap-4">
            <a
              href="#products"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold-gradient text-black font-bold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
            >
              اكتشف المجموعة
              <ArrowDown size={16} className="rotate-[-90deg] group-hover:translate-x-[-4px] transition-transform duration-300" />
            </a>
            <a
              href="tel:01020848619"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-sm hover:bg-[#D4AF37]/10 transition-all duration-300"
            >
              <Phone size={16} />
              استفسار
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
