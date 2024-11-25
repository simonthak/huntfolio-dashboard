import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import NoTeam from "./pages/NoTeam";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/no-team" element={<NoTeam />} />
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;