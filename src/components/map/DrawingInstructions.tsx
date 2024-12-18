import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DrawingInstructionsProps {
  show: boolean;
}

const DrawingInstructions = ({ show }: DrawingInstructionsProps) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-[400px]">
      <Alert className="bg-white/90 backdrop-blur-sm border-primary shadow-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            Dubbelklicka eller klicka på första punkten för att slutföra drevet
          </span>
        </div>
      </Alert>
    </div>
  );
};

export default DrawingInstructions;