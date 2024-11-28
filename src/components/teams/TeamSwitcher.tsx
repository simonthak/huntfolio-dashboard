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
import JoinTeamDialog from "./JoinTeamDialog";
import TeamList from "./TeamList";
import { useTeamSwitch } from "@/hooks/useTeamSwitch";

type TeamMembership = {
  teams: {
    id: string;
    name: string;
  };
  role: string;
};

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { switchTeam } = useTeamSwitch();

  const { data: teamMemberships = [], isLoading: isTeamMembershipsLoading } = useQuery<TeamMembership[]>({
    queryKey: ['team-memberships'],
    queryFn: async () => {
      console.log("Fetching team memberships...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          teams (
            id,
            name
          ),
          role
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching team memberships:", error);
        throw error;
      }

      console.log("Team memberships fetched:", data);
      return data || [];
    },
  });

  const { data: activeTeamData, isLoading: isActiveTeamLoading } = useQuery({
    queryKey: ['active-team'],
    queryFn: async () => {
      console.log("Fetching active team...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('active_team_id')
        .eq('id', user.id)
        .single();

      console.log("Profile data:", profile);

      if (!profile?.active_team_id) {
        console.log("No active team set in profile");
        return null;
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', profile.active_team_id)
        .single();

      if (teamError) {
        console.error("Error fetching team:", teamError);
        throw teamError;
      }

      console.log("Active team fetched:", team);
      return team;
    }
  });

  const handleTeamSelect = async (teamId: string) => {
    console.log("Attempting to switch to team:", teamId);
    const success = await switchTeam(teamId);
    if (success) {
      console.log("Team switch successful");
      setOpen(false);
    } else {
      console.error("Team switch failed");
    }
  };

  const isLoading = isTeamMembershipsLoading || isActiveTeamLoading;

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between">
        <span>Loading teams...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  const validTeamMemberships = (teamMemberships || []).filter(
    (membership): membership is TeamMembership => 
      membership?.teams?.id !== undefined && 
      membership?.teams?.name !== undefined
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => validTeamMemberships.length === 0 && setShowJoinDialog(true)}
          >
            <span>{activeTeamData?.name || "Join a team..."}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {validTeamMemberships.length > 0 && (
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <TeamList
                teams={validTeamMemberships}
                activeTeamId={activeTeamData?.id}
                onTeamSelect={handleTeamSelect}
                onJoinTeam={() => {
                  setOpen(false);
                  setShowJoinDialog(true);
                }}
              />
            </Command>
          </PopoverContent>
        )}
      </Popover>
      {showJoinDialog && (
        <JoinTeamDialog open={showJoinDialog} onOpenChange={setShowJoinDialog} />
      )}
    </>
  );
}