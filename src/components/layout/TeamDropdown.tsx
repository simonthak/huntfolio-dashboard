import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateTeamDialog from "../teams/CreateTeamDialog";
import JoinTeamDialog from "../teams/JoinTeamDialog";

const TeamDropdown = () => {
  const navigate = useNavigate();
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);

  const { data: teams = [] } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      console.log("Fetching user teams...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          role,
          teams (
            id,
            name,
            location
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }

      console.log("Teams fetched:", data);
      return data.map(tm => ({
        ...tm.teams,
        role: tm.role
      }));
    }
  });

  const handleTeamClick = (teamId: string) => {
    console.log("Navigating to team:", teamId);
    navigate(`/teams?id=${teamId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between mb-2 font-medium"
        >
          My Teams
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="right">
        {teams?.map((team) => (
          <DropdownMenuItem 
            key={team.id}
            onClick={() => handleTeamClick(team.id)}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="flex-1">{team.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {team.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem>
          <CreateTeamDialog />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowJoinTeamDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Join Team
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <JoinTeamDialog 
        open={showJoinTeamDialog} 
        onOpenChange={setShowJoinTeamDialog}
      />
    </DropdownMenu>
  );
};

export default TeamDropdown;