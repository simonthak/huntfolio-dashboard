import { useSearchParams } from "react-router-dom";
import TeamInformation from "@/components/teams/TeamInformation";
import TeamMembers from "@/components/teams/TeamMembers";
import TeamActions from "@/components/teams/TeamActions";
import TeamLoading from "@/components/teams/TeamLoading";
import NoTeamSelected from "@/components/teams/NoTeamSelected";
import { useTeamData } from "@/hooks/useTeamData";

const Teams = () => {
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  
  const { teamData, teamMembers, isLoading } = useTeamData(currentTeamId);

  if (!currentTeamId) {
    return <NoTeamSelected />;
  }

  if (isLoading) {
    return <TeamLoading />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Teamhantering</h1>
      
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

export default Teams;