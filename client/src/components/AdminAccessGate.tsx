import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, KeyRound, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminAccessGate({ signedIn }: { signedIn: boolean }) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const authorize = trpc.auth.authorizeAdmin.useMutation({
    onSuccess: async () => {
      setPassphrase("");
      setError("");
      await utils.auth.adminAccess.invalidate();
    },
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await authorize.mutateAsync({ passphrase });
    } catch {
      setError("تعذر اعتماد رمز الإدارة. تأكد من الرمز وحاول مرة أخرى.");
    }
  }

  return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#08090d] p-6 text-center text-[#f5f0e8]"><section className="w-full max-w-md rounded-2xl border border-[#d4af37]/20 bg-[#0d0d12] p-7 shadow-[0_18px_70px_rgba(0,0,0,.3)]"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37]"><KeyRound className="h-6 w-6" /></span><h1 className="mt-5 text-xl font-black">يتطلب الوصول إلى الإدارة اعتماداً</h1>{signedIn ? <><p className="mt-3 text-sm leading-7 text-[#f5f0e8]/60">أدخل رمز الإدارة لإتاحة جلسة إدارة مؤقتة وآمنة لهذا الحساب.</p><form className="mt-6 space-y-4 text-right" onSubmit={event => void submit(event)}><label className="block text-sm font-bold">رمز الإدارة<Input dir="ltr" type="password" autoComplete="current-password" value={passphrase} onChange={event => setPassphrase(event.target.value)} className="mt-2 h-11 border-[#d4af37]/25 bg-black/20 text-left" required maxLength={128} /></label>{error && <p role="alert" className="flex items-center gap-2 text-sm text-rose-200"><AlertTriangle className="h-4 w-4" />{error}</p>}<Button type="submit" className="w-full rounded-xl bg-gold-gradient font-black text-black" disabled={authorize.isPending}>{authorize.isPending ? "جارٍ الاعتماد…" : "فتح لوحة الإدارة"}</Button></form><p className="mt-4 text-xs leading-6 text-[#f5f0e8]/40">تنتهي الجلسة تلقائياً بعد ثماني ساعات أو عند تسجيل الخروج.</p></> : <><p className="mt-3 text-sm leading-7 text-[#f5f0e8]/60">سجّل الدخول أولاً، ثم أدخل رمز الإدارة لفتح مساحة الإدارة.</p><Button type="button" className="mt-6 rounded-xl bg-gold-gradient font-black text-black" onClick={() => startLogin()}><LogIn className="ml-2 h-4 w-4" />تسجيل الدخول</Button></>}</section></main>;
}
