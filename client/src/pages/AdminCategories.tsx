import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Category = { id: number; name: string; slug: string; description: string | null; isActive: boolean; sortOrder: number };
type CategoryValues = { name: string; slug: string; description: string; isActive: boolean; sortOrder: string };
const emptyValues: CategoryValues = { name: "", slug: "", description: "", isActive: true, sortOrder: "0" };

function CategoryDialog({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CategoryValues>(emptyValues);
  const utils = trpc.useUtils();
  const create = trpc.categories.create.useMutation();
  const update = trpc.categories.update.useMutation();
  useEffect(() => { if (open) setValues(category ? { name: category.name, slug: category.slug, description: category.description || "", isActive: category.isActive, sortOrder: String(category.sortOrder) } : emptyValues); }, [category, open]);
  function set<K extends keyof CategoryValues>(key: K, value: CategoryValues[K]) { setValues(current => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) { event.preventDefault(); const payload = { name: values.name.trim(), slug: values.slug.trim().toLowerCase(), description: values.description.trim() || null, isActive: values.isActive, sortOrder: Number(values.sortOrder) }; if (category) await update.mutateAsync({ id: category.id, ...payload }); else await create.mutateAsync(payload); await utils.categories.adminList.invalidate(); await utils.categories.list.invalidate(); setOpen(false); }
  const pending = create.isPending || update.isPending;
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{category ? <Button size="sm" variant="outline"><Pencil className="mr-2 h-3.5 w-3.5" />Edit</Button> : <Button><Plus className="mr-2 h-4 w-4" />New category</Button>}</DialogTrigger><DialogContent><DialogHeader><DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle><DialogDescription>Categories organize the storefront and can be hidden without removing their products.</DialogDescription></DialogHeader><form onSubmit={event => void submit(event)} className="mt-3 grid gap-4"><label className="grid gap-2 text-sm font-medium">Name<Input required value={values.name} onChange={event => { set("name", event.target.value); if (!category) set("slug", event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")); }} /></label><label className="grid gap-2 text-sm font-medium">Slug<Input required value={values.slug} onChange={event => set("slug", event.target.value)} /></label><label className="grid gap-2 text-sm font-medium">Description<Textarea value={values.description} onChange={event => set("description", event.target.value)} rows={3} /></label><label className="grid gap-2 text-sm font-medium">Sort order<Input required type="number" min="0" value={values.sortOrder} onChange={event => set("sortOrder", event.target.value)} /></label><div className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><div><Label htmlFor="category-active">Visible in catalog</Label><p className="text-xs text-slate-500">Customer can browse this category.</p></div><Switch id="category-active" checked={values.isActive} onCheckedChange={value => set("isActive", value)} /></div>{(create.error || update.error) && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{create.error?.message || update.error?.message}</p>}<div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending} type="submit">{pending ? "Saving…" : "Save category"}</Button></div></form></DialogContent></Dialog>;
}

export default function AdminCategories() {
  const { user, loading } = useAuth();
  const categories = trpc.categories.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();
  const remove = trpc.categories.delete.useMutation({ onSuccess: () => { void utils.categories.adminList.invalidate(); void utils.categories.list.invalidate(); } });
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (user?.role !== "admin") return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto mt-24 max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><TriangleAlert className="mx-auto h-10 w-10 text-amber-700" /><h1 className="mt-4 text-xl font-semibold">Administrator access required</h1></div></div>;
  return <DashboardLayout><div><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-amber-700">Catalog taxonomy</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Categories</h1><p className="mt-2 text-sm text-slate-600">Name, describe, sort, hide, or remove the categories used in the storefront.</p></div><CategoryDialog /></div><div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Visibility</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{categories.isLoading && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading categories…</td></tr>}{categories.data?.map(category => <tr key={category.id} className="border-t border-slate-100"><td className="px-5 py-4 font-medium">{category.name}</td><td className="px-5 py-4 text-slate-500">{category.slug}</td><td className="max-w-[240px] truncate px-5 py-4 text-slate-500">{category.description || "—"}</td><td className="px-5 py-4">{category.sortOrder}</td><td className="px-5 py-4"><span className={category.isActive ? "text-emerald-700" : "text-slate-500"}>{category.isActive ? "Visible" : "Hidden"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><CategoryDialog category={category} /><Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => { if (window.confirm(`Delete ${category.name}? Products will remain but lose their category.`)) void remove.mutateAsync({ id: category.id }); }}><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>)}{categories.data?.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-500">No categories yet. Add one to organize your products.</td></tr>}</tbody></table></div></div></div></DashboardLayout>;
}
