import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CreateReportDialog from "@/components/reports/CreateReportDialog";
import ViewReportDialog from "@/components/reports/ViewReportDialog";
import EditReportDialog from "@/components/reports/EditReportDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  created_by: string;
  created_by_profile: { full_name: string; firstname: string; lastname: string };
  report_animals: ReportAnimal[];
}

const useReportDialogs = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  return {
    createDialogOpen,
    setCreateDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedReport,
    setSelectedReport,
  };
};

const useReportDeletion = (refetch: () => void) => {
  const handleDelete = async (report: Report) => {
    try {
      console.log("Deleting report:", report.id);
      const { error } = await supabase
        .from("hunting_reports")
        .delete()
        .eq('id', report.id);

      if (error) throw error;

      toast.success("Report deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  return { handleDelete };
};

const ReportsTable = ({ 
  reports, 
  currentUserId,
  onView,
  onEdit,
  onDelete
}: { 
  reports: Report[], 
  currentUserId: string | null,
  onView: (report: Report) => void,
  onEdit: (report: Report) => void,
  onDelete: (report: Report) => void
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Hunt Type</TableHead>
          <TableHead>Animals</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead>Reported By</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No reports found
            </TableCell>
          </TableRow>
        ) : (
          reports.map((report) => {
            console.log("Rendering report:", report);
            console.log("Profile data:", report.created_by_profile);
            const fullName = report.created_by_profile?.firstname && report.created_by_profile?.lastname
              ? `${report.created_by_profile.firstname} ${report.created_by_profile.lastname}`
              : "Unknown";
            return (
              <TableRow key={report.id}>
                <TableCell>{format(new Date(report.date), "MMM d, yyyy")}</TableCell>
                <TableCell>{report.hunt_type.name}</TableCell>
                <TableCell>
                  {report.report_animals.map((animal, index) => (
                    <div key={index}>
                      {animal.quantity}x {animal.animal_type.name}
                      {animal.animal_subtype?.name && ` (${animal.animal_subtype.name})`}
                    </div>
                  ))}
                </TableCell>
                <TableCell>{report.participant_count}</TableCell>
                <TableCell>{fullName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {report.created_by === currentUserId && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(report)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

const Reports = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const dialogState = useReportDialogs();
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["hunting-reports"],
    queryFn: async () => {
      console.log("Fetching hunting reports...");
      
      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          *,
          hunt_type:hunt_types(name),
          created_by_profile:profiles!hunting_reports_created_by_fkey(
            firstname,
            lastname
          ),
          report_animals(
            quantity,
            animal_type:animal_types(name),
            animal_subtype:animal_subtypes(name)
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching hunting reports:", error);
        throw error;
      }

      console.log("Fetched reports data:", data);
      return (data || []) as Report[];
    },
  });

  const { handleDelete } = useReportDeletion(refetch);

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hunting Reports</h1>
          <p className="text-gray-500 mt-1">View all hunting reports and their details</p>
        </div>
        <Button 
          onClick={() => dialogState.setCreateDialogOpen(true)} 
          style={{ backgroundColor: '#13B67F' }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <ReportsTable 
          reports={reports}
          currentUserId={currentUserId}
          onView={(report) => {
            dialogState.setSelectedReport(report);
            dialogState.setViewDialogOpen(true);
          }}
          onEdit={(report) => {
            dialogState.setSelectedReport(report);
            dialogState.setEditDialogOpen(true);
          }}
          onDelete={(report) => {
            dialogState.setSelectedReport(report);
            dialogState.setDeleteDialogOpen(true);
          }}
        />
      </div>

      <CreateReportDialog
        open={dialogState.createDialogOpen}
        onOpenChange={dialogState.setCreateDialogOpen}
        onReportCreated={refetch}
      />

      <ViewReportDialog
        report={dialogState.selectedReport}
        open={dialogState.viewDialogOpen}
        onOpenChange={dialogState.setViewDialogOpen}
      />

      {dialogState.selectedReport && (
        <EditReportDialog
          report={dialogState.selectedReport}
          open={dialogState.editDialogOpen}
          onOpenChange={dialogState.setEditDialogOpen}
          onReportUpdated={refetch}
        />
      )}

      <AlertDialog 
        open={dialogState.deleteDialogOpen} 
        onOpenChange={dialogState.setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hunting report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (dialogState.selectedReport) {
                  handleDelete(dialogState.selectedReport);
                  dialogState.setDeleteDialogOpen(false);
                  dialogState.setSelectedReport(null);
                }
              }} 
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reports;
