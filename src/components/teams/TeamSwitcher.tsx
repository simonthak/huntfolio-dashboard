import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);

  const { data: teamMemberships, isLoading } = useQuery({
    queryKey: ['team-memberships'],
    queryFn: async () => {
      console.log("Fetching team memberships...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
    }
  });

  const { data: activeTeam } = useQuery({
    queryKey: ['active-team'],
    queryFn: async () => {
      console.log("Fetching active team...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          active_team_id,
          teams (
            id,
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching active team:", error);
        throw error;
      }

      console.log("Active team fetched:", data);
      return data.teams;
    }
  });

  const handleTeamSelect = async (teamId: string) => {
    try {
      console.log("Switching to team:", teamId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ active_team_id: teamId })
        .eq('id', user.id);

      if (error) throw error;

      setOpen(false);
      toast.success("Team switched successfully");
      
      // Invalidate queries that depend on the active team
      // This will trigger a refetch of the data with the new team context
      // queryClient.invalidateQueries(['active-team']);
    } catch (error) {
      console.error("Error switching team:", error);
      toast.error("Failed to switch team");
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between">
        <span>Loading teams...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span>{activeTeam?.name || "Select team..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandEmpty>No team found.</CommandEmpty>
          <CommandGroup>
            {teamMemberships?.map((membership) => (
              <CommandItem
                key={membership.teams?.id}
                onSelect={() => handleTeamSelect(membership.teams?.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    activeTeam?.id === membership.teams?.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {membership.teams?.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}