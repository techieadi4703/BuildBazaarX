import React from "react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AdminRoute } from "./components/admin/AdminRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/shared/PageTransition";

const Index = React.lazy(() => import("./pages/Index"));
const DesignsCatalog = React.lazy(() => import("./pages/DesignsCatalog"));
const DesignDetail = React.lazy(() => import("./pages/DesignDetail"));
const RawMaterials = React.lazy(() => import("./pages/RawMaterials"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Auth = React.lazy(() => import("./pages/Auth"));
const AuthRoleSelect = React.lazy(() => import("./pages/AuthRoleSelect"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Orders = React.lazy(() => import("./pages/Orders"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const ProfessionalAuth = React.lazy(() => import("./pages/ProfessionalAuth"));
const ProfessionalDashboard = React.lazy(() => import("./pages/ProfessionalDashboard"));
const ProfessionalSetup = React.lazy(() => import("./pages/ProfessionalSetup"));
const DesignerAuth = React.lazy(() => import("./pages/DesignerAuth"));
const DesignerDashboard = React.lazy(() => import("./pages/DesignerDashboard"));
const DesignerSetup = React.lazy(() => import("./pages/DesignerSetup"));
const SupplierAuth = React.lazy(() => import("./pages/SupplierAuth"));
const SupplierDashboard = React.lazy(() => import("./pages/SupplierDashboard"));
const SupplierSetup = React.lazy(() => import("./pages/SupplierSetup"));

const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminCustomers = React.lazy(() => import("./pages/admin/Customers"));
const AdminProfessionals = React.lazy(() => import("./pages/admin/Professionals"));
const AdminDesigners = React.lazy(() => import("./pages/admin/Designers"));
const AdminSuppliers = React.lazy(() => import("./pages/admin/Suppliers"));
const AdminDesigns = React.lazy(() => import("./pages/admin/Designs"));
const AdminProducts = React.lazy(() => import("./pages/admin/Products"));
const AdminOrders = React.lazy(() => import("./pages/admin/Orders"));
const AdminTickets = React.lazy(() => import("./pages/admin/Tickets"));
const AdminCoupons = React.lazy(() => import("./pages/admin/Coupons"));
const AdminBanners = React.lazy(() => import("./pages/admin/Banners"));
const AdminSettings = React.lazy(() => import("./pages/admin/Settings"));
const AdminReports = React.lazy(() => import("./pages/admin/Reports"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 minute default cache
      retry: 2,                   // more retries for resilience
      refetchOnWindowFocus: false,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/designs" element={<PageTransition><DesignsCatalog /></PageTransition>} />
        <Route path="/designs/:id" element={<PageTransition><DesignDetail /></PageTransition>} />
        <Route path="/materials" element={<PageTransition><RawMaterials /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/auth/select-role" element={<PageTransition><AuthRoleSelect /></PageTransition>} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <PageTransition><Profile /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <PageTransition><Orders /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <PageTransition><Wishlist /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <PageTransition><Checkout /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/professional/auth" element={<PageTransition><ProfessionalAuth /></PageTransition>} />
        <Route path="/professional/dashboard" element={<PageTransition><ProfessionalDashboard /></PageTransition>} />
        <Route path="/professional/setup" element={<PageTransition><ProfessionalSetup /></PageTransition>} />
        <Route path="/designer/auth" element={<PageTransition><DesignerAuth /></PageTransition>} />
        <Route path="/designer/dashboard" element={<PageTransition><DesignerDashboard /></PageTransition>} />
        <Route path="/designer/setup" element={<PageTransition><DesignerSetup /></PageTransition>} />
        <Route path="/supplier/auth" element={<PageTransition><SupplierAuth /></PageTransition>} />
        <Route path="/supplier/dashboard" element={<PageTransition><SupplierDashboard /></PageTransition>} />
        <Route path="/supplier/setup" element={<PageTransition><SupplierSetup /></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
        <Route path="/admin/professionals" element={<AdminRoute><AdminProfessionals /></AdminRoute>} />
        <Route path="/admin/designers" element={<AdminRoute><AdminDesigners /></AdminRoute>} />
        <Route path="/admin/suppliers" element={<AdminRoute><AdminSuppliers /></AdminRoute>} />
        <Route path="/admin/designs" element={<AdminRoute><AdminDesigns /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
        <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
        <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

import { ErrorBoundary } from "./components/shared/ErrorBoundary";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-8 h-8 animate-spin rounded-full border-4 border-[#735c00] border-t-transparent"></div></div>}>
                  <AnimatedRoutes />
                </React.Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
