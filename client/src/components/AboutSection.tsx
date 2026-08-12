/**
 * About Section - Asymmetric layout with Art Deco accents
 * Stronger brand copy focusing on expertise and precision
 */
import { motion } from "framer-motion";
import { Award, Users, Package, Calendar } from "lucide-react";

const STATS = [
  { icon: Calendar, value: "+10", label: "سنوات خبرة" },
  { icon: Users, value: "+2000", label: "عميل يثق بنا" },
  { icon: Package, value: "+500", label: "منتج متوفر" },
  { icon: Award, value: "100%", label: "منتجات أصلية" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden">
              <img
                src="/images/about-section_2b2aaa4a (1).jpg"
                alt="ورشة عمل موسى"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/50 to-transparent" />
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-5 -left-5 md:-left-7 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/20 p-5 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                  <Award size={24} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-[#D4AF37] font-black text-2xl">+10</div>
                  <div className="text-[#F5F0E8]/50 text-sm">سنوات من الدقة والتميز</div>
                </div>
              </div>
            </motion.div>

            {/* Art Deco corner frames */}
            <div className="absolute -top-3 -right-3 w-20 h-20 border-t-2 border-r-2 border-[#D4AF37]/20 rounded-tr-xl" />
            <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-2 border-l-2 border-[#D4AF37]/20 rounded-bl-xl" />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-[#D4AF37]/50 text-sm font-semibold tracking-wider uppercase">
              من نحن
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              <span className="text-gold-gradient">موسى</span>
              <br />
              <span className="text-[#F5F0E8]">خبرة وثقة في كل منتج</span>
            </h2>
            <p className="text-[#F5F0E8]/55 text-lg leading-relaxed mb-5">
              منذ أكثر من 10 سنوات ونحن نعدّ المورد الأوثق لأكسسوارات الزجاج في مصر. نوفر تشكيلة واسعة تشمل المقابض والمفصلات والكوالين والمسامير — كلها بجودة عالمية وبأسعار تنافسية.
            </p>
            <p className="text-[#F5F0E8]/55 text-lg leading-relaxed mb-8">
              نتعامل مباشرة مع أفضل المصانع في ألمانيا وتركيا لضمان حصولك على منتجات أصلية بضمان المصنع. فريقنا المتخصص يساعدك في اختيار المنتج المناسب بمقاسات دقيقة لمشروعك.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/10"
                >
                  <stat.icon size={18} className="text-[#D4AF37]" />
                  <div>
                    <div className="text-[#D4AF37] font-black text-xl">{stat.value}</div>
                    <div className="text-[#F5F0E8]/40 text-xs">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
