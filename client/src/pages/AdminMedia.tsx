import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, FileImage, ImagePlus, RefreshCw, Search, Trash2, TriangleAlert, UploadCloud } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

function fileData(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProductImages({ product }: { product: any }) {
  const [files, setFiles] = useState<File[]>([]);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const utils = trpc.useUtils();
  const upload = trpc.products.uploadImage.useMutation({ onSuccess: () => void utils.products.adminList.invalidate() });
  const remove = trpc.products.deleteImage.useMutation({ onSuccess: () => void utils.products.adminList.invalidate() });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!files.length) return;
    setError("");
    setSuccess("");
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file) continue;
        await upload.mutateAsync({ productId: product.id, fileName: file.name, imageData: await fileData(file), altText: alt.trim() || null, sortOrder: product.images.length + index });
      }
      setFiles([]);
      setAlt("");
      setSuccess(`تم رفع ${files.length} صورة بنجاح.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر رفع الصور. حاول مرة أخرى.");
    }
  }

  return <article className="rounded-2xl border border-[#d4af37]/15 bg-[#0d0d12] p-5 shadow-[0_18px_70px_rgba(0,0,0,.14)] sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><FileImage className="h-4 w-4 text-[#d4af37]" /><h2 className="font-black">{product.name}</h2></div><p className="mt-2 text-xs text-[#f5f0e8]/45">{product.images.length} صورة محفوظة · يمكنك رفع عدة صور مرة واحدة</p></div><span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-bold text-[#d4af37]">{product.images.length ? "يحتوي على صور" : "يحتاج صورة"}</span></div>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{product.images.map((image: any, index: number) => <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border border-[#d4af37]/10 bg-black"><img src={image.url} alt={image.altText || product.name} className="h-full w-full object-cover" /><span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white">{index === 0 ? "الرئيسية" : `صورة ${index + 1}`}</span><button aria-label={`حذف الصورة ${index + 1}`} className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/80 text-rose-300 opacity-0 transition group-hover:opacity-100 focus:opacity-100" onClick={() => { if (window.confirm("حذف هذه الصورة؟")) void remove.mutateAsync({ id: image.id }); }}><Trash2 className="h-4 w-4" /></button></div>)}{product.images.length === 0 && <div className="col-span-full rounded-xl border border-dashed border-[#d4af37]/25 p-8 text-center text-sm text-[#f5f0e8]/45"><FileImage className="mx-auto h-8 w-8 text-[#d4af37]/60" /><p className="mt-3">لم يتم رفع صور لهذا المنتج بعد.</p></div>}</div>
    <form onSubmit={e => void submit(e)} className="mt-5 rounded-xl border border-[#d4af37]/10 bg-black/20 p-4"><div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_auto]"><label className="text-sm font-bold">اختيار الصور<Input type="file" required multiple accept="image/png,image/jpeg,image/webp" className="mt-2 border-[#d4af37]/20 bg-black/25" onChange={e => setFiles(Array.from(e.target.files || []))} /></label><label className="text-sm font-bold">النص البديل <span className="font-normal text-[#f5f0e8]/40">(اختياري)</span><Input value={alt} className="mt-2 border-[#d4af37]/20 bg-black/25" placeholder="مثال: مقبض زجاج ذهبي" onChange={e => setAlt(e.target.value)} /></label><Button type="submit" disabled={!files.length || upload.isPending} className="self-end bg-gold-gradient font-black text-black">{upload.isPending ? "جارٍ الرفع…" : <><UploadCloud className="ml-2 h-4 w-4" />رفع {files.length ? `${files.length} صور` : "الصور"}</>}</Button></div>{files.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{files.map(file => <span key={`${file.name}-${file.size}`} className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs text-[#d4af37]">{file.name}</span>)}</div>}{error && <p className="mt-3 flex items-center gap-2 text-sm text-rose-200"><AlertTriangle className="h-4 w-4" />{error}</p>}{success && <p className="mt-3 flex items-center gap-2 text-sm text-emerald-200"><CheckCircle2 className="h-4 w-4" />{success}</p>}</form>
  </article>;
}

export default function AdminMedia() {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const products = trpc.products.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  const filtered = useMemo(() => (products.data || []).filter(product => product.name.toLowerCase().includes(search.toLowerCase())), [products.data, search]);
  if (loading) return <div className="min-h-screen bg-[#08090d]" />;
  if (user?.role !== "admin") return <div className="grid min-h-screen place-items-center bg-[#08090d] p-6 text-center"><div className="rounded-2xl border border-[#d4af37]/25 bg-[#0d0d12] p-8"><TriangleAlert className="mx-auto h-10 w-10 text-[#d4af37]" /><h1 className="mt-4 text-xl font-black">يلزم صلاحية مدير</h1></div></div>;
  return <DashboardLayout><div className="space-y-7"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-black tracking-[.24em] text-[#d4af37]/75">مكتبة المتجر</p><h1 className="mt-2 text-3xl font-black sm:text-4xl"><span className="text-gold-gradient">صور المنتجات</span></h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#f5f0e8]/55">أضف صوراً عالية الجودة، اكتب النص البديل، واحذف الصور القديمة دون مغادرة مساحة إدارة الكتالوج.</p></div><div className="grid grid-cols-2 gap-3 sm:flex"><div className="rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] px-4 py-3"><p className="text-xs text-[#f5f0e8]/45">المنتجات</p><p className="mt-1 text-xl font-black">{products.data?.length || 0}</p></div><div className="rounded-xl border border-[#d4af37]/15 bg-[#0d0d12] px-4 py-3"><p className="text-xs text-[#f5f0e8]/45">صور محفوظة</p><p className="mt-1 text-xl font-black text-[#d4af37]">{products.data?.reduce((sum, product) => sum + product.images.length, 0) || 0}</p></div></div></div><div className="relative"><Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#f5f0e8]/35" /><Input value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border-[#d4af37]/15 bg-[#0d0d12] pr-10" placeholder="ابحث عن منتج لإدارة صوره…" /></div>{products.isError && <div className="flex items-center gap-3 rounded-xl border border-rose-400/25 bg-rose-400/5 p-4 text-sm text-rose-200"><TriangleAlert className="h-5 w-5" />تعذر تحميل مكتبة الصور.<Button variant="ghost" className="mr-auto text-rose-200" onClick={() => void products.refetch()}><RefreshCw className="h-4 w-4" /></Button></div>}{products.isLoading && <div className="rounded-2xl border border-[#d4af37]/15 bg-[#0d0d12] p-10 text-center text-sm text-[#f5f0e8]/50">جارٍ تحميل مكتبة الصور…</div>}<div className="space-y-5">{filtered.map(product => <ProductImages key={product.id} product={product} />)}{!products.isLoading && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[#d4af37]/30 bg-[#0d0d12] p-12 text-center text-[#f5f0e8]/45"><FileImage className="mx-auto h-9 w-9 text-[#d4af37]/60" /><p className="mt-4 font-bold">{search ? "لا توجد نتائج مطابقة" : "أضف منتجاً أولاً لإدارة صوره"}</p><p className="mt-2 text-sm">{search ? "جرّب اسماً مختلفاً للمنتج." : "يمكنك العودة إلى صفحة المنتجات وإنشاء المنتج مع الصور."}</p></div>}</div></div></DashboardLayout>;
}
