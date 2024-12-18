import { useEffect, useRef, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Loader2 } from 'lucide-react';
import { initializeMapbox, createMapInstance } from '@/utils/mapUtils';

interface MapContainerProps {
  onMapLoad: (map: mapboxgl.Map, draw: any) => void;
  currentTeamId: string | null;
}

const MapContainer = memo(({ onMapLoad, currentTeamId }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current || !currentTeamId) {
        console.log('Initialization conditions not met:', {
          hasContainer: !!mapContainer.current,
          hasTeamId: !!currentTeamId
        });
        return;
      }

      if (map.current) {
        console.log('Map already initialized');
        return;
      }

      try {
        const token = await initializeMapbox();

        if (!mapContainer.current) {
          console.error('Map container not found after token fetch');
          return;
        }

        console.log('Creating map instance...');
        const { map: mapInstance, draw: drawInstance } = createMapInstance(mapContainer.current, token);

        map.current = mapInstance;
        draw.current = drawInstance;

        let isMapLoaded = false;

        mapInstance.on('load', () => {
          console.log('Map loaded successfully');
          if (!isMapLoaded && map.current && draw.current) {
            isMapLoaded = true;
            onMapLoad(map.current, draw.current);
          }
        });

        mapInstance.on('error', (e) => {
          console.error('Map error:', e);
          toast.error('Ett fel uppstod med kartan');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Ett fel uppstod när kartan skulle laddas');
      }
    };

    console.log('MapContainer mounted, initializing map...');
    initializeMap();

    return () => {
      console.log('MapContainer unmounting, cleaning up...');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      draw.current = null;
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
      <div ref={mapContainer} className="absolute inset-0" />
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;