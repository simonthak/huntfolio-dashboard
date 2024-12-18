import { Button } from "@/components/ui/button";
import { MapPin, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MapToolbarProps {
  onToolClick: (mode: 'area' | 'pass') => void;
}

const MapToolbar = ({ onToolClick }: MapToolbarProps) => {
  const handleToolClick = (mode: 'area' | 'pass') => {
    console.log('MapToolbar: Tool clicked:', mode);
    onToolClick(mode);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-2 space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleToolClick('area')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Rita drevområde</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleToolClick('pass')}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Placera pass</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default MapToolbar;