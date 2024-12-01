import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeamData = (teamId: string | null) => {
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Fetching team data for team:", teamId);

      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (*)
        `)
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (teamError) {
        console.error("Error fetching team:", teamError);
        throw teamError;
      }

      console.log("Team data fetched:", teamMember);
      return teamMember;
    }
  });

  const { data: teamMembers, isLoading: isMembersLoading } = useQuery({
    queryKey: ['team-members', teamId],
    enabled: !!teamId,
    queryFn: async () => {
      console.log("Fetching team members for team:", teamId);

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            firstname,
            lastname,
            email,
            phone_number
          )
        `)
        .eq('team_id', teamId);

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }

      console.log("Team members fetched:", data);
      return data;
    }
  });

  return {
    teamData,
    teamMembers,
    isLoading: isTeamLoading || isMembersLoading
  };
};