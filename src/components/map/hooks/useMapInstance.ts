import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface UseMapInstanceProps {
  mapboxToken: string;
  container: React.RefObject<HTMLDivElement>;
}

export const useMapInstance = ({ mapboxToken, container }: UseMapInstanceProps) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    if (initializationAttempted.current || !container.current || !mapboxToken) {
      return;
    }

    console.log('Starting map initialization...');
    initializationAttempted.current = true;

    const cleanupMap = () => {
      console.log('Running map cleanup...');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
      initializationAttempted.current = false;
    };

    try {
      if (!map.current) {
        console.log('Initializing map with token:', mapboxToken);
        mapboxgl.accessToken = mapboxToken;
        
        const defaultCenter: [number, number] = [15.4367, 62.1983];
        const defaultZoom = 4.5;
        
        map.current = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: defaultCenter,
          zoom: defaultZoom,
          attributionControl: false,
          boxZoom: false,
          doubleClickZoom: false,
          dragRotate: false,
          touchZoomRotate: false
        });

        map.current.once('load', () => {
          console.log('Map loaded');
          setMapLoaded(true);
        });
      }
    } catch (error) {
      console.error('Error during map initialization:', error);
      cleanupMap();
    }

    return cleanupMap;
  }, [mapboxToken, container]);

  return { map, mapLoaded };
};