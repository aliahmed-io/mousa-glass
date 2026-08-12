/**
 * Contact Section - Expert confident tone
 * Clean layout with selective gold accents
 */
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Mail, MessageCircle } from "lucide-react";

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "الخط الأول",
    value: "01020848619",
    href: "tel:01020848619",
  },
  {
    icon: Phone,
    label: "الخط الثاني",
    value: "01060223037",
    href: "tel:01060223037",
  },
  {
    icon: MapPin,
    label: "الموقع",
    value: "مصر - القاهرة",
    href: "#",
  },
  {
    icon: Clock,
    label: "مواعيد العمل",
    value: "السبت - الخميس: 9ص - 9م",
    href: "#",
  },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "info@mosa-glass.com",
    href: "mailto:info@mosa-glass.com",
  },
  {
    icon: MessageCircle,
    label: "واتساب",
    value: "01020848619",
    href: "https://wa.me/201020848619",
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 relative">
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
            تواصل معنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">
            <span className="text-gold-gradient">جاهزين نساعدك</span>
          </h2>
          <p className="text-[#F5F0E8]/50 max-w-xl mx-auto text-lg">
            لو عندك مشروع أو محتاج مساعدة في اختيار المنتجات، فريقنا جاهز يساعدك
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-16 h-[1px] bg-gradient-to-l from-[#D4AF37]/40 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-[#D4AF37]/40" />
            <div className="w-16 h-[1px] bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
        </motion.div>

        {/* Contact grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {CONTACT_INFO.map((info, i) => (
            <motion.a
              key={info.label}
              href={info.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex items-start gap-4 p-5 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/10 transition-all duration-300 hover:border-[#D4AF37]/25 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/15 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                <info.icon size={18} className="text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-[#F5F0E8]/35 text-xs block mb-1">{info.label}</span>
                <span className="text-[#F5F0E8] font-bold text-sm group-hover:text-[#D4AF37] transition-colors duration-300">
                  {info.value}
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-xl overflow-hidden"
        >
          <div className="relative p-10 md:p-14 text-center bg-[#0D0D0D] border border-[#D4AF37]/15">
            <h3 className="text-3xl md:text-4xl font-black mb-3">
              <span className="text-gold-gradient">مشروعك يستحق الأفضل</span>
            </h3>
            <p className="text-[#F5F0E8]/50 text-base max-w-lg mx-auto mb-8">
              تواصل معنا واحصل على عرض سعر مخصص مع استشارة مجانية من خبرائنا المتخصصين
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:01020848619"
                className="px-8 py-3.5 rounded-full bg-gold-gradient text-black font-bold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
              >
                اتصل بنا الآن
              </a>
              <a
                href="https://wa.me/201020848619"
                className="px-8 py-3.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-sm hover:bg-[#D4AF37]/10 transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle size={18} />
                واتساب
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
