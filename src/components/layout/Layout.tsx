import { useSearchParams } from "react-router-dom";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";
import NoTeamSelected from "./NoTeamSelected";

const TEAM_OPTIONAL_ROUTES = [
  '/profile', 
  '/settings', 
  '/no-team', 
  '/login',
  '/notifications'
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [searchParams] = useSearchParams();
  const { isLoading } = useAuthCheck();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const currentTeamId = searchParams.get('team');
  const isTeamOptionalRoute = TEAM_OPTIONAL_ROUTES.includes(location.pathname);

  // Only show NoTeamSelected if we're not on a team-optional route and no team is selected
  if (!currentTeamId && !isTeamOptionalRoute) {
    console.log("No team selected and not on team-optional route, showing NoTeamSelected");
    return <NoTeamSelected />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;