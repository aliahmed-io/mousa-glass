import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu, MessageCircle, ShieldCheck, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const nav = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Catalog" },
    ...(user ? [{ href: "/orders", label: "My orders" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#fafaf8]/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white">MG</span>
            <span>Mousa Glass</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map(item => <Link key={item.href} href={item.href} className={`text-sm transition-colors hover:text-amber-700 ${location === item.href ? "font-semibold text-amber-700" : "text-slate-600"}`}>{item.label}</Link>)}
          </nav>
          <div className="flex items-center gap-1">
            {!loading && (user ? (
              <div className="hidden items-center gap-1 sm:flex">
                <span className="max-w-28 truncate px-2 text-xs text-slate-500">{user.name || "Account"}</span>
                <Button variant="ghost" size="sm" onClick={() => void logout()}>Sign out</Button>
              </div>
            ) : <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => startLogin()}><UserRound className="mr-2 h-4 w-4" />Sign in</Button>)}
            <Link href="/cart" aria-label="Shopping cart" className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white">{itemCount}</span>}
            </Link>
            <button aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 md:hidden" onClick={() => setIsOpen(value => !value)}>{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {isOpen && <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map(item => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-slate-50">{item.label}</Link>)}
            {user ? <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => void logout()}>Sign out</button> : <button className="rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => startLogin()}>Sign in</button>}
          </nav>
        </div>}
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container flex flex-col gap-6 py-9 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div><p className="font-semibold text-slate-900">Mousa Glass</p><p className="mt-1">Professional glass solutions and hardware.</p></div>
          <div className="flex flex-wrap gap-5 text-xs"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" />Secure order records</span><a className="inline-flex items-center gap-1.5 hover:text-amber-700" href="https://wa.me/201020848619" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 text-emerald-600" />WhatsApp support</a></div>
        </div>
      </footer>
      <a href="https://wa.me/201020848619" target="_blank" rel="noreferrer" aria-label="Contact Mousa Glass on WhatsApp" className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-700/30 transition-transform hover:scale-105"><MessageCircle className="h-5 w-5" /></a>
    </div>
  );
}

