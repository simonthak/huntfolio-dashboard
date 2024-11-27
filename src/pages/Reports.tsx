import { useState } from "react";
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
import { Plus } from "lucide-react";
import CreateReportDialog from "@/components/reports/CreateReportDialog";

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
  created_by_profile: { full_name: string };
  report_animals: ReportAnimal[];
}

const Reports = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["hunting-reports"],
    queryFn: async () => {
      console.log("Fetching hunting reports...");
      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          *,
          hunt_type:hunt_types(name),
          created_by_profile:profiles!hunting_reports_created_by_fkey(full_name),
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

      console.log("Successfully fetched hunting reports:", data);
      return (data || []) as Report[];
    },
  });

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
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Hunt Type</TableHead>
              <TableHead>Animals</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Reported By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
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
                  <TableCell>{report.created_by_profile.full_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateReportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onReportCreated={refetch}
      />
    </div>
  );
};

export default Reports;