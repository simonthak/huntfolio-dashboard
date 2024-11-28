import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Plus } from "lucide-react";

interface TeamListProps {
  teams: Array<{ teams: { id: string; name: string } }>;
  activeTeamId?: string;
  onTeamSelect: (teamId: string) => void;
  onJoinTeam: () => void;
}

const TeamList = ({ teams, activeTeamId, onTeamSelect, onJoinTeam }: TeamListProps) => {
  return (
    <>
      <CommandEmpty>No team found.</CommandEmpty>
      <CommandGroup heading="Your teams">
        {teams.map((membership) => (
          <CommandItem
            key={membership.teams.id}
            onSelect={() => onTeamSelect(membership.teams.id)}
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
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup>
        <CommandItem onSelect={onJoinTeam}>
          <Plus className="mr-2 h-4 w-4" />
          Join Another Team
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default TeamList;