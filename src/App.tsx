import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TripDetails from "./pages/TripDetails";
import Vouchers from "./pages/Vouchers";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";
import Regulamin from "./pages/Regulamin";
import PolitykaPrywatnosci from "./pages/PolitykaPrywatnosci";
import Dashboard from "./pages/admin/Dashboard";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminTripNew from "./pages/admin/AdminTripNew";
import AdminTripEdit from "./pages/admin/AdminTripEdit";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminVouchers from "./pages/admin/AdminVouchers";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminReports from "./pages/admin/AdminReports";
import { AdminLayout } from "./layouts/AdminLayout";
import { CookieBanner } from "./components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <CookieBanner />
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/regulamin" element={<Regulamin />} />
            <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosci />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/trips" element={<AdminLayout><AdminTrips /></AdminLayout>} />
          <Route path="/admin/trips/new" element={<AdminLayout><AdminTripNew /></AdminLayout>} />
          <Route path="/admin/trips/edit/:id" element={<AdminLayout><AdminTripEdit /></AdminLayout>} />
          <Route path="/admin/gallery" element={<AdminLayout><AdminGallery /></AdminLayout>} />
          <Route path="/admin/reservations" element={<AdminLayout><AdminReservations /></AdminLayout>} />
          <Route path="/admin/vouchers" element={<AdminLayout><AdminVouchers /></AdminLayout>} />
          <Route path="/admin/messages" element={<AdminLayout><AdminMessages /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
