import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Cart from "@/pages/Cart";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCategories from "@/pages/AdminCategories";
import AdminMedia from "@/pages/AdminMedia";
import Checkout from "@/pages/Checkout";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Orders from "@/pages/Orders";
import ProductDetail from "@/pages/ProductDetail";
import Shop from "@/pages/Shop";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/shop" component={Shop} />
    <Route path="/products/:slug" component={ProductDetail} />
    <Route path="/cart" component={Cart} />
    <Route path="/checkout" component={Checkout} />
    <Route path="/orders" component={Orders} />
    <Route path="/admin" component={AdminDashboard} />
    <Route path="/admin/products" component={AdminDashboard} />
    <Route path="/admin/media" component={AdminMedia} />
    <Route path="/admin/categories" component={AdminCategories} />
    <Route path="/admin/orders" component={AdminDashboard} />
    <Route path="/admin/settings" component={AdminDashboard} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><CartProvider><Toaster /><Router /></CartProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
