import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TeamList = () => {
  const { data: teams = [], isLoading } = useQuery({
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
            location,
            description
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

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading teams...</div>;
  }

  if (!teams?.length) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground">You are not a member of any teams yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div 
          key={team.id} 
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <h3 className="font-medium">{team.name}</h3>
          {team.location && (
            <p className="text-sm text-muted-foreground mt-1">📍 {team.location}</p>
          )}
          {team.description && (
            <p className="text-sm text-muted-foreground mt-2">{team.description}</p>
          )}
          <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            {team.role}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamList;