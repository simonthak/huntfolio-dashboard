import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMapInstance = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  currentTeamId: string | null,
  onMapLoad: (map: mapboxgl.Map, draw: any) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !currentTeamId) return;

    let mapInstance: mapboxgl.Map | null = null;
    
    const initializeMap = async () => {
      try {
        console.log('Initializing map...');
        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !token) {
          console.error('Error getting Mapbox token:', error);
          if (isMountedRef.current) {
            toast.error('Kunde inte ladda kartan');
            setIsLoading(false);
          }
          return;
        }

        if (!isMountedRef.current || !mapContainerRef.current) {
          console.log('Component unmounted during initialization');
          return;
        }

        mapboxgl.accessToken = token;
        
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [16.5, 62.5], // Center on Sweden
          zoom: 4.5
        });

        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(draw);

        mapInstance = map;
        mapInstanceRef.current = map;

        map.once('load', () => {
          console.log('Map loaded, calling onMapLoad callback');
          if (isMountedRef.current) {
            setIsLoading(false);
            onMapLoad(map, draw);
          }
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMountedRef.current) {
          toast.error('Kunde inte ladda kartan');
          setIsLoading(false);
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
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, [currentTeamId, onMapLoad]);

  return {
    isLoading
  };
};