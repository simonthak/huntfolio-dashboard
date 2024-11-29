import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TeamInformation from "@/components/teams/TeamInformation";
import TeamMembers from "@/components/teams/TeamMembers";
import TeamActions from "@/components/teams/TeamActions";
import { Loader2 } from "lucide-react";
import TeamList from "@/components/teams/TeamList";

const Teams = () => {
  // Fetch user's teams
  const { data: teams, isLoading } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      console.log("Fetching user teams...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          role,
          teams (*)
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
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Teams</h1>
      <TeamList />
    </div>
  );
};

export default Teams;