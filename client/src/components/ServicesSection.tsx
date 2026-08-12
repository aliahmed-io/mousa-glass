/**
 * Services Section - Expert confidence with Art Deco framing
 * Refined tone: focus on precision, guarantee, and craftsmanship
 */
import { motion } from "framer-motion";
import { Truck, Shield, Wrench, Headphones, Gem, Ruler } from "lucide-react";

const SERVICES = [
  {
    icon: Truck,
    title: "توصيل دقيق",
    description: "توصيل لجميع محافظات مصر خلال 24-48 ساعة مع التغليف الآمن",
  },
  {
    icon: Shield,
    title: "ضمان المصنع",
    description: "جميع منتجاتنا أصلية 100% مع شهادة ضمان رسمية من المصنع",
  },
  {
    icon: Wrench,
    title: "فريق تركيب متخصص",
    description: "فنيين مدربين على تركيب اكسسوارات الزجاج بدقة واحترافية",
  },
  {
    icon: Headphones,
    title: "استشارة تقنية مجانية",
    description: "خبراؤنا يساعدوك تختار المنتج المناسب لمقاسات مشروعك",
  },
  {
    icon: Gem,
    title: "خامات عالمية",
    description: "نستورد مباشرة من ألمانيا وتركيا لضمان أعلى جودة",
  },
  {
    icon: Ruler,
    title: "قص حسب المقاس",
    description: "خدمة قص الزجاج بدقة مليمترية حسب المقاسات المطلوبة",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="container">
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
            ليه تختارنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
            <span className="text-gold-gradient">خبرة ودقة في كل خطوة</span>
          </h2>
          <p className="text-[#F5F0E8]/50 max-w-xl mx-auto text-lg">
            من الاختيار للتركيب، نوفر لك تجربة متكاملة بكل ثقة
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-16 h-[1px] bg-gradient-to-l from-[#D4AF37]/40 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-[#D4AF37]/40" />
            <div className="w-16 h-[1px] bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-7 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/10 transition-all duration-500 hover:border-[#D4AF37]/25 hover:shadow-lg hover:shadow-[#D4AF37]/5 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/15 flex items-center justify-center mb-5 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                <service.icon size={24} className="text-[#D4AF37]" />
              </div>

              {/* Content */}
              <h3 className="text-[#F5F0E8] font-bold text-base mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-[#F5F0E8]/45 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
