import { useRef, useEffect, useState, useCallback } from 'react';
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
  const drawInstanceRef = useRef<any>(null);

  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      console.log('Cleaning up map instance');
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    drawInstanceRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up...');
      cleanupMap();
    };
  }, [cleanupMap]);

  useEffect(() => {
    if (!mapContainerRef.current || !currentTeamId) return;

    const initializeMap = async () => {
      try {
        console.log('Initializing map...');
        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !token) {
          console.error('Error getting Mapbox token:', error);
          toast.error('Kunde inte ladda kartan');
          setIsLoading(false);
          return;
        }

        cleanupMap();

        mapboxgl.accessToken = token;
        
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [16.5, 62.5],
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

        mapInstanceRef.current = map;
        drawInstanceRef.current = draw;

        map.once('load', () => {
          console.log('Map loaded successfully');
          setIsLoading(false);
          onMapLoad(map, draw);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Kunde inte ladda kartan');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [currentTeamId, onMapLoad, cleanupMap]);

  return {
    isLoading
  };
};