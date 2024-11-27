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
    animal_type_id: number;
    animal_subtype_id?: number;
    date: Date;
    quantity: number;
    participant_count: number;
    description?: string;
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

      console.log("Authenticated user:", user.id);

      const reportData = {
        hunt_type_id: data.hunt_type_id,
        animal_type_id: data.animal_type_id,
        animal_subtype_id: data.animal_subtype_id,
        date: data.date.toISOString().split('T')[0],
        quantity: data.quantity,
        participant_count: data.participant_count,
        description: data.description,
        created_by: user.id,
      };

      console.log("Attempting to create report with data:", reportData);

      const { error: reportError } = await supabase
        .from("hunting_reports")
        .insert(reportData);

      if (reportError) {
        console.error("Report creation error:", reportError);
        throw reportError;
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