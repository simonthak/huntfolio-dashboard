import { useRef } from 'react';
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

  return { mapContainer, map, draw, mapLoaded };
};