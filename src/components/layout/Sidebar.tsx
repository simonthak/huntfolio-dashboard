import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import TeamDropdown from "./TeamDropdown";
import NavigationMenu from "./NavigationMenu";

const Sidebar = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        console.log("Fetching logo URL...");
        const { data: publicUrl } = supabase.storage
          .from('logos')
          .getPublicUrl('symbol.svg');
        
        if (!publicUrl?.publicUrl) {
          console.error("No public URL returned from Supabase");
          return;
        }

        console.log("Logo URL:", publicUrl.publicUrl);
        setLogoUrl(publicUrl.publicUrl);
      } catch (error) {
        console.error("Error fetching logo:", error);
        toast.error("Failed to load logo");
      }
    };

    fetchLogoUrl();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center gap-2">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Antlers Logo"
            className="w-6 h-6 object-contain"
            onError={(e) => {
              console.error("Error loading logo image");
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <h1 className="text-xl font-bold text-gray-900">ANTLERS</h1>
      </div>

      <nav className="flex-1 px-4">
        <TeamDropdown />
        <NavigationMenu />
      </nav>

      <div className="p-4 mt-auto border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;