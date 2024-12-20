import { useSearchParams } from "react-router-dom";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading } = useAuthCheck();

  const { data: teams = [] } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      try {
        console.log("Layout: Starting to fetch user teams...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          throw new Error("Authentication error");
        }

        if (!user) {
          console.log("No authenticated user found");
          throw new Error("Not authenticated");
        }

        console.log("Fetching team memberships for user:", user.id);
        const { data: teamMemberships, error: membershipError } = await supabase
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

        if (membershipError) {
          console.error("Error fetching team memberships:", membershipError);
          throw membershipError;
        }

        console.log("Successfully fetched teams:", teamMemberships);
        return teamMemberships.map(tm => ({
          ...tm.teams,
          role: tm.role
        }));
      } catch (error) {
        console.error("Error in team fetch:", error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const currentTeamId = searchParams.get('team');
  const isTeamOptionalRoute = TEAM_OPTIONAL_ROUTES.includes(location.pathname);

  // Auto-select first team if no team is selected and we're not on a team-optional route
  if (teams?.length > 0 && !currentTeamId && !isTeamOptionalRoute) {
    console.log("Layout: No team selected, auto-selecting first team:", teams[0].id);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('team', teams[0].id);
    setSearchParams(newSearchParams);
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