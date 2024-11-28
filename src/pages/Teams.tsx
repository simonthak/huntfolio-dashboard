import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TeamInformation from "@/components/teams/TeamInformation";
import TeamMembers from "@/components/teams/TeamMembers";
import TeamActions from "@/components/teams/TeamActions";
import { Loader2 } from "lucide-react";

const Teams = () => {
  // Fetch current user's team
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Fetching team data for user:", user.id);

      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            description,
            location,
            areal,
            created_at,
            created_by
          )
        `)
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

  // Fetch team members
  const { data: teamMembers, isLoading: isMembersLoading } = useQuery({
    queryKey: ['team-members', teamData?.team_id],
    enabled: !!teamData?.team_id,
    queryFn: async () => {
      console.log("Fetching team members for team:", teamData?.team_id);

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            firstname,
            lastname,
            email
          )
        `)
        .eq('team_id', teamData.team_id);

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }

      console.log("Team members fetched:", data);
      return data;
    }
  });

  if (isTeamLoading || isMembersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Team Management</h1>
      
      {teamData?.teams && (
        <>
          <TeamInformation team={teamData.teams} />
          {teamMembers && <TeamMembers members={teamMembers} />}
          <TeamActions 
            teamId={teamData.team_id} 
            userRole={teamData.role} 
            inviteCode={teamData.teams.invite_code} 
          />
        </>
      )}
    </div>
  );
};

export default Teams;