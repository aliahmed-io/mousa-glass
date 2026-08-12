import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { BarChart3, Image, LogOut, Menu, Package, ReceiptText, Settings, ShieldAlert, Tags, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const menuItems = [
  { icon: BarChart3, label: "نظرة عامة", path: "/admin" },
  { icon: Package, label: "المنتجات", path: "/admin/products" },
  { icon: Image, label: "صور المنتجات", path: "/admin/media" },
  { icon: Tags, label: "الأقسام", path: "/admin/categories" },
  { icon: ReceiptText, label: "الطلبات", path: "/admin/orders" },
  { icon: Settings, label: "إعدادات المتجر", path: "/admin/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  if (loading) return <div className="min-h-screen bg-[#08090d]" />;
  if (!user) return <div dir="rtl" className="grid min-h-screen place-items-center bg-[#08090d] p-5 text-[#f5f0e8]"><div className="w-full max-w-md rounded-xl border border-[#d4af37]/20 bg-[#0d0d12] p-8 text-center"><ShieldAlert className="mx-auto h-11 w-11 text-[#d4af37]" /><h1 className="mt-5 text-2xl font-black">سجّل الدخول للمتابعة</h1><p className="mt-3 text-sm leading-7 text-[#f5f0e8]/60">تحتاج لوحة الإدارة إلى حساب مصرح به.</p><Button className="mt-7 rounded-full bg-gold-gradient font-black text-black" onClick={() => startLogin()}>تسجيل الدخول</Button></div></div>;
  return <div dir="rtl" className="min-h-screen bg-[#08090d] text-[#f5f0e8]"><div className="lg:flex"><aside className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-[#d4af37]/15 bg-[#0b0b10] p-5 transition-transform lg:sticky lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}><div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><img src="/manus-storage/pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d_32f06135.jpeg" alt="موسى" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d4af37]/50" /><div><p className="text-gold-gradient text-xl font-black">موسى</p><p className="text-xs text-[#f5f0e8]/40">لوحة الإدارة</p></div></Link><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="إغلاق القائمة"><X className="h-5 w-5 text-[#d4af37]" /></button></div><nav className="mt-9 space-y-1">{menuItems.map(item => { const Icon = item.icon; const active = location === item.path; return <Link key={item.path} href={item.path} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${active ? "bg-[#d4af37] text-black" : "text-[#f5f0e8]/65 hover:bg-[#d4af37]/10 hover:text-[#d4af37]"}`}><Icon className="h-4 w-4" />{item.label}</Link>; })}</nav><div className="absolute inset-x-5 bottom-5 border-t border-[#d4af37]/15 pt-5"><p className="truncate text-sm font-bold">{user.name || "مدير المتجر"}</p><p className="mt-1 truncate text-xs text-[#f5f0e8]/40">{user.email || ""}</p><Button variant="ghost" className="mt-3 w-full justify-start text-[#f5f0e8]/60 hover:bg-[#d4af37]/10 hover:text-[#d4af37]" onClick={() => void logout()}><LogOut className="ml-2 h-4 w-4" />تسجيل الخروج</Button></div></aside>{open && <button aria-label="إغلاق القائمة" className="fixed inset-0 z-40 bg-black/65 lg:hidden" onClick={() => setOpen(false)} />}<section className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#d4af37]/15 bg-[#08090d]/90 px-4 backdrop-blur lg:hidden"><button aria-label="فتح القائمة" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d4af37]/25 text-[#d4af37]"><Menu className="h-5 w-5" /></button><span className="mr-3 font-black text-[#d4af37]">لوحة الإدارة</span></header><main className="p-5 sm:p-8 lg:p-10">{children}</main></section></div></div>;
}
