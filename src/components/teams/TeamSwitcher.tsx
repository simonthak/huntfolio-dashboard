import { useQuery, useQueryClient } from "@tanstack/react-query";
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

type TeamMembership = {
  teams: {
    id: string;
    name: string;
  };
  role: string;
};

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: teamMemberships, isLoading, error } = useQuery<TeamMembership[]>({
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
      return (data as TeamMembership[]) || [];
    },
    initialData: [] // Provide initial data to prevent undefined
  });

  const { data: activeTeamData } = useQuery({
    queryKey: ['active-team'],
    queryFn: async () => {
      console.log("Fetching active team...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('active_team_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profile?.active_team_id) {
        console.log("No active team set");
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
      
      await queryClient.invalidateQueries({ queryKey: ['active-team'] });
      await queryClient.invalidateQueries({ queryKey: ['team-memberships'] });
      
      toast.success("Team switched successfully");
      
      window.location.reload();
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

  if (error) {
    return (
      <Button variant="outline" className="w-full justify-between text-red-500">
        <span>Error loading teams</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  // Ensure we have a valid array to work with
  const validTeamMemberships = (teamMemberships || []).filter(
    (membership): membership is TeamMembership => 
      membership?.teams?.id !== undefined && 
      membership?.teams?.name !== undefined
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span>{activeTeamData?.name || "Select team..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandEmpty>No team found.</CommandEmpty>
          <CommandGroup>
            {validTeamMemberships.map((membership) => (
              <CommandItem
                key={membership.teams.id}
                onSelect={() => handleTeamSelect(membership.teams.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    activeTeamData?.id === membership.teams.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {membership.teams.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}