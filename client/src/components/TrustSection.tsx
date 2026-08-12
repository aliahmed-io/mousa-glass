/**
 * Trust Section - Social proof with refined copy
 * Focus on guarantees, certifications, and tangible benefits
 */
import { motion } from "framer-motion";
import { Shield, CheckCircle, Truck, RotateCcw } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, text: "أصلي 100%", subtext: "بضمان المصنع" },
  { icon: Truck, text: "توصيل آمن", subtext: "لكل محافظات مصر" },
  { icon: RotateCcw, text: "إرجاع سهل", subtext: "خلال 7 أيام" },
  { icon: CheckCircle, text: "أفضل سعر", subtext: "مضمون ومقارن" },
];

const BRANDS = [
  "DORMA", "HAFELE", "KIN LONG", "ASSA ABLOY", "BLUM", "SUGATSUNE"
];

export default function TrustSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/testimonial-bg_2d88a41c.jpg"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/80" />
      </div>

      <div className="container relative">
        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/10 hover:border-[#D4AF37]/25 transition-colors duration-300"
            >
              <div className="w-12 h-12 mx-auto rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/15 flex items-center justify-center mb-4">
                <item.icon size={22} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-[#F5F0E8] font-bold text-sm mb-1">{item.text}</h3>
              <p className="text-[#F5F0E8]/35 text-xs">{item.subtext}</p>
            </motion.div>
          ))}
        </div>

        {/* Brands / partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-[#D4AF37]/40 text-sm font-semibold tracking-wider uppercase mb-8 block">
            وكلاء معتمدون لأكبر العلامات العالمية
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="px-5 py-2.5 rounded-lg border border-[#D4AF37]/8 bg-[#0D0D0D] text-[#F5F0E8]/40 font-bold text-sm hover:text-[#D4AF37] hover:border-[#D4AF37]/25 transition-all duration-300"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
