/**
 * Navigation bar - Luxury Noir design
 * Uses the actual موسى logo image for brand identity
 * Black background with gold accents, glass effect on scroll
 * RTL Arabic layout with premium feel
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Clock, Menu, X, ShoppingCart, Store } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const NAV_LINKS = [
  { label: "الرئيسية", href: "/" },
  { label: "المتجر", href: "/shop" },
  { label: "من نحن", href: "/#about" },
  { label: "تواصل معنا", href: "/#contact" },
];

function CartBadge() {
  const { data } = trpc.cart.get.useQuery(undefined, { enabled: true });
  const count = data?.length ?? 0;
  if (count === 0) return null;
  return (
    <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top info bar */}
      <div
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled ? "opacity-0 -translate-y-full h-0" : "opacity-100 translate-y-0 h-[40px]"
        }`}
        style={{ background: "rgba(5,5,5,0.95)" }}
      >
        <div className="container flex items-center justify-between h-full text-xs">
          <div className="flex items-center gap-4 text-[#C9A84C]/70">
            <span className="flex items-center gap-1.5">
              <Phone size={12} /> 01020848619
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={12} /> 01060223037
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[#C9A84C]/70">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> مصر - القاهرة
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> السبت - الخميس: 9ص - 9م
            </span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className={`fixed right-0 left-0 z-40 transition-all duration-500 ${
          scrolled
            ? "top-0 glass-card py-2.5"
            : "top-[40px] py-3"
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo - using actual brand logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <img
              src="/images/pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d.jpeg"
              alt="موسى"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D4AF37]/40 group-hover:ring-[#D4AF37]/70 transition-all duration-300"
            />
            <span className="text-gold-gradient font-black text-2xl tracking-tight">موسى</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[#F5F0E8]/70 hover:text-[#D4AF37] transition-colors duration-300 text-sm font-semibold group"
              >
                {link.label}
                <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-gradient-to-l from-[#D4AF37] to-[#C9A84C] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/shop" className="text-[#D4AF37] hover:text-[#F5F0E8] transition-colors relative">
              <ShoppingCart size={20} />
              <CartBadge />
            </Link>
            <a
              href="tel:01020848619"
              className="px-6 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
            >
              اتصل بنا
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-[#D4AF37] p-2"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden overflow-hidden"
              style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)" }}
            >
              <div className="container py-6 flex flex-col gap-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => setMobileOpen(false)}
                    className="text-[#F5F0E8]/80 hover:text-[#D4AF37] transition-colors duration-300 text-lg font-medium py-2 border-b border-[#D4AF37]/10"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <a
                  href="tel:01020848619"
                  className="mt-4 px-6 py-3 rounded-full bg-gold-gradient text-black font-bold text-center text-sm"
                >
                  اتصل بنا الآن
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
