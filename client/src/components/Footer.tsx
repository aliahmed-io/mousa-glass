/**
 * Footer - Luxury dark footer with actual موسى logo
 * Refined design with Art Deco accents
 */
import { Phone, MapPin, Clock, ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative pt-14 pb-6 overflow-hidden">
      {/* Top border with Art Deco accent */}
      <div className="absolute top-0 right-0 left-0 flex items-center justify-center">
        <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
        <div className="w-3 h-3 rotate-45 border border-[#D4AF37]/30 mx-2" />
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
      </div>

      <div className="container pt-8">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d.jpeg"
                alt="موسى"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D4AF37]/30"
              />
              <span className="text-gold-gradient font-black text-xl">موسى</span>
            </div>
            <p className="text-[#F5F0E8]/40 text-sm leading-relaxed mb-4">
              أكبر مورد لأكسسوارات الزجاج في مصر. جودة عالمية، أسعار تنافسية، وضمان المصنع على كل منتج.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[#F5F0E8] font-bold text-sm mb-4">روابط سريعة</h4>
            <div className="flex flex-col gap-2">
              <a href="#home" className="text-[#F5F0E8]/40 hover:text-[#D4AF37] transition-colors duration-300 text-sm">
                الرئيسية
              </a>
              <a href="#products" className="text-[#F5F0E8]/40 hover:text-[#D4AF37] transition-colors duration-300 text-sm">
                منتجاتنا
              </a>
              <a href="#services" className="text-[#F5F0E8]/40 hover:text-[#D4AF37] transition-colors duration-300 text-sm">
                خدماتنا
              </a>
              <a href="#about" className="text-[#F5F0E8]/40 hover:text-[#D4AF37] transition-colors duration-300 text-sm">
                من نحن
              </a>
              <a href="#contact" className="text-[#F5F0E8]/40 hover:text-[#D4AF37] transition-colors duration-300 text-sm">
                تواصل معنا
              </a>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-[#F5F0E8] font-bold text-sm mb-4">تواصل معنا</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[#F5F0E8]/40 text-sm">
                <Phone size={14} className="text-[#D4AF37] shrink-0" />
                <span>01020848619 / 01060223037</span>
              </div>
              <div className="flex items-center gap-3 text-[#F5F0E8]/40 text-sm">
                <MapPin size={14} className="text-[#D4AF37] shrink-0" />
                <span>مصر - القاهرة</span>
              </div>
              <div className="flex items-center gap-3 text-[#F5F0E8]/40 text-sm">
                <Clock size={14} className="text-[#D4AF37] shrink-0" />
                <span>السبت - الخميس: 9ص - 9م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#D4AF37]/8 flex items-center justify-between">
          <p className="text-[#F5F0E8]/25 text-xs">
            © {new Date().getFullYear()} موسي. جميع الحقوق محفوظة.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-9 h-9 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
