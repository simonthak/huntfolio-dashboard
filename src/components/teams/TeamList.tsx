import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface TeamListProps {
  teams: Array<{ teams: { id: string; name: string } }> | null;
  activeTeamId?: string;
  onTeamSelect: (teamId: string) => void;
  onJoinTeam: () => void;
}

const TeamList = ({ teams, activeTeamId, onTeamSelect, onJoinTeam }: TeamListProps) => {
  if (!teams || teams.length === 0) {
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
        {teams.map((membership) => (
          membership?.teams?.id && membership?.teams?.name && (
            <CommandItem
              key={membership.teams.id}
              onSelect={() => onTeamSelect(membership.teams.id)}
              className="cursor-pointer hover:bg-accent"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  activeTeamId === membership.teams.id
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
              {membership.teams.name}
            </CommandItem>
          )
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