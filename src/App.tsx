import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DesignsCatalog from "./pages/DesignsCatalog";
import DesignDetail from "./pages/DesignDetail";
import RawMaterials from "./pages/RawMaterials";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/designs" element={<DesignsCatalog />} />
            <Route path="/designs/:id" element={<DesignDetail />} />
            <Route path="/materials" element={<RawMaterials />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/professional/auth" element={<ProfessionalAuth />} />
            <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
            <Route path="/professional/setup" element={<ProfessionalSetup />} />
            <Route path="/designer/auth" element={<DesignerAuth />} />
            <Route path="/designer/dashboard" element={<DesignerDashboard />} />
            <Route path="/designer/setup" element={<DesignerSetup />} />
            <Route path="/supplier/auth" element={<SupplierAuth />} />
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/setup" element={<SupplierSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
