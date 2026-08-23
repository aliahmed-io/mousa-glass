import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, MapPin, Menu, MessageCircle, Phone, ShoppingCart, UserRound, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { organizationJsonLd } from "@/lib/seo";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const LOGO = "/manus-storage/mousa-logo-128_bf907234.webp";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const settings = trpc.store.settings.useQuery();
  const isCatalogStaging = settings.data?.isCatalogStaging === true;
  const whatsappNumber = settings.data?.whatsappNumber?.replace(/\D/g, "") || "";
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const nav = [
    { href: "/", label: "الرئيسية" },
    { href: "/shop", label: "المتجر" },
    { href: "/about", label: "عن موسى" },
    { href: "/contact", label: "تواصل معنا" },
    ...(user ? [{ href: "/orders", label: "طلباتي" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "لوحة الإدارة" }] : []),
  ];

  return (
    <><SeoJsonLd id="mousa-organization-jsonld" data={organizationJsonLd(settings.data || {})} /><div dir="rtl" className="min-h-screen overflow-x-hidden bg-[#08090d] text-[#f5f0e8]">
      <div className="fixed inset-x-0 top-0 z-50 hidden h-10 border-b border-[#d4af37]/10 bg-black/95 md:block">
        <div className="container flex h-full items-center justify-between text-xs text-[#d4af37]/75">
          <div className="flex items-center gap-5">{whatsappNumber ? <a href={`tel:+${whatsappNumber}`} dir="ltr" className="inline-flex items-center gap-1.5 hover:text-[#d4af37]"><Phone size={12} />+{whatsappNumber}</a> : <span className="inline-flex items-center gap-1.5"><Phone size={12} />تنتظر بيانات التواصل</span>}</div>
          <div className="flex items-center gap-5"><span className="inline-flex items-center gap-1.5"><MapPin size={12} />الغردقة، البحر الأحمر</span><span className="inline-flex items-center gap-1.5"><Clock size={12} />السبت - الخميس: 9ص - 9م</span></div>
        </div>
      </div>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#d4af37]/10 bg-[#090a0f]/92 pt-0 backdrop-blur-xl md:top-10">
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3" onClick={() => setIsOpen(false)}><img src={LOGO} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-[#d4af37]/50" /><span className="text-gold-gradient text-2xl font-black">موسى</span></Link>
          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {nav.map(item => <Link key={item.href} href={item.href} aria-current={location === item.href ? "page" : undefined} className={`border-b-2 pb-1 text-sm font-semibold transition-colors ${location === item.href ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-[#f5f0e8]/70 hover:text-[#d4af37]"}`}>{item.label}</Link>)}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {!loading && (user ? <div className="hidden items-center gap-2 lg:flex"><span className="max-w-28 truncate text-xs text-[#f5f0e8]/55">{user.name || "حسابي"}</span><Button variant="ghost" size="sm" className="text-[#f5f0e8]/70 hover:bg-[#d4af37]/10 hover:text-[#d4af37]" onClick={() => void logout()}>خروج</Button></div> : <Button variant="ghost" size="sm" className="hidden text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f5f0e8] lg:inline-flex" onClick={() => startLogin()}><LogIn className="ml-2 h-4 w-4" />دخول</Button>)}
            <Link href="/cart" aria-label="سلة المشتريات" className="relative grid h-10 w-10 place-items-center rounded-full border border-[#d4af37]/25 text-[#d4af37] transition hover:bg-[#d4af37]/10"><ShoppingCart className="h-5 w-5" />{itemCount > 0 && <span className="absolute -left-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#d4af37] px-1 text-[10px] font-black text-black">{itemCount > 9 ? "9+" : itemCount}</span>}</Link>
            <button aria-label="فتح القائمة" className="grid h-10 w-10 place-items-center rounded-full border border-[#d4af37]/25 text-[#d4af37] lg:hidden" onClick={() => setIsOpen(value => !value)}>{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {isOpen && <div className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-[#d4af37]/15 bg-[#0d0d12] px-4 py-4 lg:hidden"><nav aria-label="التنقل على الجوال" className="container flex flex-col gap-1">{nav.map(item => <Link key={item.href} href={item.href} aria-current={location === item.href ? "page" : undefined} onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-3 font-semibold text-[#f5f0e8]/80 transition hover:bg-[#d4af37]/10 hover:text-[#d4af37]">{item.label}</Link>)}<Link href="/faq" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-3 font-semibold text-[#f5f0e8]/80 transition hover:bg-[#d4af37]/10 hover:text-[#d4af37]">الأسئلة الشائعة</Link><Link href="/delivery-returns" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-3 font-semibold text-[#f5f0e8]/80 transition hover:bg-[#d4af37]/10 hover:text-[#d4af37]">التوصيل والاستبدال</Link>{user ? <button className="rounded-lg px-4 py-3 text-right font-semibold text-[#f5f0e8]/80 hover:bg-[#d4af37]/10" onClick={() => void logout()}>تسجيل الخروج</button> : <button className="rounded-lg px-4 py-3 text-right font-semibold text-[#f5f0e8]/80 hover:bg-[#d4af37]/10" onClick={() => startLogin()}>تسجيل الدخول</button>}</nav></div>}
      </header>
      <div className="pt-[72px] md:pt-[112px]">
        {isCatalogStaging && <aside className="border-b border-amber-300/20 bg-amber-300/10 px-4 py-3 text-center text-xs leading-6 text-amber-100" role="status">هذا عرض تجريبي يستخدم منتجات وصورًا مولّدة للاختبار فقط. تفاصيل الأسعار والمخزون وبيانات التواصل والدفع والتوصيل والضرائب والاستبدال والشروط القانونية تنتظر اعتماد إدارة المتجر؛ لذلك لا يمكن إتمام طلبات حقيقية.</aside>}
        {children}
      </div>
      <footer className="border-t border-[#d4af37]/15 bg-[#050507]">
        <div className="container grid gap-8 py-12 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div><div className="flex items-center gap-3"><img src={LOGO} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d4af37]/50" /><span className="text-gold-gradient text-xl font-black">موسى</span></div><p className="mt-4 max-w-sm text-sm leading-7 text-[#f5f0e8]/55">متخصصون في جميع أنواع إكسسوارات الزجاج. نخدم عملاءنا في الغردقة والبحر الأحمر بمنتجات موثوقة وخدمة مباشرة.</p></div>
          <nav aria-label="روابط المتجر"><p className="text-sm font-bold text-[#d4af37]">روابط المتجر</p><div className="mt-4 flex flex-col gap-3 text-sm text-[#f5f0e8]/60"><Link href="/shop" className="hover:text-[#d4af37]">المتجر</Link><Link href="/about" className="hover:text-[#d4af37]">عن موسى</Link><Link href="/delivery-returns" className="hover:text-[#d4af37]">التوصيل والاستبدال</Link><Link href="/faq" className="hover:text-[#d4af37]">الأسئلة الشائعة</Link></div></nav>
          <div><p className="text-sm font-bold text-[#d4af37]">تواصل معنا</p><div className="mt-4 space-y-3 text-sm text-[#f5f0e8]/60"><p>الغردقة، البحر الأحمر</p>{whatsappNumber ? <a href={`tel:+${whatsappNumber}`} dir="ltr" className="block hover:text-[#d4af37]">+{whatsappNumber}</a> : <p>تنتظر الإدارة اعتماد بيانات التواصل.</p>}<Link href="/contact" className="block hover:text-[#d4af37]">كل وسائل التواصل</Link>{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#25d366]"><MessageCircle size={16} />واتساب</a>}</div></div>
        </div>
        <div className="border-t border-[#d4af37]/10 py-4 text-center text-xs text-[#f5f0e8]/65">© {new Date().getFullYear()} موسى لإكسسوارات الزجاج. جميع الحقوق محفوظة.</div>
      </footer>
      {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="تواصل معنا عبر واتساب" className="fixed bottom-5 left-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-[#25d366]/25 transition-transform hover:scale-105"><MessageCircle className="h-6 w-6" /></a>}
    </div></>
  );
}
