import { useState, useCallback, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';

interface UseDrawingModeProps {
  map: MutableRefObject<mapboxgl.Map | null>;
  draw: MutableRefObject<MapboxDraw | null>;
  onFeatureCreate: (feature: Feature) => void;
}

export const useDrawingMode = ({ map, draw, onFeatureCreate }: UseDrawingModeProps) => {
  const [drawMode, setDrawMode] = useState<'drag' | 'area' | 'pass'>('drag');
  const [showDrawInstructions, setShowDrawInstructions] = useState(false);

  const handleToolClick = useCallback((mode: 'drag' | 'area' | 'pass') => {
    if (!draw.current || !map.current) return;

    setDrawMode(mode);
    console.log('Changing to mode:', mode);

    switch (mode) {
      case 'drag':
        setShowDrawInstructions(false);
        draw.current.changeMode('simple_select');
        map.current.getCanvas().style.cursor = 'grab';
        break;
      case 'area':
        setShowDrawInstructions(true);
        draw.current.changeMode('draw_polygon');
        map.current.getCanvas().style.cursor = 'crosshair';
        break;
      case 'pass':
        setShowDrawInstructions(false);
        draw.current.changeMode('draw_point');
        map.current.getCanvas().style.cursor = 'crosshair';
        break;
    }
  }, [map, draw]);

  return { 
    drawMode, 
    showDrawInstructions, 
    handleToolClick 
  };
};