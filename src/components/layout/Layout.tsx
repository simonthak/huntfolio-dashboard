import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";
import NoTeamSelected from "./NoTeamSelected";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuthCheck();
  const { 
    teams, 
    currentTeamId, 
    isTeamOptionalRoute, 
    shouldAutoSelectTeam 
  } = useTeamSelection();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Auto-select first team if needed
  if (shouldAutoSelectTeam) {
    console.log("Layout: No team selected, auto-selecting first team:", teams[0].id);
    return <LoadingSpinner />;
  }

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