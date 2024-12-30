import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEditReport = (onReportUpdated: () => void, onClose: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editReport = async (reportId: string, data: {
    hunt_type_id: number;
    date: Date;
    participant_count: number;
    description?: string;
    animals: Array<{
      animal_type_id: number;
      animal_subtype_id?: number;
      quantity: number;
    }>;
  }) => {
    setIsSubmitting(true);

    try {
      console.log("Updating report...");
      const { error: reportError } = await supabase
        .from("hunting_reports")
        .update({
          hunt_type_id: data.hunt_type_id,
          date: data.date.toISOString().split('T')[0],
          participant_count: data.participant_count,
          description: data.description,
        })
        .eq('id', reportId);

      if (reportError) {
        console.error("Report update error:", reportError);
        throw reportError;
      }

      // Delete existing animals
      const { error: deleteError } = await supabase
        .from("report_animals")
        .delete()
        .eq('report_id', reportId);

      if (deleteError) {
        console.error("Error deleting existing animals:", deleteError);
        throw deleteError;
      }

      // Insert new animals if there are any
      if (data.animals.length > 0) {
        console.log("Updating report animals...");
        const { error: animalsError } = await supabase
          .from("report_animals")
          .insert(
            data.animals.map(animal => ({
              report_id: reportId,
              animal_type_id: animal.animal_type_id,
              animal_subtype_id: animal.animal_subtype_id,
              quantity: animal.quantity,
            }))
          );

        if (animalsError) {
          console.error("Report animals update error:", animalsError);
          throw animalsError;
        }
      }

      console.log("Report updated successfully");
      await onReportUpdated();
      onClose();
      toast.success("Report updated successfully");
    } catch (error) {
      console.error("Error in report update process:", error);
      toast.error("Failed to update report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    editReport,
    isSubmitting
  };
};