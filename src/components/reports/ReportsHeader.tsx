import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ReportsHeaderProps {
  onCreateReport: () => void;
}

const ReportsHeader = ({ onCreateReport }: ReportsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jaktrapporter</h1>
        <p className="text-gray-500 mt-1">View all hunting reports and their details</p>
      </div>
      <Button 
        onClick={onCreateReport} 
        style={{ backgroundColor: '#13B67F' }}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Report
      </Button>
    </div>
  );
};

export default ReportsHeader;