import { Button } from '@/components/ui/button';
import { MapPin, Target } from 'lucide-react';

interface MapControlsProps {
  isDrawing: boolean;
  onDrawArea: () => void;
  onSaveArea: () => void;
  onAddTower: () => void;
}

const MapControls = ({ isDrawing, onDrawArea, onSaveArea, onAddTower }: MapControlsProps) => {
  return (
    <div className="space-x-2">
      {!isDrawing ? (
        <>
          <Button 
            variant="outline" 
            onClick={onDrawArea}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Rita område
          </Button>
          <Button 
            variant="outline" 
            onClick={onAddTower}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Lägg till jakttorn
          </Button>
        </>
      ) : (
        <Button 
          variant="default" 
          onClick={onSaveArea}
          className="bg-[#13B67F] hover:bg-[#13B67F]/90"
        >
          Spara område
        </Button>
      )}
    </div>
  );
};

export default MapControls;