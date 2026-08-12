/**
 * Hero Section - Luxury Noir with Art Deco geometry
 * Full-screen hero with actual موسى logo, parallax, geometric accents
 * RTL Arabic content
 */
import { motion } from "framer-motion";
import { ArrowDown, Phone } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg_5f0714c2.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-[#0A0A0A]" />
      </div>

      {/* Art Deco geometric accents */}
      {/* Diamond shape top-right */}
      <div className="absolute top-20 left-20 w-20 h-20 rotate-45 border border-[#D4AF37]/15 hidden md:block" />
      <div className="absolute top-28 left-28 w-20 h-20 rotate-45 border border-[#D4AF37]/10 hidden md:block" />
      {/* Arc bottom-left */}
      <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full border border-[#D4AF37]/10 hidden md:block" />
      <div className="absolute bottom-36 right-20 w-40 h-40 rounded-full border border-[#D4AF37]/5 hidden md:block" />
      {/* Thin lines */}
      <div className="absolute top-1/3 right-0 w-64 h-[1px] bg-gradient-to-l from-[#D4AF37]/20 to-transparent hidden lg:block" />
      <div className="absolute bottom-1/4 left-0 w-48 h-[1px] bg-gradient-to-r from-[#D4AF37]/15 to-transparent hidden lg:block" />

      {/* Content */}
      <div className="container relative z-10 pt-32">
        <div className="max-w-2xl">
          {/* Logo badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <img
              src="/images/pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d.jpeg"
              alt="موسى"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/20"
            />
            <div>
              <span className="text-gold-gradient font-black text-3xl block leading-tight">موسى</span>
              <span className="text-[#F5F0E8]/40 text-xs">لجمبع انواع اكسسوارات الزجاج</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6"
          >
            <span className="text-[#F5F0E8]">جودة لا تُضاهى</span>
            <br />
            <span className="text-gold-gradient">في كل تفصيلة</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-[#F5F0E8]/60 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
          >
            مقابض، مفصلات، كوالين، مسامير — كلها بأعلى معايير الجودة العالمية وبأسعار تنافسية من أكبر مورد لأكسسوارات الزجاج في مصر
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#products"
              className="group px-8 py-4 rounded-full bg-gold-gradient text-black font-bold text-base hover:shadow-2xl hover:shadow-[#D4AF37]/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2"
            >
              تصفح المنتجات
              <ArrowDown size={18} className="rotate-[-90deg] group-hover:translate-x-[-4px] transition-transform duration-300" />
            </a>
            <a
              href="tel:01020848619"
              className="px-8 py-4 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-base hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all duration-300 flex items-center gap-2"
            >
              <Phone size={18} />
              اتصل الآن
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex gap-10 mt-16 pt-8 border-t border-[#D4AF37]/10"
          >
            <div>
              <div className="text-3xl font-black text-gold-gradient">+500</div>
              <div className="text-[#F5F0E8]/40 text-sm mt-1">منتج متوفر</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gold-gradient">+10</div>
              <div className="text-[#F5F0E8]/40 text-sm mt-1">سنوات خبرة</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gold-gradient">+2000</div>
              <div className="text-[#F5F0E8]/40 text-sm mt-1">عميل يثق بنا</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating glass panel decoration - Art Deco style */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-1/2 -translate-y-1/2 left-8 lg:left-16 hidden md:block"
      >
        <div className="w-40 h-60 rounded-lg border border-[#D4AF37]/15 bg-gradient-to-br from-[#D4AF37]/[0.03] to-transparent backdrop-blur-sm rotate-[-15deg] shadow-2xl shadow-black/50" />
        <div className="absolute inset-0 w-40 h-60 rounded-lg border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/[0.06] to-transparent backdrop-blur-sm rotate-[3deg] translate-x-6 translate-y-3" />
        {/* Diamond accent */}
        <div className="absolute -top-8 -right-8 w-16 h-16 rotate-45 border border-[#D4AF37]/20" />
      </motion.div>
    </section>
  );
}
