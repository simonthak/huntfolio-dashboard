import { useRef, memo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Loader2 } from 'lucide-react';
import { useMapInstance } from '@/hooks/useMapInstance';

interface MapContainerProps {
  onMapLoad: (map: mapboxgl.Map, draw: any) => void;
  currentTeamId: string | null;
}

const MapContainer = memo(({ onMapLoad, currentTeamId }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const handleMapLoad = useCallback((map: mapboxgl.Map, draw: any) => {
    try {
      onMapLoad(map, draw);
    } catch (error) {
      console.error('Error in map load callback:', error);
    }
  }, [onMapLoad]);

  const { isLoading } = useMapInstance(mapContainerRef, currentTeamId, handleMapLoad);

  if (!currentTeamId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Välj ett jaktlag för att visa kartan</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] rounded-lg overflow-hidden border">
      <div ref={mapContainerRef} className="absolute inset-0" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-[#13B67F]" />
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;