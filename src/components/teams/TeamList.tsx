import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

type TeamListProps = {
  teams: Array<{
    id: string;
    name: string;
  }>;
  activeTeamId?: string | null;
  onTeamSelect: (teamId: string) => void;
  onJoinTeam: () => void;
};

const TeamList = ({ teams, activeTeamId, onTeamSelect, onJoinTeam }: TeamListProps) => {
  if (!teams?.length) {
    return (
      <>
        <CommandEmpty>No teams found.</CommandEmpty>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem 
            onSelect={onJoinTeam}
            className="cursor-pointer hover:bg-accent"
          >
            <Plus className="mr-2 h-4 w-4" />
            Join Another Team
          </CommandItem>
        </CommandGroup>
      </>
    );
  }

  return (
    <>
      <CommandGroup heading="Your teams">
        {teams.map((team) => (
          <CommandItem
            key={team.id}
            onSelect={() => onTeamSelect(team.id)}
            className="cursor-pointer hover:bg-accent"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                activeTeamId === team.id ? "opacity-100" : "opacity-0"
              )}
            />
            {team.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup>
        <CommandItem 
          onSelect={onJoinTeam}
          className="cursor-pointer hover:bg-accent"
        >
          <Plus className="mr-2 h-4 w-4" />
          Join Another Team
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default TeamList;