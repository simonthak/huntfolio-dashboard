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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Hunting Report</DialogTitle>
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