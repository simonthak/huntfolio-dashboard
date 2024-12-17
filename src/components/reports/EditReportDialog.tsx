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
    animals: report.report_animals
  });

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hunting Report</DialogTitle>
        </DialogHeader>
        <ReportForm
          initialData={{
            hunt_type_id: report.hunt_type?.id,
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