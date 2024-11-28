import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

type Team = {
  teams: {
    id: string;
    name: string;
  };
};

interface TeamListProps {
  teams: Team[] | null;
  activeTeamId?: string;
  onTeamSelect: (teamId: string) => void;
  onJoinTeam: () => void;
}

const TeamList = ({ teams, activeTeamId, onTeamSelect, onJoinTeam }: TeamListProps) => {
  const validTeams = teams?.filter(team => team?.teams?.id && team?.teams?.name) || [];

  const renderJoinTeamButton = () => (
    <CommandGroup>
      <CommandItem 
        onSelect={onJoinTeam}
        className="cursor-pointer hover:bg-accent"
      >
        <Plus className="mr-2 h-4 w-4" />
        Join Another Team
      </CommandItem>
    </CommandGroup>
  );

  if (validTeams.length === 0) {
    return (
      <>
        <CommandEmpty>No teams found.</CommandEmpty>
        <CommandSeparator />
        {renderJoinTeamButton()}
      </>
    );
  }

  return (
    <>
      <CommandGroup heading="Your teams">
        {validTeams.map((team) => (
          <CommandItem
            key={team.teams.id}
            onSelect={() => onTeamSelect(team.teams.id)}
            className="cursor-pointer hover:bg-accent"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                activeTeamId === team.teams.id ? "opacity-100" : "opacity-0"
              )}
            />
            {team.teams.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      {renderJoinTeamButton()}
    </>
  );
};

export default TeamList;