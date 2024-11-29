import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateTeamDialog from "../teams/CreateTeamDialog";
import JoinTeamDialog from "../teams/JoinTeamDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Users, label: "Teams", path: "/teams" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);

  // Fetch user's teams
  const { data: teams = [] } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      console.log("Fetching user teams...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          role,
          teams (
            id,
            name,
            location
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }

      console.log("Teams fetched:", data);
      return data.map(tm => ({
        ...tm.teams,
        role: tm.role
      }));
    }
  });

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
        
        const response = await fetch(publicUrl.publicUrl);
        if (!response.ok) {
          console.error("Failed to load image:", response.status, response.statusText);
          return;
        }

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between mb-2 font-medium"
            >
              My Teams
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="right">
            {teams?.map((team) => (
              <DropdownMenuItem key={team.id}>
                <Link 
                  to="/teams" 
                  className="flex items-center gap-2 w-full"
                >
                  <span className="flex-1">{team.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {team.role}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem>
              <CreateTeamDialog />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setShowJoinTeamDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Team
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-gray-700 hover:bg-gray-100 transition-colors",
              location.pathname === item.path && "bg-primary/10 text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
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

      <JoinTeamDialog 
        open={showJoinTeamDialog} 
        onOpenChange={setShowJoinTeamDialog}
      />
    </div>
  );
};

export default Sidebar;