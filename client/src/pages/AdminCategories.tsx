import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, FolderTree, Loader2, Pencil, Plus, RefreshCw, Save, Search, Trash2, TriangleAlert, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CategoryForm = { name: string; slug: string; description: string; sortOrder: string; isActive: boolean };
const empty: CategoryForm = { name: "", slug: "", description: "", sortOrder: "0", isActive: true };
const fieldClass = "mt-2 w-full rounded-xl border border-[#d4af37]/20 bg-black/25 px-3 py-3 text-sm text-[#f5f0e8] outline-none transition placeholder:text-[#f5f0e8]/25 focus:border-[#d4af37]/70 focus:ring-2 focus:ring-[#d4af37]/10";
const panelClass = "rounded-2xl border border-[#d4af37]/15 bg-[#0d0d12] shadow-[0_18px_70px_rgba(0,0,0,.18)]";

function slugFor(name: string) {
  const ascii = name.normalize("NFKD").replace(/[^\u0000-\u007E\s-]/g, "").trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  return ascii || `category-${Date.now()}`;
}

function Editor({ category, close }: { category?: any; close: () => void }) {
  const [form, setForm] = useState<CategoryForm>(empty);
  const [error, setError] = useState("");
  const categories = trpc.useUtils();
  const create = trpc.categories.create.useMutation();
  const update = trpc.categories.update.useMutation();
  useEffect(() => {
    setForm(category ? { name: category.name, slug: category.slug, description: category.description || "", sortOrder: String(category.sortOrder), isActive: category.isActive } : empty);
    setError("");
  }, [category]);
  const set = <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) => setForm(value => ({ ...value, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("اكتب اسم القسم أولاً.");
    const order = Number(form.sortOrder);
    if (!Number.isInteger(order) || order < 0) return setError("يجب أن يكون ترتيب العرض رقماً صحيحاً موجباً أو صفراً.");
    try {
      const payload = { name: form.name.trim(), slug: form.slug.trim() || slugFor(form.name), description: form.description.trim() || null, sortOrder: order, isActive: form.isActive };
      if (category) await update.mutateAsync({ id: category.id, ...payload });
      else await create.mutateAsync(payload);
      await Promise.all([categories.categories.adminList.invalidate(), categories.categories.list.invalidate()]);
      close();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر حفظ القسم. راجع البيانات وحاول مرة أخرى.");
    }
  }
  const pending = create.isPending || update.isPending;
  return <form onSubmit={event => void submit(event)} className={`${panelClass} mt-6 p-5 sm:p-6`}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.2em] text-[#d4af37]/75">بيانات القسم</p><h2 className="mt-2 text-xl font-black">{category ? "تعديل القسم" : "إضافة قسم جديد"}</h2><p className="mt-2 text-xs leading-6 text-[#f5f0e8]/45">استخدم الأقسام لتنظيم الكتالوج وتسهيل وصول العميل إلى المنتجات.</p></div><button type="button" onClick={close} className="text-[#f5f0e8]/45 hover:text-[#d4af37]" aria-label="إغلاق"><X className="h-5 w-5" /></button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">اسم القسم<Input required className={fieldClass} value={form.name} onChange={event => { const name = event.target.value; setForm(value => ({ ...value, name, slug: category ? value.slug : slugFor(name) })); }} placeholder="مثال: مقابض الأبواب" /></label><label className="text-sm font-bold">الرابط المختصر <span className="font-normal text-[#f5f0e8]/40">(اختياري)</span><Input dir="ltr" className={`${fieldClass} text-left`} value={form.slug} onChange={event => set("slug", event.target.value)} placeholder="door-handles" /></label><label className="text-sm font-bold sm:col-span-2">وصف القسم<Textarea className={`${fieldClass} min-h-24`} value={form.description} onChange={event => set("description", event.target.value)} placeholder="وصف قصير يساعدك على تنظيم الكتالوج…" /></label><label className="text-sm font-bold">ترتيب العرض<Input required type="number" min="0" step="1" className={fieldClass} value={form.sortOrder} onChange={event => set("sortOrder", event.target.value)} /></label><label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-[#d4af37]/15 bg-black/20 p-3 text-sm"><input type="checkbox" checked={form.isActive} onChange={event => set("isActive", event.target.checked)} />ظاهر للعملاء في المتجر</label></div>
    {error && <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/5 p-3 text-sm text-rose-200"><AlertTriangle className="h-4 w-4" />{error}</p>}
    <div className="mt-6 flex flex-wrap gap-3"><Button type="submit" disabled={pending} className="rounded-xl bg-gold-gradient font-black text-black">{pending ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جارٍ الحفظ…</> : <><Save className="ml-2 h-4 w-4" />حفظ القسم</>}</Button><Button type="button" variant="outline" className="rounded-xl border-[#d4af37]/30 text-[#d4af37]" onClick={close}>إلغاء</Button></div>
  </form>;
}

export default function AdminCategories() {
  const { user, loading } = useAuth();
  const q = trpc.categories.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();
  const remove = trpc.categories.delete.useMutation({ onSuccess: () => { void utils.categories.adminList.invalidate(); void utils.categories.list.invalidate(); } });
  const [edit, setEdit] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const categories = useMemo(() => (q.data || []).filter(category => `${category.name} ${category.slug} ${category.description || ""}`.toLowerCase().includes(search.toLowerCase())), [q.data, search]);
  if (loading) return <div className="min-h-screen bg-[#08090d]" />;
  if (user?.role !== "admin") return <div className="grid min-h-screen place-items-center bg-[#08090d] p-6 text-center text-[#f5f0e8]"><div className={`${panelClass} p-8`}><TriangleAlert className="mx-auto h-10 w-10 text-[#d4af37]" /><h1 className="mt-4 text-xl font-black">يلزم صلاحية مدير</h1><p className="mt-2 text-sm text-[#f5f0e8]/55">سجّل الدخول بحساب مدير للوصول إلى هذه الصفحة.</p></div></div>;
  const closeEditor = () => { setEdit(null); setAdding(false); };
  async function deleteCategory(category: any) {
    if (!window.confirm(`حذف قسم ${category.name}؟`)) return;
    setError("");
    try { await remove.mutateAsync({ id: category.id }); } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذر حذف القسم. تأكد من عدم ارتباط منتجات به."); }
  }
  return <DashboardLayout><div className="space-y-7">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-black tracking-[.24em] text-[#d4af37]/75">تنظيم المتجر</p><h1 className="mt-2 text-3xl font-black sm:text-4xl"><span className="text-gold-gradient">الأقسام</span></h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#f5f0e8]/55">نظّم الكتالوج، رتّب الأقسام، وأخفِ ما لم يجهز بعد دون حذف بياناته.</p></div><Button className="rounded-xl bg-gold-gradient font-black text-black" onClick={() => { setEdit(null); setAdding(true); }}><Plus className="ml-2 h-4 w-4" />إضافة قسم</Button></div>
    <div className="grid gap-3 sm:grid-cols-3"><div className={`${panelClass} p-4`}><FolderTree className="h-5 w-5 text-[#d4af37]" /><p className="mt-3 text-2xl font-black">{q.data?.length || 0}</p><p className="mt-1 text-xs text-[#f5f0e8]/45">كل الأقسام</p></div><div className={`${panelClass} p-4`}><CheckCircle2 className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-2xl font-black">{q.data?.filter(category => category.isActive).length || 0}</p><p className="mt-1 text-xs text-[#f5f0e8]/45">ظاهرة للعملاء</p></div><div className={`${panelClass} p-4`}><Search className="h-5 w-5 text-sky-300" /><p className="mt-3 text-2xl font-black">{categories.length}</p><p className="mt-1 text-xs text-[#f5f0e8]/45">نتائج البحث الحالية</p></div></div>
    {(adding || edit) && <Editor category={edit || undefined} close={closeEditor} />}
    <div className={`${panelClass} flex flex-col gap-3 p-4 sm:flex-row`}><div className="relative flex-1"><Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#f5f0e8]/35" /><Input value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-xl border-[#d4af37]/15 bg-black/20 pr-10" placeholder="ابحث باسم القسم أو الرابط…" /></div><Button variant="outline" className="rounded-xl border-[#d4af37]/30 text-[#d4af37]" onClick={() => void q.refetch()}><RefreshCw className="ml-2 h-4 w-4" />تحديث</Button></div>
    {error && <div className="flex items-center gap-3 rounded-xl border border-rose-400/25 bg-rose-400/5 p-4 text-sm text-rose-200"><AlertTriangle className="h-5 w-5" />{error}</div>}
    {q.isError && <div className="flex items-center gap-3 rounded-xl border border-rose-400/25 bg-rose-400/5 p-4 text-sm text-rose-200"><AlertTriangle className="h-5 w-5" />تعذر تحميل الأقسام.<Button variant="ghost" className="mr-auto text-rose-200" onClick={() => void q.refetch()}><RefreshCw className="h-4 w-4" /></Button></div>}
    {q.isLoading ? <div className={`${panelClass} p-12 text-center text-sm text-[#f5f0e8]/50`}>جارٍ تحميل الأقسام…</div> : <div className={`${panelClass} overflow-hidden`}><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-right text-sm"><thead className="bg-black/35 text-xs text-[#d4af37]/75"><tr><th className="p-4">القسم</th><th className="p-4">الرابط</th><th className="p-4">الوصف</th><th className="p-4">الترتيب</th><th className="p-4">الظهور</th><th className="p-4">الإجراءات</th></tr></thead><tbody>{categories.map(category => <tr key={category.id} className="border-t border-[#d4af37]/10 transition hover:bg-white/[.025]"><td className="p-4 font-bold">{category.name}</td><td dir="ltr" className="p-4 text-[#f5f0e8]/45">{category.slug}</td><td className="max-w-64 truncate p-4 text-[#f5f0e8]/55">{category.description || "—"}</td><td className="p-4">{category.sortOrder}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs ${category.isActive ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-[#f5f0e8]/45"}`}>{category.isActive ? "ظاهر" : "مخفي"}</span></td><td className="p-4"><div className="flex gap-2"><Button size="sm" variant="outline" className="rounded-lg border-[#d4af37]/30 text-[#d4af37]" onClick={() => { setAdding(false); setEdit(category); }}><Pencil className="h-3.5 w-3.5" /></Button><Button size="sm" variant="ghost" disabled={remove.isPending} className="rounded-lg text-rose-300 hover:bg-rose-500/10" onClick={() => void deleteCategory(category)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>)}{categories.length === 0 && <tr><td colSpan={6} className="p-10"><div className="text-center text-[#f5f0e8]/50"><FolderTree className="mx-auto h-8 w-8 text-[#d4af37]/60" /><p className="mt-3 font-bold">{search ? "لا توجد نتائج مطابقة" : "لا توجد أقسام بعد"}</p><p className="mt-2 text-sm">{search ? "جرّب كلمة بحث مختلفة." : "أضف أول قسم لبدء تنظيم المنتجات."}</p></div></td></tr>}</tbody></table></div></div>}
  </div></DashboardLayout>;
}
