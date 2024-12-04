import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Report } from "./types";

interface ReportsTableProps {
  reports: Report[];
  currentUserId: string | null;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;
}

const ReportsTable = ({ 
  reports, 
  currentUserId,
  onView,
  onEdit,
  onDelete 
}: ReportsTableProps) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Jakttyp</TableHead>
            <TableHead>Byten</TableHead>
            <TableHead>Deltagare</TableHead>
            <TableHead>Rapporterad av</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Inga rapporter hittades
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => {
              const fullName = report.created_by_profile?.firstname && report.created_by_profile?.lastname
                ? `${report.created_by_profile.firstname} ${report.created_by_profile.lastname}`
                : "Okänd";
              return (
                <TableRow 
                  key={report.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onView(report)}
                >
                  <TableCell>{format(new Date(report.date), "d MMM yyyy")}</TableCell>
                  <TableCell>{report.hunt_type?.name || "Okänd"}</TableCell>
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
                    <div 
                      className="flex justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {report.created_by === currentUserId && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(report);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(report);
                            }}
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
    </div>
  );
};

export default ReportsTable;