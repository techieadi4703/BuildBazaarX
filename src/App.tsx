import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/shared/PageTransition";
import Index from "./pages/Index";
import DesignsCatalog from "./pages/DesignsCatalog";
import DesignDetail from "./pages/DesignDetail";
import RawMaterials from "./pages/RawMaterials";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AuthRoleSelect from "./pages/AuthRoleSelect";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import ProfessionalAuth from "./pages/ProfessionalAuth";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ProfessionalSetup from "./pages/ProfessionalSetup";
import DesignerAuth from "./pages/DesignerAuth";
import DesignerDashboard from "./pages/DesignerDashboard";
import DesignerSetup from "./pages/DesignerSetup";
import SupplierAuth from "./pages/SupplierAuth";
import SupplierDashboard from "./pages/SupplierDashboard";
import SupplierSetup from "./pages/SupplierSetup";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
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
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
