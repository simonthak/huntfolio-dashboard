import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnimalTypes = () => {
  return useQuery({
    queryKey: ["animal-types"],
    queryFn: async () => {
      console.log("Fetching animal types...");
      const { data: types, error: typesError } = await supabase
        .from("animal_types")
        .select("*")
        .order("name");

      if (typesError) {
        console.error("Error fetching animal types:", typesError);
        throw typesError;
      }

      const { data: subtypes, error: subtypesError } = await supabase
        .from("animal_subtypes")
        .select("*")
        .order("name");

      if (subtypesError) {
        console.error("Error fetching animal subtypes:", subtypesError);
        throw subtypesError;
      }

      const subtypesByType = subtypes.reduce((acc: Record<number, any[]>, subtype) => {
        if (subtype.animal_type_id) {
          acc[subtype.animal_type_id] = [
            ...(acc[subtype.animal_type_id] || []),
            subtype
          ];
        }
        return acc;
      }, {});

      console.log("Successfully fetched animal types and subtypes");
      return {
        types,
        subtypesByType
      };
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};