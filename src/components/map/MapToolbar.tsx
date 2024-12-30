import { Button } from "@/components/ui/button";
import { MapPin, Pencil, Hand } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MapToolbarProps {
  onToolClick: (mode: 'drag' | 'area' | 'pass') => void;
  activeMode: 'drag' | 'area' | 'pass';
}

const MapToolbar = ({ onToolClick, activeMode }: MapToolbarProps) => {
  const handleToolClick = (mode: 'drag' | 'area' | 'pass') => {
    console.log('MapToolbar: Tool clicked:', mode);
    onToolClick(mode);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-2 space-x-2">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button 
            variant={activeMode === 'drag' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => handleToolClick('drag')}
          >
            <Hand className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-secondary text-secondary-foreground"
          sideOffset={5}
        >
          Panorera kartan
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button 
            variant={activeMode === 'area' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => handleToolClick('area')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-secondary text-secondary-foreground"
          sideOffset={5}
        >
          Rita drevområde
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button 
            variant={activeMode === 'pass' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => handleToolClick('pass')}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-secondary text-secondary-foreground"
          sideOffset={5}
        >
          Placera pass
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default MapToolbar;