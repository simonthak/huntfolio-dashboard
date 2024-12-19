import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import NavigationMenu from "./NavigationMenu";
import TeamDropdown from "./TeamDropdown";
import LogoHeader from "./LogoHeader";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First try to refresh the session to ensure we have a valid token
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Session refresh error:", refreshError);
        // If refresh fails, we can assume the user is already logged out
        navigate("/login");
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if there's an error, redirect to login for safety
      navigate("/login");
      toast.error("Ett fel uppstod vid utloggning");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-screen">
      <LogoHeader />
      
      <TeamDropdown />
      
      <nav className="flex-1 mt-6">
        <NavigationMenu />
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <LogOut className="w-5 h-5" />
        <span>Logga ut</span>
      </button>
    </aside>
  );
};

export default Sidebar;