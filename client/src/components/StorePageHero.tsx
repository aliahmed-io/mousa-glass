import type { ReactNode } from "react";

type StorePageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
};

export default function StorePageHero({ eyebrow, title, description, children }: StorePageHeroProps) {
  return <section className="relative overflow-hidden border-b border-[#d4af37]/15 bg-[#0d0d12] py-14 sm:py-18 lg:py-22">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(212,175,55,.12),transparent_31%),radial-gradient(circle_at_12%_90%,rgba(212,175,55,.06),transparent_28%)]" />
    <div className="absolute left-8 top-10 hidden h-24 w-24 rotate-45 border border-[#d4af37]/20 lg:block" />
    <div className="container relative">
      <p className="text-xs font-bold tracking-[.2em] text-[#d4af37]/75 sm:text-sm">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#f5f0e8] sm:text-5xl lg:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[#f5f0e8]/65 sm:text-lg">{description}</p>
      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </div>
  </section>;
}
