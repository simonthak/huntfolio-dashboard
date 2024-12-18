import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';
import { initializeMapbox, createMapInstance } from '@/utils/mapUtils';

export const useMapInstance = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  currentTeamId: string | null,
  onMapLoad: (map: mapboxgl.Map, draw: any) => void
) => {
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

        map.once('load', () => {
          console.log('Map loaded, calling onMapLoad callback');
          if (isMountedRef.current) {
            isLoadingRef.current = false;
            onMapLoad(map, draw);
          }
        });

        return () => {
          if (map) {
            console.log('Removing map instance...');
            try {
              map.remove();
            } catch (error) {
              console.error('Error removing map:', error);
            }
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMountedRef.current) {
          toast.error('Ett fel uppstod när kartan skulle laddas');
          isLoadingRef.current = false;
        }
      }
    };

    const cleanup = initializeMap();

    return () => {
      console.log('Starting cleanup...');
      isMountedRef.current = false;
      if (cleanup) cleanup();
    };
  }, [currentTeamId, onMapLoad]);

  return {
    isLoading: isLoadingRef.current
  };
};