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
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const initializeMap = async () => {
      // Prevent multiple initializations
      if (isInitializedRef.current || !mapContainerRef.current || !currentTeamId) {
        console.log('Skipping map initialization:', {
          isInitialized: isInitializedRef.current,
          hasContainer: !!mapContainerRef.current,
          hasTeamId: !!currentTeamId
        });
        return;
      }

      try {
        console.log('Initializing map with token...');
        const token = await initializeMapbox();

        if (!mapContainerRef.current) {
          console.error('Map container not found after token fetch');
          return;
        }

        console.log('Creating map instance...');
        const { map, draw } = createMapInstance(mapContainerRef.current, token);

        // Store instances locally
        mapInstanceRef.current = map;
        drawInstanceRef.current = draw;
        isInitializedRef.current = true;

        // Handle map load event
        map.once('load', () => {
          console.log('Map loaded successfully');
          // Ensure we have valid instances before calling onMapLoad
          if (mapInstanceRef.current && drawInstanceRef.current) {
            try {
              onMapLoad(mapInstanceRef.current, drawInstanceRef.current);
            } catch (error) {
              console.error('Error in onMapLoad callback:', error);
              toast.error('Ett fel uppstod när kartan skulle initialiseras');
            }
          }
        });

        // Handle map errors
        map.on('error', (e) => {
          console.error('Map error:', e);
          toast.error('Ett fel uppstod med kartan');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Ett fel uppstod när kartan skulle laddas');
        isInitializedRef.current = false;
      }
    };

    console.log('MapContainer mounted, initializing map...');
    initializeMap();

    // Cleanup function
    return () => {
      console.log('MapContainer unmounting, cleaning up...');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      drawInstanceRef.current = null;
      isInitializedRef.current = false;
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
      {!mapInstanceRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;