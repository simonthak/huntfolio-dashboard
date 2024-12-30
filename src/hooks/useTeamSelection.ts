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
          return [];
        }

        if (!user) {
          console.log("No authenticated user found");
          return [];
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
          return [];
        }

        console.log("Successfully fetched teams:", teamMemberships);
        return teamMemberships;
      } catch (error) {
        console.error("Error in team fetch:", error);
        return [];
      }
    },
    enabled: !isTeamOptionalRoute, // Only fetch teams if we're not on a team-optional route
  });

  const shouldAutoSelectTeam = teams.length > 0 && !currentTeamId && !isTeamOptionalRoute;
  
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