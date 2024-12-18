import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDrawControls } from './useDrawControls';

interface UseMapControlsProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
}

export const useMapControls = ({ map, mapLoaded }: UseMapControlsProps) => {
  const { draw, initializeDraw } = useDrawControls();

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('Initializing map controls...');
    const drawInstance = initializeDraw();
    
    if (!drawInstance) {
      console.error('Failed to initialize draw control');
      return;
    }

    draw.current = drawInstance;
    map.current.addControl(drawInstance);
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.getCanvas().style.cursor = 'grab';

    return () => {
      if (map.current && draw.current) {
        try {
          map.current.removeControl(draw.current);
        } catch (error) {
          console.warn('Error removing draw control:', error);
        }
      }
    };
  }, [map, mapLoaded]);

  return { draw };
};