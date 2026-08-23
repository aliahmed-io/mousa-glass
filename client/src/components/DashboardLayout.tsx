import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { BarChart3, Image, LogOut, Menu, Package, ReceiptText, Settings, ShieldAlert, Tags, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navGroups = [
  {
    label: "المتابعة",
    items: [
      { icon: BarChart3, label: "نظرة عامة", hint: "أداء المتجر", path: "/admin" },
      { icon: ReceiptText, label: "الطلبات", hint: "التنفيذ والدفع", path: "/admin/orders" },
    ],
  },
  {
    label: "الكتالوج",
    items: [
      { icon: Package, label: "المنتجات", hint: "الأسعار والمخزون", path: "/admin/products" },
      { icon: Image, label: "صور المنتجات", hint: "مكتبة الصور", path: "/admin/media" },
      { icon: Tags, label: "الأقسام", hint: "تنظيم المتجر", path: "/admin/categories" },
    ],
  },
  {
    label: "الإعدادات",
    items: [{ icon: Settings, label: "إعدادات المتجر", hint: "الدفع والتواصل", path: "/admin/settings" }],
  },
];

function isActivePath(location: string, path: string) {
  return path === "/admin" ? location === "/admin" : location === path || location.startsWith(`${path}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  if (loading) return <div className="min-h-screen bg-[#08090d]" />;
  if (!user)
    return (
      <div dir="rtl" className="grid min-h-screen place-items-center bg-[#08090d] p-5 text-[#f5f0e8]">
        <div className="w-full max-w-md rounded-2xl border border-[#d4af37]/20 bg-[#0d0d12] p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,.25)]">
          <ShieldAlert className="mx-auto h-11 w-11 text-[#d4af37]" />
          <h1 className="mt-5 text-2xl font-black">سجّل الدخول للمتابعة</h1>
          <p className="mt-3 text-sm leading-7 text-[#f5f0e8]/60">تحتاج لوحة الإدارة إلى حساب مصرح به.</p>
          <Button className="mt-7 rounded-full bg-gold-gradient font-black text-black" onClick={() => startLogin()}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[#08090d] text-[#f5f0e8]">
      <div className="lg:flex">
        <aside className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-[#d4af37]/15 bg-[#0b0b10] p-5 transition-transform lg:sticky lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/manus-storage/mousa-logo-128_bf907234.webp" alt="موسى" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d4af37]/50" />
              <div><p className="text-gold-gradient text-xl font-black">موسى</p><p className="text-xs text-[#f5f0e8]/40">لوحة الإدارة</p></div>
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="إغلاق القائمة"><X className="h-5 w-5 text-[#d4af37]" /></button>
          </div>
          <div className="mt-8 rounded-xl border border-[#d4af37]/15 bg-[#d4af37]/[.04] p-4"><p className="text-xs font-bold text-[#d4af37]">مساحة تشغيل المتجر</p><p className="mt-2 text-xs leading-6 text-[#f5f0e8]/50">تابع الطلبات، راقب المخزون، وحدّث الكتالوج من مكان واحد.</p></div>
          <nav className="mt-7 flex-1 space-y-6" aria-label="التنقل في لوحة الإدارة">
            {navGroups.map(group => <div key={group.label}><p className="mb-2 px-3 text-[11px] font-black tracking-[.16em] text-[#f5f0e8]/35">{group.label}</p><div className="space-y-1">{group.items.map(item => { const Icon = item.icon; const active = isActivePath(location, item.path); return <Link key={item.path} href={item.path} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${active ? "bg-[#d4af37] text-black shadow-[0_10px_28px_rgba(212,175,55,.14)]" : "text-[#f5f0e8]/65 hover:bg-[#d4af37]/10 hover:text-[#d4af37]"}`}><Icon className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1"><span className="block text-sm font-black">{item.label}</span><span className={`mt-0.5 block text-[10px] ${active ? "text-black/60" : "text-[#f5f0e8]/35"}`}>{item.hint}</span></span></Link>; })}</div></div>)}
          </nav>
          <div className="mt-6 border-t border-[#d4af37]/15 pt-5"><p className="truncate text-sm font-bold">{user.name || "مدير المتجر"}</p><p className="mt-1 truncate text-xs text-[#f5f0e8]/40">{user.email || ""}</p><Button variant="ghost" className="mt-3 w-full justify-start text-[#f5f0e8]/60 hover:bg-[#d4af37]/10 hover:text-[#d4af37]" onClick={() => void logout()}><LogOut className="ml-2 h-4 w-4" />تسجيل الخروج</Button></div>
        </aside>
        {open && <button aria-label="إغلاق القائمة" className="fixed inset-0 z-40 bg-black/65 lg:hidden" onClick={() => setOpen(false)} />}
        <section className="min-w-0 w-full flex-1"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#d4af37]/15 bg-[#08090d]/90 px-4 backdrop-blur lg:hidden"><button aria-label="فتح القائمة" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d4af37]/25 text-[#d4af37]"><Menu className="h-5 w-5" /></button><span className="mr-3 font-black text-[#d4af37]">لوحة الإدارة</span></header><main className="p-5 sm:p-8 lg:p-10">{children}</main></section>
      </div>
    </div>
  );
}
