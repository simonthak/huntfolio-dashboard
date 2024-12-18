import { Link, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  UserCircle,
  FolderOpen,
  Phone,
  Map,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Kalender", path: "/calendar" },
  { icon: FileText, label: "Rapporter", path: "/reports" },
  { icon: FolderOpen, label: "Dokument", path: "/documents" },
  { icon: Phone, label: "Kontakter", path: "/contacts" },
  { icon: Users, label: "Jaktlag", path: "/team" },
  { icon: Map, label: "Karta", path: "/map" },
  { icon: UserCircle, label: "Profil", path: "/profile" },
  { icon: Settings, label: "Inställningar", path: "/settings" },
];

const NavigationMenu = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTeam = searchParams.get('team');

  return (
    <>
      {menuItems.map((item) => {
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