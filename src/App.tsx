import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Dashboard Layout and Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/Dashboard";
import EntitiesList from "./pages/EntitiesList";
import AddEntity from "./pages/AddEntity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Index />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="entities" element={<EntitiesList />} />
            <Route path="entities/new" element={<AddEntity />} />
            {/* Placeholder routes - will be implemented */}
            <Route path="entities/:id" element={<DashboardHome />} />
            <Route path="ip-analysis" element={<DashboardHome />} />
            <Route path="tech-map" element={<DashboardHome />} />
            <Route path="gap-analysis" element={<DashboardHome />} />
            <Route path="personnel" element={<DashboardHome />} />
            <Route path="settings" element={<DashboardHome />} />
            <Route path="help" element={<DashboardHome />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
