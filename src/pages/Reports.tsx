import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import CreateReportDialog from "@/components/reports/CreateReportDialog";
import ViewReportDialog from "@/components/reports/ViewReportDialog";
import EditReportDialog from "@/components/reports/EditReportDialog";
import ReportsTable from "@/components/reports/ReportsTable";
import ReportsHeader from "@/components/reports/ReportsHeader";
import { Report } from "@/components/reports/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { useReportsData } from "./Reports/useReportsData";
import { LoadingState } from "./Reports/LoadingState";
import { NoTeamSelected } from "./Reports/NoTeamSelected";

const Reports = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  
  const { data: reports = [], isLoading, refetch } = useReportsData(currentTeamId);

  useState(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleDelete = async (report: Report) => {
    try {
      console.log("Deleting report:", report.id);
      const { error } = await supabase
        .from("hunting_reports")
        .delete()
        .eq('id', report.id);

      if (error) throw error;
      await refetch();
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  if (!currentTeamId) {
    return <NoTeamSelected />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <ReportsHeader onCreateReport={() => setCreateDialogOpen(true)} />

      <Card>
        <ReportsTable 
          reports={reports}
          currentUserId={currentUserId}
          onView={(report) => {
            setSelectedReport(report);
            setViewDialogOpen(true);
          }}
          onEdit={(report) => {
            setSelectedReport(report);
            setEditDialogOpen(true);
          }}
          onDelete={(report) => {
            setSelectedReport(report);
            setDeleteDialogOpen(true);
          }}
        />
      </Card>

      <CreateReportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onReportCreated={refetch}
      />

      <ViewReportDialog
        report={selectedReport}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {selectedReport && (
        <EditReportDialog
          report={selectedReport}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onReportUpdated={refetch}
        />
      )}

      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
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
                if (selectedReport) {
                  handleDelete(selectedReport);
                  setDeleteDialogOpen(false);
                  setSelectedReport(null);
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