import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MapState {
  lat: number;
  lng: number;
  zoom: number;
  timestamp: number;
}

const MAP_STATE_CHANGE = 'mapStateChange';
const createMapStateEvent = (state: MapState) => new CustomEvent(MAP_STATE_CHANGE, { detail: state });

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

        // Stop event propagation for map container
        const stopPropagation = (e: Event) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        };

        // Stop all events from bubbling up
        if (mapContainerRef.current) {
          ['wheel', 'mousedown', 'mouseup', 'mousemove', 'click', 'scroll'].forEach(eventType => {
            mapContainerRef.current?.addEventListener(eventType, stopPropagation, { capture: true });
          });
        }

        // Debounce function to limit event frequency
        let timeoutId: number;
        const debounceMapEvent = (callback: () => void) => {
          cancelAnimationFrame(timeoutId);
          timeoutId = requestAnimationFrame(callback);
        };

        // Create safe map state
        const getMapState = (): MapState => ({
          lat: +map.getCenter().lat.toFixed(6),
          lng: +map.getCenter().lng.toFixed(6),
          zoom: +map.getZoom().toFixed(2),
          timestamp: Date.now()
        });

        // Handle map events with custom events
        const handleMapEvent = () => {
          debounceMapEvent(() => {
            const state = getMapState();
            document.dispatchEvent(createMapStateEvent(state));
          });
        };

        // Handle map events locally with propagation stopped
        ['wheel', 'drag', 'move'].forEach(eventType => {
          map.on(eventType, (e) => {
            if (e.originalEvent) {
              e.originalEvent.stopPropagation();
              e.originalEvent.stopImmediatePropagation();
            }
            handleMapEvent();
          });
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

    return () => {
      if (mapContainerRef.current) {
        ['wheel', 'mousedown', 'mouseup', 'mousemove', 'click', 'scroll'].forEach(eventType => {
          mapContainerRef.current?.removeEventListener(eventType, stopPropagation, { capture: true });
        });
      }
      cleanupMap();
    };
  }, [currentTeamId, onMapLoad, cleanupMap]);

  return {
    isLoading
  };
};