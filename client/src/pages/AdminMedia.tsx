import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { FileImage, ImagePlus, Trash2, TriangleAlert } from "lucide-react";
import { FormEvent, useState } from "react";

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

type Product = { id: number; name: string; images: { id: number; url: string; altText: string | null; sortOrder: number }[] };

function MediaDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const utils = trpc.useUtils();
  const upload = trpc.products.uploadImage.useMutation({ onSuccess: () => void utils.products.adminList.invalidate() });
  const remove = trpc.products.deleteImage.useMutation({ onSuccess: () => void utils.products.adminList.invalidate() });
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const imageData = await readFile(file);
    await upload.mutateAsync({ productId: product.id, fileName: file.name, imageData, altText: altText.trim() || null, sortOrder: product.images.length });
    setFile(null);
    setAltText("");
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant="outline"><FileImage className="mr-2 h-3.5 w-3.5" />Images ({product.images.length})</Button></DialogTrigger><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Images for {product.name}</DialogTitle><DialogDescription>Upload PNG, JPEG, or WebP images up to 5 MB. The first image is used as the product cover.</DialogDescription></DialogHeader><div className="mt-2 grid max-h-[45vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">{product.images.map(image => <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"><img src={image.url} alt={image.altText || product.name} className="h-full w-full object-cover" /><button type="button" aria-label="Delete image" disabled={remove.isPending} onClick={() => { if (window.confirm("Delete this image?")) void remove.mutateAsync({ id: image.id }); }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-rose-600 shadow-sm opacity-0 transition group-hover:opacity-100 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>)}{product.images.length === 0 && <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No product images have been uploaded.</div>}</div><form onSubmit={event => void submit(event)} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><Input type="file" required accept="image/png,image/jpeg,image/webp" onChange={event => setFile(event.target.files?.[0] ?? null)} /><Input value={altText} onChange={event => setAltText(event.target.value)} placeholder="Image description (optional)" /><Button type="submit" disabled={!file || upload.isPending}><ImagePlus className="mr-2 h-4 w-4" />{upload.isPending ? "Uploading…" : "Upload"}</Button></form>{(upload.error || remove.error) && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{upload.error?.message || remove.error?.message}</p>}</DialogContent></Dialog>;
}

export default function AdminMedia() {
  const { user, loading } = useAuth();
  const products = trpc.products.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (user?.role !== "admin") return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto mt-24 max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><TriangleAlert className="mx-auto h-10 w-10 text-amber-700" /><h1 className="mt-4 text-xl font-semibold">Administrator access required</h1></div></div>;
  return <DashboardLayout><div><p className="text-sm font-medium text-amber-700">Catalog assets</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Product images</h1><p className="mt-2 text-sm text-slate-600">Review product imagery, upload alternate views, and remove outdated images.</p><div className="mt-7 grid gap-4 lg:grid-cols-2">{products.isLoading && Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}{products.data?.map(product => <article key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex min-w-0 items-center gap-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{product.images[0] ? <img src={product.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><FileImage className="h-5 w-5 text-slate-400" /></div>}</div><div className="min-w-0"><p className="truncate font-semibold">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.images.length} image{product.images.length === 1 ? "" : "s"}</p></div></div><MediaDialog product={product} /></article>)}{products.data?.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 lg:col-span-2">Create a product first, then manage its images here.</div>}</div></div></DashboardLayout>;
}
