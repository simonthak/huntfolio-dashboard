import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnimalTypes = () => {
  return useQuery({
    queryKey: ["animal-types"],
    queryFn: async () => {
      console.log("Fetching animal types...");
      
      // Fetch animal types
      const { data: types, error: typesError } = await supabase
        .from("animal_types")
        .select("*")
        .order("name");

      if (typesError) {
        console.error("Error fetching animal types:", typesError);
        throw typesError;
      }

      // Fetch subtypes
      const { data: subtypes, error: subtypesError } = await supabase
        .from("animal_subtypes")
        .select(`
          id,
          name,
          animal_type_id
        `)
        .order("name");

      if (subtypesError) {
        console.error("Error fetching animal subtypes:", subtypesError);
        throw subtypesError;
      }

      // Fetch sub-subtypes
      const { data: subSubtypes, error: subSubtypesError } = await supabase
        .from("animal_sub_subtypes")
        .select(`
          id,
          name,
          animal_subtype_id
        `)
        .order("name");

      if (subSubtypesError) {
        console.error("Error fetching animal sub-subtypes:", subSubtypesError);
        throw subSubtypesError;
      }

      console.log("Fetched sub-subtypes:", subSubtypes);

      // Organize subtypes by type
      const subtypesByType = subtypes.reduce((acc: Record<number, any[]>, subtype) => {
        if (subtype.animal_type_id) {
          acc[subtype.animal_type_id] = [
            ...(acc[subtype.animal_type_id] || []),
            subtype
          ];
        }
        return acc;
      }, {});

      // Organize sub-subtypes by subtype
      const subSubtypesBySubtype = subSubtypes.reduce((acc: Record<number, any[]>, subSubtype) => {
        if (subSubtype.animal_subtype_id) {
          acc[subSubtype.animal_subtype_id] = [
            ...(acc[subSubtype.animal_subtype_id] || []),
            subSubtype
          ];
        }
        return acc;
      }, {});

      console.log("Successfully fetched animal types, subtypes, and sub-subtypes", {
        types,
        subtypesByType,
        subSubtypesBySubtype
      });

      return {
        types,
        subtypesByType,
        subSubtypesBySubtype
      };
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};