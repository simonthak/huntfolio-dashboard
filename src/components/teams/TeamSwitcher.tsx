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

  const { data: teamMemberships, isLoading: isTeamMembershipsLoading, error: teamMembershipsError } = useQuery({
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
      return data;
    },
  });

  const { data: activeTeamData, isLoading: isActiveTeamLoading, error: activeTeamError } = useQuery({
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
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const handleTeamSelect = async (teamId: string) => {
    try {
      console.log("Attempting to switch to team:", teamId);
      const success = await switchTeam(teamId);
      if (success) {
        console.log("Team switch successful");
        toast.success("Team switched successfully");
        setOpen(false);
      } else {
        console.error("Team switch failed");
        toast.error("Failed to switch team");
      }
    } catch (error) {
      console.error("Error switching team:", error);
      toast.error("An error occurred while switching teams");
    }
  };

  const handleDropdownOpen = (isOpen: boolean) => {
    try {
      setOpen(isOpen);
      if (isOpen) {
        toast.info("Select a team to switch to");
      }
    } catch (error) {
      console.error("Error handling dropdown:", error);
      toast.error("An error occurred while opening the team selector");
    }
  };

  const isLoading = isTeamMembershipsLoading || isActiveTeamLoading;

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (teamMembershipsError || activeTeamError) {
    toast.error("Failed to load teams");
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span>Error loading teams</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleDropdownOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span>{activeTeamData?.name || "No team selected"}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start" side="bottom">
          <Command className="w-full">
            <TeamList
              teams={teamMemberships}
              activeTeamId={activeTeamData?.id}
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