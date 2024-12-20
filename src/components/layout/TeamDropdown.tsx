import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateTeamDialog from "../teams/CreateTeamDialog";
import JoinTeamDialog from "../teams/JoinTeamDialog";
import { useTeamSelection } from "@/hooks/useTeamSelection";

const TeamDropdown = () => {
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const { teams, currentTeamId, selectTeam } = useTeamSelection();

  const currentTeam = teams.find(team => team.id === currentTeamId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between mb-2 font-medium bg-white hover:bg-gray-50"
          size="lg"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#13B67F]" />
            <span>{currentTeam?.name || "Välj lag"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="right">
        {teams?.map((team) => (
          <DropdownMenuItem 
            key={team.id}
            onClick={() => selectTeam(team.id)}
            className={currentTeamId === team.id ? "bg-primary/10" : ""}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="flex-1">{team.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {team.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-2">
          <CreateTeamDialog />
        </div>
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault();
          setShowJoinTeamDialog(true);
        }}>
          <div className="flex items-center gap-2 w-full">
            <Plus className="w-4 h-4" />
            <span>Gå med i lag</span>
          </div>
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