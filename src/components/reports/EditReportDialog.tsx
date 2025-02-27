import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReportForm from "./form/ReportForm";
import { useEditReport } from "./hooks/useEditReport";

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
  const { editReport, isSubmitting } = useEditReport(onReportUpdated, () => onOpenChange(false));

  // Log the report data to help with debugging
  console.log("Report data for editing:", {
    report_id: report.id,
    hunt_type: report.hunt_type,
    animals: report.report_animals.map((animal: any) => ({
      animal_type_id: animal.animal_type?.id,
      animal_subtype_id: animal.animal_subtype?.id,
      quantity: animal.quantity,
      animal_type_name: animal.animal_type?.name,
      animal_subtype_name: animal.animal_subtype?.name
    }))
  });

  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing through the X button, not by clicking outside
    if (!newOpen && event?.type === 'click' && (event.target as HTMLElement).closest('[data-state="open"]')) {
      onOpenChange(false);
    }
  };

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
    await editReport(report.id, data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redigera jaktrapport</DialogTitle>
        </DialogHeader>
        <ReportForm
          initialData={{
            hunt_type_id: report.hunt_type?.id,
            date: new Date(report.date),
            participant_count: report.participant_count,
            description: report.description,
            animals: report.report_animals.map((animal: any) => ({
              animal_type_id: animal.animal_type?.id,
              animal_subtype_id: animal.animal_subtype?.id,
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