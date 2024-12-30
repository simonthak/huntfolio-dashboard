import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";
import NoTeamSelected from "./NoTeamSelected";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading: isAuthLoading } = useAuthCheck();
  const { 
    teams, 
    currentTeamId, 
    isTeamOptionalRoute,
    shouldAutoSelectTeam,
    selectTeam,
    isLoading: isTeamLoading 
  } = useTeamSelection();

  // Show loading state while checking auth or fetching teams
  if (isAuthLoading || isTeamLoading) {
    console.log("Layout: Loading state - Auth loading:", isAuthLoading, "Team loading:", isTeamLoading);
    return <LoadingSpinner />;
  }

  // Auto-select first team if needed
  if (shouldAutoSelectTeam && teams.length > 0) {
    console.log("Layout: Auto-selecting first team:", teams[0].teams.id);
    selectTeam(teams[0].teams.id);
    return <LoadingSpinner />;
  }

  // Only show NoTeamSelected if we're not on a team-optional route and no team is selected
  if (!currentTeamId && !isTeamOptionalRoute) {
    console.log("Layout: No team selected and not on team-optional route");
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