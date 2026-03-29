import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import Students from "./pages/Students";
import Batches from "./pages/Batches";
import BatchDetail from "./pages/BatchDetail";
import GradeDetail from "./pages/GradeDetail";
import Subjects from "./pages/Subjects";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="students" element={<Students />} />
              <Route path="batches" element={<Batches />} />
              <Route path="batches/:batchId" element={<BatchDetail />} />
              <Route path="batches/:batchId/grades/:gradeId" element={<GradeDetail />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="marks" element={<Marks />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
