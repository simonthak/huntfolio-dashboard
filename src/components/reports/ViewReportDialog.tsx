import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportAnimal {
  animal_type: { name: string };
  animal_subtype?: { name: string };
  quantity: number;
}

interface Report {
  id: string;
  date: string;
  hunt_type: { name: string };
  participant_count: number;
  description?: string;
  created_by_profile: { firstname: string; lastname: string };
  report_animals: ReportAnimal[];
}

interface ViewReportDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewReportDialog = ({ report, open, onOpenChange }: ViewReportDialogProps) => {
  if (!report) return null;

  const fullName = report.created_by_profile?.firstname && report.created_by_profile?.lastname
    ? `${report.created_by_profile.firstname} ${report.created_by_profile.lastname}`
    : "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hunting Report Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{format(new Date(report.date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hunt Type</p>
                  <p>{report.hunt_type.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p>{report.participant_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reported By</p>
                  <p>{fullName}</p>
                </div>
              </div>
            </div>

            {report.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{report.description}</p>
              </div>
            )}

            {report.report_animals.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Animals</h3>
                <div className="space-y-2">
                  {report.report_animals.map((animal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-medium">{animal.quantity}x</span>
                      <span>
                        {animal.animal_type.name}
                        {animal.animal_subtype?.name && ` (${animal.animal_subtype.name})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReportDialog;