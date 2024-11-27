import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import CreateReportDialog from "@/components/reports/CreateReportDialog";
import ViewReportDialog from "@/components/reports/ViewReportDialog";
import EditReportDialog from "@/components/reports/EditReportDialog";
import ReportsTable from "@/components/reports/ReportsTable";
import { Report } from "@/components/reports/types";
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
      return data as Report[];
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

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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