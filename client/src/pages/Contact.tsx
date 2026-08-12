import StoreLayout from "@/components/StoreLayout";
import StorePageHero from "@/components/StorePageHero";
import { Button } from "@/components/ui/button";
import { Clock3, MapPin, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

const WHATSAPP = "https://wa.me/201020848619";

export default function Contact() {
  return <StoreLayout><main>
    <StorePageHero eyebrow="تواصل معنا" title={<>نحن قريبون منك <span className="text-gold-gradient">في الغردقة</span></>} description="للاستفسار عن المنتجات المتاحة أو تجهيز طلبك، تواصل معنا هاتفيًا أو عبر واتساب. سنساعدك في تأكيد القطعة المناسبة قبل إتمام الطلب.">
      <a href={WHATSAPP} target="_blank" rel="noreferrer"><Button className="rounded-full bg-[#25d366] px-6 font-black text-white hover:bg-[#1fb85a]"><MessageCircle className="ml-2 h-4 w-4" />راسلنا على واتساب</Button></a>
      <Link href="/shop"><Button variant="outline" className="rounded-full border-[#d4af37]/45 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f5f0e8]"><ShoppingBag className="ml-2 h-4 w-4" />زيارة المتجر</Button></Link>
    </StorePageHero>
    <section className="bg-[#08090d] py-14 sm:py-18"><div className="container grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <a href="tel:01020848619" className="group rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-6 transition hover:-translate-y-1 hover:border-[#d4af37]/45"><Phone className="h-6 w-6 text-[#d4af37]" /><p className="mt-5 text-sm text-[#f5f0e8]/55">اتصال مباشر</p><h2 dir="ltr" className="mt-1 text-xl font-black group-hover:text-[#d4af37]">01020848619</h2><p className="mt-3 text-sm text-[#f5f0e8]/50">اضغط للاتصال الآن.</p></a>
      <a href="tel:01060223037" className="group rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-6 transition hover:-translate-y-1 hover:border-[#d4af37]/45"><Phone className="h-6 w-6 text-[#d4af37]" /><p className="mt-5 text-sm text-[#f5f0e8]/55">اتصال مباشر</p><h2 dir="ltr" className="mt-1 text-xl font-black group-hover:text-[#d4af37]">01060223037</h2><p className="mt-3 text-sm text-[#f5f0e8]/50">اضغط للاتصال الآن.</p></a>
      <a href={WHATSAPP} target="_blank" rel="noreferrer" className="group rounded-xl border border-[#25d366]/25 bg-[#0d0d12] p-6 transition hover:-translate-y-1 hover:border-[#25d366]/60"><MessageCircle className="h-6 w-6 text-[#25d366]" /><p className="mt-5 text-sm text-[#f5f0e8]/55">واتساب</p><h2 className="mt-1 text-xl font-black group-hover:text-[#25d366]">مراسلة سريعة</h2><p className="mt-3 text-sm text-[#f5f0e8]/50">أرسل استفسارك أو صور القطع المطلوبة.</p></a>
      <div className="rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-6"><MapPin className="h-6 w-6 text-[#d4af37]" /><p className="mt-5 text-sm text-[#f5f0e8]/55">نطاق الخدمة</p><h2 className="mt-1 text-xl font-black">الغردقة والبحر الأحمر</h2><div className="mt-3 flex items-center gap-2 text-sm text-[#f5f0e8]/50"><Clock3 className="h-4 w-4 text-[#d4af37]" />السبت – الخميس: 9ص – 9م</div></div>
    </div></section>
  </main></StoreLayout>;
}
