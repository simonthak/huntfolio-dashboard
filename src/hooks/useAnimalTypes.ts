import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnimalTypes = () => {
  return useQuery({
    queryKey: ["animal-types"],
    queryFn: async () => {
      console.log("Fetching animal types...");
      
      // Fetch all data in parallel
      const [typesResponse, subtypesResponse, subSubtypesResponse] = await Promise.all([
        supabase.from("animal_types").select("*").order("name"),
        supabase.from("animal_subtypes").select("*").order("name"),
        supabase.from("animal_sub_subtypes").select("*").order("name")
      ]);

      if (typesResponse.error) {
        console.error("Error fetching animal types:", typesResponse.error);
        throw typesResponse.error;
      }

      if (subtypesResponse.error) {
        console.error("Error fetching animal subtypes:", subtypesResponse.error);
        throw subtypesResponse.error;
      }

      if (subSubtypesResponse.error) {
        console.error("Error fetching animal sub-subtypes:", subSubtypesResponse.error);
        throw subSubtypesResponse.error;
      }

      // Organize subtypes by type
      const subtypesByType = subtypesResponse.data.reduce((acc: Record<number, any[]>, subtype) => {
        if (subtype.animal_type_id) {
          acc[subtype.animal_type_id] = [
            ...(acc[subtype.animal_type_id] || []),
            subtype
          ];
        }
        return acc;
      }, {});

      // Organize sub-subtypes by subtype
      const subSubtypesBySubtype = subSubtypesResponse.data.reduce((acc: Record<number, any[]>, subSubtype) => {
        if (subSubtype.animal_subtype_id) {
          acc[subSubtype.animal_subtype_id] = [
            ...(acc[subSubtype.animal_subtype_id] || []),
            subSubtype
          ];
        }
        return acc;
      }, {});

      console.log("Successfully fetched animal types data:", {
        types: typesResponse.data,
        subtypesByType,
        subSubtypesBySubtype
      });

      return {
        types: typesResponse.data,
        subtypesByType,
        subSubtypesBySubtype
      };
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};