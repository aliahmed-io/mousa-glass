import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatMoney, primaryImage } from "@/lib/commerce";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug });
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  if (isLoading) return <StoreLayout><div className="container py-14"><div className="h-96 animate-pulse rounded-3xl bg-slate-200" /></div></StoreLayout>;
  if (!product) return <StoreLayout><div className="container py-20 text-center"><h1 className="text-2xl font-semibold">Product not found</h1><Link href="/shop"><Button variant="outline" className="mt-5">Back to catalog</Button></Link></div></StoreLayout>;
  const image = primaryImage(product.images);
  return <StoreLayout><main className="container py-8 sm:py-12"><Link href="/shop" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-700"><ArrowLeft className="mr-1 h-4 w-4" />Back to catalog</Link><div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_.95fr]"><div className="overflow-hidden rounded-3xl bg-slate-100"><img src={image} alt={product.name} className="aspect-square h-full w-full object-cover" /></div><section className="flex flex-col justify-center"><p className="text-sm font-medium text-amber-700">{product.category?.name || "Mousa Glass product"}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{product.name}</h1><p className="mt-5 text-3xl font-semibold text-slate-900">{formatMoney(product.priceAmount)}</p><p className="mt-6 whitespace-pre-wrap leading-7 text-slate-600">{product.description || "Contact our team if you need help choosing the right configuration."}</p><div className="mt-7 flex items-center gap-3 text-sm"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}><Check className="h-4 w-4" />{product.stock > 0 ? `${product.stock} available` : "Currently unavailable"}</span></div>{product.stock > 0 && <div className="mt-7 flex flex-col gap-3 sm:flex-row"><div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-white"><button className="grid h-full w-11 place-items-center rounded-l-xl hover:bg-slate-50" onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus className="h-4 w-4" /></button><span className="w-10 text-center text-sm font-semibold">{quantity}</span><button className="grid h-full w-11 place-items-center rounded-r-xl hover:bg-slate-50" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))}><Plus className="h-4 w-4" /></button></div><Button size="lg" className="flex-1" onClick={() => addItem({ productId: product.id, slug: product.slug, name: product.name, priceAmount: product.priceAmount, imageUrl: image, stock: product.stock }, quantity)}><ShoppingBag className="mr-2 h-4 w-4" />Add {quantity} to cart</Button></div>}<div className="mt-8 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">Checkout supports Cash on Delivery and InstaPay proof submission. After you place an order, our team confirms it on WhatsApp.</div></section></div></main></StoreLayout>;
}
