import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';
import { initializeMapbox, createMapInstance } from '@/utils/mapUtils';

export const useMapInstance = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  currentTeamId: string | null,
  onMapLoad: (map: mapboxgl.Map, draw: any) => void
) => {
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
          if (map) map.remove();
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
      console.log('Starting cleanup of map instance...');
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

  return {
    isLoading: isLoadingRef.current
  };
};