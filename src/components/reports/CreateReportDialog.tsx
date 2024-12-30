import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReportForm from "./form/ReportForm";
import { useCreateReport } from "./hooks/useCreateReport";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated: () => void;
}

const CreateReportDialog = ({ open, onOpenChange, onReportCreated }: CreateReportDialogProps) => {
  const { createReport, isSubmitting } = useCreateReport(() => {
    onReportCreated();
    onOpenChange(false);
  });

  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing through the X button, not by clicking outside
    if (!newOpen && event?.type === 'click' && (event.target as HTMLElement).closest('[data-state="open"]')) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa ny jaktrapport</DialogTitle>
        </DialogHeader>
        <ReportForm
          onSubmit={createReport}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;