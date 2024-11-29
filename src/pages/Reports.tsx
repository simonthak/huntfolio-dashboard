import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import CreateReportDialog from "@/components/reports/CreateReportDialog";
import ViewReportDialog from "@/components/reports/ViewReportDialog";
import EditReportDialog from "@/components/reports/EditReportDialog";
import ReportsTable from "@/components/reports/ReportsTable";
import ReportsHeader from "@/components/reports/ReportsHeader";
import { useQuery } from "@tanstack/react-query";
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

const Reports = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["hunting-reports", currentTeamId],
    queryFn: async () => {
      console.log("Fetching hunting reports for team:", currentTeamId);
      
      if (!currentTeamId) {
        console.log("No team selected");
        return [];
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error");
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("Not authenticated");
      }

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
        .eq('team_id', currentTeamId)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching hunting reports:", error);
        throw error;
      }

      console.log("Successfully fetched reports:", data);
      return data as Report[];
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error in reports query:", error);
        toast.error("Failed to load reports");
      }
    },
    enabled: !!currentTeamId
  });

  useEffect(() => {
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
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">No Team Selected</h2>
        <p className="text-gray-600">Please select a team to view reports</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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