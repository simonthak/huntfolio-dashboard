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

const CreateReportDialog = ({ open, onOpenChange, onReportCreated }: CreateReportDialogProps) => {
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) {
        toast.error("You must be logged in to create reports");
        return;
      }

      // Get user's team
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      if (teamError) throw teamError;
      if (!teamMember?.team_id) {
        toast.error("You must be part of a team to create reports");
        return;
      }

      const { data: report, error: reportError } = await supabase
        .from("hunting_reports")
        .insert({
          hunt_type_id: data.hunt_type_id,
          date: data.date.toISOString().split('T')[0],
          participant_count: data.participant_count,
          description: data.description,
          created_by: user.id,
          team_id: teamMember.team_id
        })
        .select()
        .single();

      if (reportError) throw reportError;

      if (data.animals.length > 0) {
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

        if (animalsError) throw animalsError;
      }

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