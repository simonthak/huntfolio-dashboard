import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import TeamInformation from "@/components/teams/TeamInformation";
import TeamMembers from "@/components/teams/TeamMembers";
import CreateTeamDialog from "@/components/teams/CreateTeamDialog";

const Teams = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Fetch current user's team
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (*)
        `)
        .eq('user_id', user.id)
        .single();

      if (teamError) throw teamError;
      return teamMember;
    }
  });

  const { data: teamMembers, isLoading: isMembersLoading } = useQuery({
    queryKey: ['team-members', teamData?.team_id],
    enabled: !!teamData?.team_id,
    queryFn: async () => {
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

      if (error) throw error;
      return data;
    }
  });

  const handleJoinTeam = async () => {
    try {
      setIsJoining(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to join a team");
        return;
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();

      if (teamError || !team) {
        toast.error("Invalid invite code");
        return;
      }

      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      toast.success("Successfully joined team");
      window.location.reload();
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Successfully left team");
      window.location.reload();
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team");
    }
  };

  if (isTeamLoading || isMembersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teams</h1>
          <CreateTeamDialog />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Join a Team</h2>
          <p className="text-gray-600 mb-4">
            You're not currently part of any team. Enter an invite code to join one:
          </p>
          <div className="flex gap-4">
            <Input
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <Button 
              onClick={handleJoinTeam}
              disabled={isJoining || !inviteCode.trim()}
              className="bg-[#13B67F] hover:bg-[#0ea16f]"
            >
              {isJoining ? "Joining..." : "Join Team"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <Button
          variant="destructive"
          onClick={handleLeaveTeam}
          className="flex items-center gap-2"
        >
          <UserMinus className="w-4 h-4" />
          Leave Team
        </Button>
      </div>

      <TeamInformation team={teamData.teams} />

      {teamMembers && <TeamMembers members={teamMembers} />}

      {teamData.role === 'admin' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#13B67F] hover:bg-[#0ea16f]">
              Invite Members
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Code</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                Share this invite code with people you want to join your team:
              </p>
              <code className="bg-gray-100 p-2 rounded block text-center">
                {teamData.teams.invite_code}
              </code>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Teams;
