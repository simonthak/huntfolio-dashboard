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
    console.log("Starting report creation with data:", JSON.stringify(data, null, 2));

    try {
      console.log("Getting authenticated user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        toast.error("Authentication error. Please try logging in again.");
        return;
      }
      
      if (!user) {
        console.error("No user found");
        toast.error("You must be logged in to create reports");
        return;
      }

      console.log("Getting user's team...");
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      if (teamError) {
        console.error("Team fetch error:", teamError);
        toast.error("Error fetching user's team. Please try again.");
        return;
      }

      if (!teamMember?.team_id) {
        console.error("No team_id found for user");
        toast.error("You must be part of a team to create reports");
        return;
      }

      const reportData = {
        hunt_type_id: data.hunt_type_id,
        date: data.date.toISOString().split('T')[0],
        participant_count: data.participant_count,
        description: data.description,
        created_by: user.id,
        team_id: teamMember.team_id
      };

      console.log("Creating report with data:", reportData);
      const { error: reportError, data: createdReport } = await supabase
        .from("hunting_reports")
        .insert(reportData)
        .select()
        .single();

      if (reportError) {
        console.error("Report creation error:", reportError);
        toast.error(reportError.message || "Failed to create report");
        return;
      }

      if (!createdReport) {
        console.error("No report data returned after creation");
        toast.error("Error creating report: No data returned");
        return;
      }

      if (data.animals.length > 0) {
        console.log("Adding animals to report:", createdReport.id);
        const animalData = data.animals.map(animal => ({
          report_id: createdReport.id,
          animal_type_id: animal.animal_type_id,
          animal_subtype_id: animal.animal_subtype_id,
          quantity: animal.quantity,
        }));

        console.log("Animal data to insert:", animalData);
        const { error: animalsError } = await supabase
          .from("report_animals")
          .insert(animalData);

        if (animalsError) {
          console.error("Animals creation error:", animalsError);
          toast.error("Report created but failed to add animals");
          return;
        }
      }

      console.log("Report created successfully");
      await onReportCreated();
      onOpenChange(false);
      toast.success("Report created successfully");
    } catch (error) {
      console.error("Detailed error in report creation process:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create report: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
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