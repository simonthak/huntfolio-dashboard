import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/components/reports/types";

export const useReports = () => {
  return useQuery({
    queryKey: ["hunting-reports"],
    queryFn: async () => {
      console.log("Fetching hunting reports...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error");
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }

      console.log("Checking team membership for user:", user.id);
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (teamError) {
        console.error("Error fetching team membership:", teamError);
        throw new Error("Failed to fetch team membership");
      }

      if (!teamMember) {
        console.log("No team membership found for user:", user.id);
        return [];
      }

      console.log("Found team membership:", JSON.stringify(teamMember, null, 2));
      
      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          *,
          hunt_type:hunt_types(name),
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
        .eq('team_id', teamMember.team_id)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching hunting reports:", error);
        throw error;
      }

      console.log("Successfully fetched reports:", data);
      return data as Report[];
    },
  });
};