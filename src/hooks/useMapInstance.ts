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

    let mapInstance: mapboxgl.Map | null = null;
    
    const initializeMap = async () => {
      try {
        console.log('Initializing map...');
        const token = await initializeMapbox();
        
        if (!isMountedRef.current || !mapContainerRef.current) {
          console.log('Component unmounted during initialization');
          return;
        }
        
        const { map, draw } = createMapInstance(mapContainerRef.current, token);
        mapInstance = map;

        map.once('load', () => {
          console.log('Map loaded, calling onMapLoad callback');
          if (isMountedRef.current) {
            isLoadingRef.current = false;
            onMapLoad(map, draw);
          }
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMountedRef.current) {
          toast.error('Kunde inte ladda kartan');
          isLoadingRef.current = false;
        }
      }
    };

    initializeMap();

    return () => {
      console.log('Starting cleanup...');
      isMountedRef.current = false;
      
      if (mapInstance) {
        console.log('Removing map instance...');
        try {
          mapInstance.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, [currentTeamId, onMapLoad]);

  return {
    isLoading: isLoadingRef.current
  };
};