import { useRef, useEffect } from 'react';
import { Feature } from 'geojson';
import { useMapInstance } from './useMapInstance';
import { useMapControls } from './useMapControls';
import { useMapEvents } from './useMapEvents';
import { useMapBounds } from './useMapBounds';

interface UseMapInitializationProps {
  mapboxToken: string;
  onFeatureCreate: (feature: Feature) => void;
  areas?: { boundary: Feature }[];
}

export const useMapInitialization = ({ 
  mapboxToken, 
  onFeatureCreate,
  areas = []
}: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  const { map, mapLoaded } = useMapInstance({ 
    mapboxToken, 
    container: mapContainer 
  });
  
  const { draw } = useMapControls({ map, mapLoaded });
  
  useMapEvents({ map, draw, onFeatureCreate });
  
  useMapBounds({ map, mapLoaded, areas });

  // Set initial mode after map and draw are initialized
  useEffect(() => {
    if (map.current && draw.current && mapLoaded) {
      console.log('Setting initial drag mode');
      draw.current.changeMode('simple_select');
      if (map.current.getCanvas()) {
        map.current.getCanvas().style.cursor = 'grab';
      }
    }
  }, [mapLoaded]);

  return { mapContainer, map, draw, mapLoaded };
};