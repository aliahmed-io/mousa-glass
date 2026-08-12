import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";

const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const DeliveryReturns = lazy(() => import("@/pages/DeliveryReturns"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminCategories = lazy(() => import("@/pages/AdminCategories"));
const AdminMedia = lazy(() => import("@/pages/AdminMedia"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageLoading() {
  return <div dir="rtl" className="grid min-h-screen place-items-center bg-[#08090d] px-6 text-center text-[#f5f0e8]"><div><div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#d4af37]/25 border-t-[#d4af37]" /><p className="mt-4 text-sm text-[#f5f0e8]/55">جارٍ تحميل الصفحة…</p></div></div>;
}

function Router() {
  return <Suspense fallback={<PageLoading />}><Switch>
    <Route path="/" component={Home} />
    <Route path="/shop" component={Shop} />
    <Route path="/about" component={About} />
    <Route path="/contact" component={Contact} />
    <Route path="/delivery&returns" component={DeliveryReturns} />
    <Route path="/faq" component={FAQ} />
    <Route path="/products/:slug" component={ProductDetail} />
    <Route path="/cart" component={Cart} />
    <Route path="/checkout" component={Checkout} />
    <Route path="/orders" component={Orders} />
    <Route path="/admin" component={AdminDashboard} />
    <Route path="/admin/products" component={AdminDashboard} />
    <Route path="/admin/media" component={AdminMedia} />
    <Route path="/admin/categories" component={AdminCategories} />
    <Route path="/admin/orders/:id" component={AdminDashboard} />
    <Route path="/admin/orders" component={AdminDashboard} />
    <Route path="/admin/settings" component={AdminDashboard} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><CartProvider><Toaster /><Router /></CartProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
