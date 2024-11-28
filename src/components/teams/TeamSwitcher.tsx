import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import JoinTeamDialog from "./JoinTeamDialog";
import TeamList from "./TeamList";

type Team = {
  id: string;
  name: string;
};

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');
      return session;
    },
  });

  // Fetch user's teams
  const { data: teams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ['teams', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log('Fetching teams for user:', session?.user?.id);
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .innerJoin('team_members', 'teams.id = team_members.team_id')
        .eq('team_members.user_id', session?.user?.id);

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Teams data received:', data);
      
      // Transform the data to match the expected type
      const transformedTeams = data?.map(({ teams: team }) => ({
        id: team.id,
        name: team.name
      })) as Team[] || [];

      console.log('Transformed teams:', transformedTeams);
      return transformedTeams;
    },
  });

  // Fetch active team
  const { data: activeTeam, isLoading: isActiveTeamLoading } = useQuery({
    queryKey: ['active-team', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log('Fetching active team for user:', session?.user?.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('active_team_id')
        .eq('id', session?.user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profile?.active_team_id) {
        console.log('No active team found');
        return null;
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', profile.active_team_id)
        .single();

      if (teamError) {
        console.error('Error fetching team:', teamError);
        throw teamError;
      }

      console.log('Active team found:', team);
      return team;
    },
  });

  const handleTeamSelect = async (teamId: string) => {
    try {
      console.log('Switching to team:', teamId);
      const { error } = await supabase
        .from('profiles')
        .update({ active_team_id: teamId })
        .eq('id', session?.user?.id);

      if (error) {
        console.error('Error switching team:', error);
        toast.error('Failed to switch team');
        return;
      }

      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['active-team'] }),
        queryClient.invalidateQueries({ queryKey: ['teams'] }),
      ]);

      toast.success('Team switched successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error in handleTeamSelect:', error);
      toast.error('An error occurred while switching teams');
    }
  };

  if (isTeamsLoading || isActiveTeamLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {activeTeam?.name || "Select a team"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <TeamList
              teams={teams || []}
              activeTeamId={activeTeam?.id}
              onTeamSelect={handleTeamSelect}
              onJoinTeam={() => {
                setOpen(false);
                setShowJoinDialog(true);
              }}
            />
          </Command>
        </PopoverContent>
      </Popover>
      <JoinTeamDialog 
        open={showJoinDialog} 
        onOpenChange={setShowJoinDialog} 
      />
    </>
  );
}