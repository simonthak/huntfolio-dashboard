import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHuntTypes = () => {
  return useQuery({
    queryKey: ["hunt-types"],
    queryFn: async () => {
      console.log("Fetching hunt types...");
      const { data, error } = await supabase
        .from("hunt_types")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching hunt types:", error);
        throw error;
      }

      console.log("Successfully fetched hunt types:", data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};