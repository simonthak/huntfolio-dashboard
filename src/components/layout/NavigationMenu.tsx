import { Link, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  UserCircle,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const NavigationMenu = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTeam = searchParams.get('team');

  return (
    <>
      {menuItems.map((item) => {
        // Always include team parameter if it exists
        const to = currentTeam 
          ? `${item.path}?team=${currentTeam}`
          : item.path;

        return (
          <Link
            key={item.path}
            to={to}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-gray-700 hover:bg-gray-100 transition-colors",
              location.pathname === item.path && "bg-primary/10 text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
};

export default NavigationMenu;