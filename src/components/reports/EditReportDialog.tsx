import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReportForm from "./form/ReportForm";

interface EditReportDialogProps {
  report: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdated: () => void;
}

const EditReportDialog = ({ 
  report, 
  open, 
  onOpenChange, 
  onReportUpdated 
}: EditReportDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
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
        .eq('id', report.id);

      if (reportError) {
        console.error("Report update error:", reportError);
        throw reportError;
      }

      // Delete existing animals
      const { error: deleteError } = await supabase
        .from("report_animals")
        .delete()
        .eq('report_id', report.id);

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
              report_id: report.id,
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
      onOpenChange(false);
      toast.success("Report updated successfully");
    } catch (error) {
      console.error("Error in report update process:", error);
      toast.error("Failed to update report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hunting Report</DialogTitle>
        </DialogHeader>
        <ReportForm
          initialData={{
            hunt_type_id: report.hunt_type_id,
            date: new Date(report.date),
            participant_count: report.participant_count,
            description: report.description,
            animals: report.report_animals.map((animal: any) => ({
              animal_type_id: animal.animal_type_id,
              animal_subtype_id: animal.animal_subtype_id,
              quantity: animal.quantity,
            })),
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditReportDialog;