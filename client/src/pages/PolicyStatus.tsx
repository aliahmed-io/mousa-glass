import StoreLayout from "@/components/StoreLayout";
import StorePageHero from "@/components/StorePageHero";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BadgeAlert, Banknote, FileText, LockKeyhole, MessageCircle, Scale, Truck } from "lucide-react";
import { Link } from "wouter";

const pendingTopics = [
  { icon: LockKeyhole, title: "الخصوصية وبيانات العملاء", text: "لم تُعتمد بعد سياسة توضح أنواع البيانات، أغراض استخدامها، ومدة الاحتفاظ بها وطلب حذفها." },
  { icon: FileText, title: "شروط البيع والطلب", text: "لم تُعتمد بعد شروط بيع أو التزامات تعاقدية أو ضوابط لتأكيد الطلبات الحقيقية." },
  { icon: Truck, title: "التوصيل والاستبدال", text: "لم تُعتمد بعد مناطق التغطية، الرسوم، المواعيد، الاستبدال أو الإرجاع النهائي." },
  { icon: Banknote, title: "الدفع عند الاستلام وإثبات InstaPay", text: "لم تُعتمد بعد إجراءات الدفع أو إثبات التحويل أو مراجعته أو الاحتفاظ به وحذفه." },
  { icon: MessageCircle, title: "التواصل والشكاوى", text: "لم تُعتمد بعد قنوات التواصل الرسمية أو أوقات الاستجابة أو آلية معالجة الشكاوى." },
] as const;

export default function PolicyStatus() {
  return <StoreLayout><main>
    <StorePageHero eyebrow="شفافية قبل الإطلاق" title={<>حالة <span className="text-gold-gradient">السياسات</span></>} description="هذه الصفحة توضح ما لم يُعتمد بعد. إنها ليست سياسة خصوصية أو شروط بيع أو عرضاً تعاقدياً، ولا تُنشئ طلباً أو حقاً أو التزاماً.">
      <Link href="/contact"><Button className="rounded-full bg-gold-gradient px-6 font-black text-black hover:opacity-90">تواصل مع الإدارة <ArrowLeft className="mr-2 h-4 w-4" /></Button></Link>
    </StorePageHero>
    <section className="bg-[#08090d] py-14 sm:py-18">
      <div className="container">
        <div role="note" className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm leading-7 text-amber-50 sm:p-6"><div className="flex items-start gap-3"><BadgeAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /><div><h2 className="font-black text-amber-100">المتجر في وضع عرض تجريبي</h2><p className="mt-2">المنتجات والصور المعروضة مخصّصة لاختبار الواجهة فقط، وإنشاء الطلبات الحقيقية معطّل. لا تعتمد على هذه الصفحة لاتخاذ قرار شراء أو تسليم بيانات أو إرسال دفعة.</p></div></div></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pendingTopics.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] p-6"><div className="flex items-start justify-between gap-4"><Icon className="h-7 w-7 shrink-0 text-[#d4af37]" /><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">قيد الاعتماد</span></div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-3 leading-7 text-[#f5f0e8]/60">{text}</p></article>)}
        </div>
        <div className="mt-8 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/8 p-6 sm:p-8"><div className="flex items-start gap-4"><Scale className="mt-0.5 h-6 w-6 shrink-0 text-[#d4af37]" /><div><h2 className="text-xl font-black">متى تصبح هذه المعلومات رسمية؟</h2><p className="mt-2 max-w-3xl leading-7 text-[#f5f0e8]/60">بعد اعتماد إدارة المتجر والجهة القانونية المختصة للنصوص العربية، وسياسات حفظ وحذف إثباتات الدفع، ومعلومات المنتجات والتوصيل الفعلية. حتى ذلك الحين، تبقى هذه الصفحة بيان حالة فقط.</p></div></div></div>
      </div>
    </section>
  </main></StoreLayout>;
}
