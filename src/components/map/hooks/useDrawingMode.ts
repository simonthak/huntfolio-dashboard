import { useState } from 'react';
import { Feature } from 'geojson';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useMapDragMode } from './useMapDragMode';
import { useMapAreaMode } from './useMapAreaMode';
import { useMapPassMode } from './useMapPassMode';

interface UseDrawingModeProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  draw: React.MutableRefObject<MapboxDraw | null>;
  onFeatureCreate: (feature: Feature) => void;
}

export type DrawMode = 'drag' | 'area' | 'pass';

export const useDrawingMode = ({ map, draw, onFeatureCreate }: UseDrawingModeProps) => {
  const [drawMode, setDrawMode] = useState<DrawMode>('drag');
  const [showDrawInstructions, setShowDrawInstructions] = useState(false);

  const { enableDragMode } = useMapDragMode(map, draw);
  const { enableAreaMode } = useMapAreaMode(map, draw, onFeatureCreate);
  const { enablePassMode } = useMapPassMode(map, draw, onFeatureCreate);

  const cleanupExistingFeatures = () => {
    if (!draw.current) {
      console.error('Draw not initialized');
      return;
    }
    
    draw.current.deleteAll();
    console.log('Deleted existing features');
  };

  const removeClickHandlers = () => {
    if (!map.current) {
      console.error('Map not initialized');
      return;
    }
    
    map.current.off('click');
    console.log('Removed click handlers');
  };

  const handleToolClick = (mode: DrawMode) => {
    console.log('DrawingMode: Tool clicked:', mode);
    if (!draw.current || !map.current) {
      console.error('Draw or map not initialized');
      return;
    }

    // If clicking the same mode again, do nothing
    if (mode === drawMode) {
      console.log('Same mode selected, no changes needed');
      return;
    }

    setDrawMode(mode);
    
    // Cleanup existing features and handlers
    cleanupExistingFeatures();
    removeClickHandlers();

    // Enable the selected mode
    switch (mode) {
      case 'drag':
        enableDragMode();
        setShowDrawInstructions(false);
        break;
      case 'area':
        enableAreaMode();
        setShowDrawInstructions(true);
        break;
      case 'pass':
        enablePassMode();
        setShowDrawInstructions(false);
        break;
      default:
        console.error('Unknown mode:', mode);
    }
  };

  return {
    drawMode,
    showDrawInstructions,
    handleToolClick
  };
};