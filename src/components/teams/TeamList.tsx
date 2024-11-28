import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface TeamListProps {
  teams: Array<{ teams: { id: string; name: string } }> | undefined;
  activeTeamId?: string;
  onTeamSelect: (teamId: string) => void;
  onJoinTeam: () => void;
}

const TeamList = ({ teams = [], activeTeamId, onTeamSelect, onJoinTeam }: TeamListProps) => {
  const validTeams = (teams || []).filter(
    (membership): membership is { teams: { id: string; name: string } } => 
      membership?.teams?.id !== undefined && 
      membership?.teams?.name !== undefined
  );

  return (
    <>
      {validTeams.length === 0 ? (
        <CommandEmpty>No teams found.</CommandEmpty>
      ) : (
        <CommandGroup heading="Your teams">
          {validTeams.map((membership) => (
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
          ))}
        </CommandGroup>
      )}
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