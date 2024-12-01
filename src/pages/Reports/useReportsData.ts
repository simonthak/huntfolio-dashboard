import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/components/reports/types";
import { toast } from "sonner";

export const useReportsData = (currentTeamId: string | null) => {
  return useQuery({
    queryKey: ["hunting-reports", currentTeamId],
    queryFn: async () => {
      console.log("Fetching hunting reports for team:", currentTeamId);
      
      if (!currentTeamId) {
        console.log("No team selected");
        return [];
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error");
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }

      // First verify the user is a member of this team
      const { data: teamMembership, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('team_id', currentTeamId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (teamError) {
        console.error("Error checking team membership:", teamError);
        throw new Error("Failed to verify team membership");
      }

      if (!teamMembership) {
        console.error("User is not a member of this team");
        return [];
      }

      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          id,
          date,
          participant_count,
          description,
          created_by,
          hunt_type:hunt_types(id, name),
          created_by_profile:profiles!hunting_reports_created_by_fkey(
            firstname,
            lastname
          ),
          report_animals(
            quantity,
            animal_type:animal_types(name),
            animal_subtype:animal_subtypes(name)
          )
        `)
        .eq('team_id', currentTeamId)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching hunting reports:", error);
        throw error;
      }

      console.log("Successfully fetched reports for team:", currentTeamId, data);
      return data as Report[];
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error in reports query:", error);
        toast.error("Failed to load reports");
      }
    },
    enabled: !!currentTeamId
  });
};