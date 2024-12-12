import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TeamInformation from "@/components/teams/TeamInformation";
import TeamMembers from "@/components/teams/TeamMembers";
import TeamActions from "@/components/teams/TeamActions";
import { Loader2 } from "lucide-react";
import { NoTeamSelected } from "./Reports/NoTeamSelected";

const Team = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');

  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', currentTeamId],
    enabled: !!currentTeamId,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Fetching team data for team:", currentTeamId);

      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (*)
        `)
        .eq('team_id', currentTeamId)
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
    queryKey: ['team-members', currentTeamId],
    enabled: !!currentTeamId,
    queryFn: async () => {
      console.log("Fetching team members for team:", currentTeamId);

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
        .eq('team_id', currentTeamId);

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }

      console.log("Team members fetched:", data);
      return data;
    }
  });

  if (!currentTeamId) {
    return <NoTeamSelected />;
  }

  if (isTeamLoading || isMembersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mitt jaktlag</h1>
      
      {teamData?.teams && (
        <>
          <TeamInformation team={teamData.teams} />
          {teamMembers && <TeamMembers members={teamMembers} />}
          <TeamActions 
            teamId={teamData.team_id} 
            userRole={teamData.role} 
            inviteCode={teamData.teams.invite_code}
            teamName={teamData.teams.name}
          />
        </>
      )}
    </div>
  );
};

export default Team;