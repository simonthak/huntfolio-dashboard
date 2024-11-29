import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import TeamList from "./TeamList";
import JoinTeamDialog from "./JoinTeamDialog";
import CreateTeamDialog from "./CreateTeamDialog";

export function TeamSwitcher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Load active team from localStorage on component mount
  useEffect(() => {
    const storedTeamId = localStorage.getItem('activeTeamId');
    if (storedTeamId) {
      setActiveTeamId(storedTeamId);
    }
  }, []);

  const { data: teamData, isLoading } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      console.log("Fetching user teams...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: teams, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }

      console.log("Teams fetched:", teams);
      
      const formattedTeams = teams
        .map(tm => ({
          id: tm.teams?.id,
          name: tm.teams?.name,
        }))
        .filter(team => team.id && team.name);

      // If no active team is set, set the first team as active
      if (!activeTeamId && formattedTeams.length > 0) {
        const firstTeamId = formattedTeams[0].id;
        setActiveTeamId(firstTeamId);
        localStorage.setItem('activeTeamId', firstTeamId);
      }

      return formattedTeams;
    }
  });

  const handleTeamSelect = async (teamId: string) => {
    console.log("Switching to team:", teamId);
    setActiveTeamId(teamId);
    localStorage.setItem('activeTeamId', teamId);
    setOpen(false);
    // Refresh the page to update team context
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between">
        <Skeleton className="h-5 w-[100px]" />
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className="w-full justify-between"
          >
            <Users className="mr-2 h-4 w-4" />
            <span className="truncate">
              {activeTeamId
                ? teamData?.find((team) => team.id === activeTeamId)?.name
                : "Select team"}
            </span>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <TeamList
              teams={teamData || []}
              activeTeamId={activeTeamId}
              onTeamSelect={handleTeamSelect}
              onJoinTeam={() => {
                setOpen(false);
                setShowJoinDialog(true);
              }}
            />
            <div className="p-2 border-t">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setShowCreateDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Team
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <JoinTeamDialog 
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
      />
    </>
  );
}