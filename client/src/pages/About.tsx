import StoreLayout from "@/components/StoreLayout";
import StorePageHero from "@/components/StorePageHero";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "wouter";

const ABOUT_IMAGE = "/manus-storage/mousa-hero-desktop_0e11b818.webp";

export default function About() {
  return <StoreLayout><main>
    <StorePageHero eyebrow="عن موسى" title={<>إكسسوارات زجاج <span className="text-gold-gradient">تخدم تفاصيل مشروعك</span></>} description="موسى متخصص في إكسسوارات الزجاج، ويخدم العملاء والفنيين في الغردقة والبحر الأحمر من خلال اختيار واضح للمنتجات وتواصل مباشر قبل الطلب وبعده.">
      <Link href="/shop"><Button className="rounded-full bg-gold-gradient px-6 font-black text-black hover:opacity-90">تصفح المنتجات <ArrowLeft className="mr-2 h-4 w-4" /></Button></Link>
      <Link href="/contact"><Button variant="outline" className="rounded-full border-[#d4af37]/45 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f5f0e8]">تواصل معنا <MessageCircle className="mr-2 h-4 w-4" /></Button></Link>
    </StorePageHero>

    <section className="bg-[#08090d] py-14 sm:py-18"><div className="container grid items-center gap-8 lg:grid-cols-[.95fr_1.05fr] lg:gap-14">
      <picture><source media="(max-width: 767px)" srcSet="/manus-storage/mousa-hero-mobile_1eecd256.webp" type="image/webp" /><img src={ABOUT_IMAGE} alt="إكسسوارات وتجهيزات زجاج بتفاصيل معدنية" width="1600" height="1200" loading="eager" fetchPriority="high" decoding="async" sizes="(min-width: 1024px) 50vw, 100vw" className="min-h-70 w-full rounded-xl object-cover ring-1 ring-[#d4af37]/20 sm:min-h-90" /></picture>
      <div><p className="text-sm font-bold tracking-[.18em] text-[#d4af37]/70">طريقة العمل</p><h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">اختيار عملي ومتابعة مباشرة</h2><p className="mt-5 leading-8 text-[#f5f0e8]/65">سواء كنت تبحث عن قطعة محددة أو تجهز تركيبًا كاملًا، يساعدك المتجر على الوصول إلى الخيارات المتاحة ثم تأكيد التفاصيل مع الفريق مباشرة عبر واتساب.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">{[[ShieldCheck,"معلومات واضحة","عرض سعر وحالة مخزون لكل منتج متاح."],[Wrench,"مخصص للتركيبات","إكسسوارات مناسبة لأعمال الزجاج والتجهيز."],[CheckCircle2,"خطوات طلب بسيطة","تصفح، أضف للسلة، ثم أكمل بياناتك."],[MessageCircle,"تواصل قريب","اتصل أو راسل واتساب لتأكيد التفاصيل."]].map(([Icon, title, text]) => { const I = Icon as typeof ShieldCheck; return <div key={title as string} className="rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-4"><I className="h-5 w-5 text-[#d4af37]" /><h3 className="mt-3 font-black">{title as string}</h3><p className="mt-1 text-sm leading-6 text-[#f5f0e8]/55">{text as string}</p></div>; })}</div></div>
    </div></section>
  </main></StoreLayout>;
}
