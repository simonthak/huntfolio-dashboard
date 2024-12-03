import { useState, useEffect } from "react";
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
import { useQueryClient } from "@tanstack/react-query";

const Reports = () => {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchParams] = useSearchParams();
  const currentTeamId = searchParams.get('team');
  
  const { data: reports = [], isLoading, refetch } = useReportsData(currentTeamId);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Prefetch hunt types and animal types when reports page loads
  useEffect(() => {
    // Prefetch hunt types
    queryClient.prefetchQuery({
      queryKey: ["hunt-types"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("hunt_types")
          .select("*")
          .order("name");
        
        if (error) throw error;
        return data;
      },
    });

    // Prefetch animal types and subtypes
    queryClient.prefetchQuery({
      queryKey: ["animal-types"],
      queryFn: async () => {
        const [typesResponse, subtypesResponse] = await Promise.all([
          supabase.from("animal_types").select("*").order("name"),
          supabase.from("animal_subtypes").select("*").order("name")
        ]);

        if (typesResponse.error) throw typesResponse.error;
        if (subtypesResponse.error) throw subtypesResponse.error;

        const subtypesByType = subtypesResponse.data.reduce((acc: Record<number, any[]>, subtype) => {
          if (subtype.animal_type_id) {
            acc[subtype.animal_type_id] = [
              ...(acc[subtype.animal_type_id] || []),
              subtype
            ];
          }
          return acc;
        }, {});

        return {
          types: typesResponse.data,
          subtypesByType
        };
      },
    });
  }, [queryClient]);

  const handleDelete = async (report: Report) => {
    try {
      console.log("Tar bort rapport:", report.id);
      const { error } = await supabase
        .from("hunting_reports")
        .delete()
        .eq('id', report.id);

      if (error) throw error;
      await refetch();
      toast.success("Rapporten har tagits bort");
    } catch (error) {
      console.error("Fel vid borttagning av rapport:", error);
      toast.error("Kunde inte ta bort rapporten");
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
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Rapporten kommer att tas bort permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
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
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reports;