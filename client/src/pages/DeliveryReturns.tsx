import StoreLayout from "@/components/StoreLayout";
import StorePageHero from "@/components/StorePageHero";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardCheck, MessageCircle, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { Link } from "wouter";

const WHATSAPP = "https://wa.me/201020848619";

export default function DeliveryReturns() {
  return <StoreLayout><main>
    <StorePageHero eyebrow="معلومات الطلب" title={<>التوصيل والاستبدال <span className="text-gold-gradient">بوضوح</span></>} description="نفضّل تأكيد تفاصيل كل طلب قبل التنفيذ: المنتج، الكمية، عنوان التسليم، وتكلفة التوصيل إن وجدت. تواصل معنا إذا احتجت إلى مساعدة قبل الطلب.">
      <Link href="/shop"><Button className="rounded-full bg-gold-gradient px-6 font-black text-black hover:opacity-90">ابدأ التسوق <ArrowLeft className="mr-2 h-4 w-4" /></Button></Link>
      <a href={WHATSAPP} target="_blank" rel="noreferrer"><Button variant="outline" className="rounded-full border-[#d4af37]/45 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f5f0e8]"><MessageCircle className="ml-2 h-4 w-4" />اسأل عبر واتساب</Button></a>
    </StorePageHero>
    <section className="bg-[#08090d] py-14 sm:py-18"><div className="container grid gap-5 md:grid-cols-3">
      {[[ClipboardCheck,"قبل تأكيد الطلب","راجع المقاس والكمية والتوافق مع فريقنا، خصوصًا في الطلبات المرتبطة بتركيبات زجاج محددة."],[Truck,"التوصيل","يتم تأكيد نطاق التوصيل والموعد والتكلفة عند مراجعة طلبك بحسب العنوان والمنتجات المطلوبة."],[RotateCcw,"الاستبدال أو المراجعة","إذا واجهت مشكلة في طلبك، تواصل معنا سريعًا مع رقم الطلب وصور واضحة للمنتج لنتابع الحالة."]].map(([Icon,title,text]) => { const I = Icon as typeof ClipboardCheck; return <article key={title as string} className="rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-6"><I className="h-7 w-7 text-[#d4af37]" /><h2 className="mt-5 text-xl font-black">{title as string}</h2><p className="mt-3 leading-7 text-[#f5f0e8]/60">{text as string}</p></article>; })}
    </div><div className="container mt-8"><div className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><PackageCheck className="h-6 w-6 text-[#d4af37]" /><h2 className="text-xl font-black">هل تحتاج لتأكيد قبل الطلب؟</h2></div><p className="mt-2 max-w-2xl leading-7 text-[#f5f0e8]/60">أرسل لنا اسم القطعة أو رابط المنتج على واتساب، وسنساعدك في مراجعة توفرها وتفاصيلها.</p></div><a href={WHATSAPP} target="_blank" rel="noreferrer"><Button className="w-full rounded-full bg-[#25d366] font-black text-[#08090d] hover:bg-[#1fb85a] sm:w-auto">فتح واتساب</Button></a></div></div></div></section>
  </main></StoreLayout>;
}
