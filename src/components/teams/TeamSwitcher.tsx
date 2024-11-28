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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { switchTeam } = useTeamSwitch();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return user;
    },
  });

  const { data: teamMemberships, isLoading: isTeamMembershipsLoading } = useQuery({
    queryKey: ['team-memberships', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      console.log("Fetching team memberships...");
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          teams (
            id,
            name
          )
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error("Error fetching team memberships:", error);
        throw error;
      }

      console.log("Team memberships fetched:", data);
      return data || null;
    },
  });

  const { data: activeTeam, isLoading: isActiveTeamLoading } = useQuery({
    queryKey: ['active-team', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      console.log("Fetching active team...");
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_team_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.active_team_id) {
        console.log("No active team set");
        return null;
      }

      const { data: team, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', profile.active_team_id)
        .single();

      if (error) {
        console.error("Error fetching team:", error);
        throw error;
      }

      console.log("Active team fetched:", team);
      return team;
    },
  });

  const handleTeamSelect = async (teamId: string) => {
    try {
      const success = await switchTeam(teamId);
      if (success) {
        toast.success("Team switched successfully");
        setOpen(false);
      } else {
        toast.error("Failed to switch team");
      }
    } catch (error) {
      console.error("Error switching team:", error);
      toast.error("An error occurred while switching teams");
    }
  };

  if (isTeamMembershipsLoading || isActiveTeamLoading) {
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
            <span>{activeTeam?.name || "Select a team"}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start" side="bottom">
          <Command>
            <TeamList
              teams={teamMemberships}
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