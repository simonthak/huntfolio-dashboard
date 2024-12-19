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

export const useDrawingMode = ({ map, draw, onFeatureCreate }: UseDrawingModeProps) => {
  const [drawMode, setDrawMode] = useState<'drag' | 'area' | 'pass'>('drag');
  const [showDrawInstructions, setShowDrawInstructions] = useState(false);

  const { enableDragMode } = useMapDragMode(map, draw);
  const { enableAreaMode } = useMapAreaMode(map, draw);
  const { enablePassMode } = useMapPassMode(map, draw, onFeatureCreate);

  const handleToolClick = (mode: 'drag' | 'area' | 'pass') => {
    console.log('DrawingMode: Tool clicked:', mode);
    if (!draw.current || !map.current) {
      console.error('Draw or map not initialized');
      return;
    }

    // If clicking the same mode again, do nothing
    if (mode === drawMode) {
      return;
    }

    setDrawMode(mode);
    
    // Remove any existing drawn features
    draw.current.deleteAll();
    console.log('Deleted existing features');

    // Remove any existing click handlers
    if (map.current) {
      map.current.off('click');
    }

    if (mode === 'drag') {
      enableDragMode();
      setShowDrawInstructions(false);
    } else if (mode === 'area') {
      enableAreaMode(onFeatureCreate);
      setShowDrawInstructions(true);
    } else if (mode === 'pass') {
      enablePassMode();
      setShowDrawInstructions(false);
    }
  };

  return {
    drawMode,
    showDrawInstructions,
    handleToolClick
  };
};