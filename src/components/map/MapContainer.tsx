import { useEffect, useRef, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { initializeMapbox, createMapInstance } from '@/utils/mapUtils';

interface MapContainerProps {
  onMapLoad: (map: mapboxgl.Map, draw: any) => void;
  currentTeamId: string | null;
}

const MapContainer = memo(({ onMapLoad, currentTeamId }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const drawInstanceRef = useRef<any>(null);
  const isLoadingRef = useRef<boolean>(true);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (!mapContainerRef.current || !currentTeamId) return;

    const initializeMap = async () => {
      try {
        console.log('Initializing map...');
        const token = await initializeMapbox();
        
        if (!isMountedRef.current || !mapContainerRef.current) {
          console.log('Component unmounted during initialization');
          return;
        }
        
        const { map, draw } = createMapInstance(mapContainerRef.current, token);
        
        if (!isMountedRef.current) {
          console.log('Component unmounted after map creation');
          map.remove();
          return;
        }
        
        mapInstanceRef.current = map;
        drawInstanceRef.current = draw;

        map.once('load', () => {
          console.log('Map loaded, calling onMapLoad callback');
          if (isMountedRef.current && mapInstanceRef.current && drawInstanceRef.current) {
            isLoadingRef.current = false;
            onMapLoad(mapInstanceRef.current, drawInstanceRef.current);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMountedRef.current) {
          toast.error('Ett fel uppstod när kartan skulle laddas');
          isLoadingRef.current = false;
        }
      }
    };

    initializeMap();

    return () => {
      console.log('Starting cleanup of map component...');
      isMountedRef.current = false;
      
      if (mapInstanceRef.current) {
        console.log('Removing map instance...');
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
      
      if (drawInstanceRef.current) {
        console.log('Cleaning up draw instance...');
        drawInstanceRef.current = null;
      }
      
      isLoadingRef.current = true;
    };
  }, [currentTeamId, onMapLoad]);

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
      {isLoadingRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;