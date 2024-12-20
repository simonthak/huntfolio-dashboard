import { useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TEAM_OPTIONAL_ROUTES = [
  '/profile', 
  '/settings', 
  '/no-team', 
  '/login',
  '/notifications'
];

export const useTeamSelection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentTeamId = searchParams.get('team');
  const isTeamOptionalRoute = TEAM_OPTIONAL_ROUTES.includes(location.pathname);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      try {
        console.log("useTeamSelection: Starting to fetch user teams...");
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

  const shouldAutoSelectTeam = teams?.length > 0 && !currentTeamId && !isTeamOptionalRoute;
  
  const selectTeam = (teamId: string) => {
    console.log("Selecting team:", teamId);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('team', teamId);
    setSearchParams(newSearchParams);
  };

  return {
    teams,
    currentTeamId,
    isTeamOptionalRoute,
    shouldAutoSelectTeam,
    selectTeam,
    isLoading
  };
};