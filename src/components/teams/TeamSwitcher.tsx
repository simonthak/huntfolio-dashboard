import { useQuery } from "@tanstack/react-query";
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
import { useNavigate } from "react-router-dom";

type Team = {
  id: string;
  name: string;
};

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const navigate = useNavigate();

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
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name
          )
        `)
        .eq('user_id', session?.user?.id);

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Teams data received:', data);
      
      // Transform the data to match the expected type and handle null/undefined cases
      const transformedTeams = data?.filter(item => item.teams)
        .map(({ teams }) => ({
          id: teams.id,
          name: teams.name
        })) || [];

      console.log('Transformed teams:', transformedTeams);
      return transformedTeams;
    },
  });

  // Get the first team as default
  const defaultTeam = teams?.[0];

  if (isTeamsLoading) {
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
            {defaultTeam?.name || "Select a team"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <TeamList
              teams={teams || []}
              activeTeamId={defaultTeam?.id}
              onTeamSelect={(teamId) => {
                const selectedTeam = teams?.find(team => team.id === teamId);
                if (selectedTeam) {
                  setOpen(false);
                  // Refresh the page to update all team-specific data
                  navigate(0);
                }
              }}
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