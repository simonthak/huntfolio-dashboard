import { Button } from '@/components/ui/button';
import { Map, MapPin } from 'lucide-react';

interface MapControlsProps {
  isDrawing: boolean;
  onDrawArea: () => void;
  onSaveArea: () => void;
  onAddPass: () => void;
}

const MapControls = ({ isDrawing, onDrawArea, onSaveArea, onAddPass }: MapControlsProps) => {
  return (
    <div className="space-x-2">
      {!isDrawing ? (
        <>
          <Button 
            variant="outline" 
            onClick={onDrawArea}
            className="flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            Rita drev
          </Button>
          <Button 
            variant="outline" 
            onClick={onAddPass}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Lägg till pass
          </Button>
        </>
      ) : (
        <Button 
          variant="default" 
          onClick={onSaveArea}
          className="bg-[#13B67F] hover:bg-[#13B67F]/90"
        >
          Spara drev
        </Button>
      )}
    </div>
  );
};

export default MapControls;