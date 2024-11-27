import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReportForm from "./form/ReportForm";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated: () => void;
}

const CreateReportDialog = ({ 
  open, 
  onOpenChange, 
  onReportCreated 
}: CreateReportDialogProps) => {
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
      console.log("Getting authenticated user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      if (!user) {
        console.error("No authenticated user found");
        toast.error("You must be logged in to create reports");
        return;
      }

      console.log("Creating report...");
      const { data: report, error: reportError } = await supabase
        .from("hunting_reports")
        .insert({
          hunt_type_id: data.hunt_type_id,
          date: data.date.toISOString().split('T')[0],
          participant_count: data.participant_count,
          description: data.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (reportError) {
        console.error("Report creation error:", reportError);
        throw reportError;
      }

      // Only insert animals if there are any
      if (data.animals.length > 0) {
        console.log("Creating report animals...");
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
          console.error("Report animals creation error:", animalsError);
          throw animalsError;
        }
      }

      console.log("Report created successfully");
      await onReportCreated();
      onOpenChange(false);
      toast.success("Report created successfully");
    } catch (error) {
      console.error("Error in report creation process:", error);
      toast.error("Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Hunting Report</DialogTitle>
        </DialogHeader>
        <ReportForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;