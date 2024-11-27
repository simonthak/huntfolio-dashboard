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
import { format } from "date-fns";

const Reports = () => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["hunting-reports"],
    queryFn: async () => {
      console.log("Fetching hunting reports...");
      const { data, error } = await supabase
        .from("hunting_reports")
        .select(`
          *,
          hunt_type:hunt_types(name),
          animal_type:animal_types(name),
          animal_subtype:animal_subtypes(name),
          created_by_profile:profiles!hunting_reports_created_by_fkey(full_name)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching hunting reports:", error);
        throw error;
      }

      console.log("Successfully fetched hunting reports:", data);
      return data || [];
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hunting Reports</h1>
        <p className="text-gray-500 mt-1">View all hunting reports and their details</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Hunt Type</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Reported By</TableHead>
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
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{format(new Date(report.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{report.hunt_type.name}</TableCell>
                  <TableCell>
                    {report.animal_type.name}
                    {report.animal_subtype?.name && ` (${report.animal_subtype.name})`}
                  </TableCell>
                  <TableCell>{report.quantity}</TableCell>
                  <TableCell>{report.participant_count}</TableCell>
                  <TableCell>{report.created_by_profile.full_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Reports;