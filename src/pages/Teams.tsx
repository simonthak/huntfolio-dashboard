import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
          teams (
            id,
            name,
            description,
            created_at,
            invite_code
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (teamError) throw teamError;
      return teamMember;
    }
  });

  // Fetch team members if user is in a team
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

      // First find the team with this invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();

      if (teamError || !team) {
        toast.error("Invalid invite code");
        return;
      }

      // Add user to team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      toast.success("Successfully joined team");
      window.location.reload(); // Refresh to update UI
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
      window.location.reload(); // Refresh to update UI
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
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Join a Team</h1>
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
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{teamData.teams.name}</h1>
            {teamData.teams.description && (
              <p className="text-gray-600 mt-1">{teamData.teams.description}</p>
            )}
          </div>
          <Button
            variant="destructive"
            onClick={handleLeaveTeam}
            className="flex items-center gap-2"
          >
            <UserMinus className="w-4 h-4" />
            Leave Team
          </Button>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </h2>
            {teamData.role === 'admin' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#13B67F] hover:bg-[#0ea16f]">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>
                    {member.profiles.firstname} {member.profiles.lastname}
                  </TableCell>
                  <TableCell>{member.profiles.email}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Teams;