import StoreLayout from "@/components/StoreLayout";
import StorePageHero from "@/components/StorePageHero";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

const WHATSAPP = "https://wa.me/201020848619";
const questions = [
  ["كيف أجد القطعة المناسبة؟", "استخدم البحث أو الأقسام داخل المتجر، ثم راجع اسم المنتج ووصفه وحالة المخزون. إذا كنت تحتاج تأكيدًا قبل الطلب، تواصل معنا عبر واتساب."],
  ["هل يمكنني الاستفسار قبل الطلب؟", "نعم. يمكنك الاتصال على الأرقام الظاهرة في صفحة التواصل أو مراسلتنا مباشرة على واتساب لتأكيد المنتج والكمية."],
  ["كيف أعرف أن المنتج متاح؟", "تظهر حالة المخزون في صفحة المنتج. قد تتغير الكمية، لذلك يظل التواصل المباشر مفيدًا للطلبات المهمة أو الكميات الكبيرة."],
  ["كيف يتم تأكيد التوصيل؟", "بعد مراجعة الطلب، يتم تأكيد عنوان التسليم وتكلفة وموعد التوصيل بحسب المنتجات والعنوان."],
  ["ماذا أفعل إذا احتجت مساعدة بشأن طلب قائم؟", "اذكر رقم الطلب عند التواصل معنا، وأرسل صورًا واضحة عند الحاجة لمراجعة منتج أو تفصيل مرتبط بالطلب."],
];

export default function FAQ() {
  return <StoreLayout><main>
    <StorePageHero eyebrow="مركز المساعدة" title={<>أسئلة شائعة <span className="text-gold-gradient">قبل الطلب وبعده</span></>} description="جمعنا إجابات سريعة عن اختيار المنتجات، الاستفسار، التوصيل، ومتابعة الطلبات. ستجد فريقنا متاحًا أيضًا على واتساب للمساعدة المباشرة.">
      <Link href="/shop"><Button className="rounded-full bg-gold-gradient px-6 font-black text-black hover:opacity-90"><ShoppingCart className="ml-2 h-4 w-4" />تصفح المنتجات</Button></Link>
      <a href={WHATSAPP} target="_blank" rel="noreferrer"><Button variant="outline" className="rounded-full border-[#d4af37]/45 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f5f0e8]"><MessageCircle className="ml-2 h-4 w-4" />اسأل على واتساب</Button></a>
    </StorePageHero>
    <section className="bg-[#08090d] py-14 sm:py-18"><div className="container max-w-4xl"><div className="mb-6 flex items-center gap-3 text-[#d4af37]"><Search className="h-5 w-5" /><p className="text-sm font-bold">إجابات مفيدة وسريعة</p></div><div className="space-y-3">{questions.map(([question, answer]) => <details key={question} className="group rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] px-5 py-4 open:border-[#d4af37]/45"><summary className="cursor-pointer list-none text-base font-black text-[#f5f0e8] marker:hidden"><span className="flex items-center justify-between gap-4"><span>{question}</span><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#d4af37]/25 text-[#d4af37] transition group-open:rotate-45">+</span></span></summary><p className="pt-4 leading-8 text-[#f5f0e8]/60">{answer}</p></details>)}</div></div></section>
  </main></StoreLayout>;
}
