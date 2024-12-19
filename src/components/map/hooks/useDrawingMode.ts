import { useState } from 'react';
import { Feature } from 'geojson';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface UseDrawingModeProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  draw: React.MutableRefObject<MapboxDraw | null>;
  onFeatureCreate: (feature: Feature) => void;
}

export const useDrawingMode = ({ map, draw, onFeatureCreate }: UseDrawingModeProps) => {
  const [drawMode, setDrawMode] = useState<'drag' | 'area' | 'pass'>('drag');
  const [showDrawInstructions, setShowDrawInstructions] = useState(false);

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
      handleDragMode();
    } else if (mode === 'area') {
      handleAreaMode();
    } else if (mode === 'pass') {
      handlePassMode();
    }
  };

  const handleDragMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling drag mode');
    draw.current.changeMode('simple_select');
    map.current.getCanvas().style.cursor = 'grab';
    setShowDrawInstructions(false);
  };

  const handleAreaMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling polygon draw mode');
    draw.current.changeMode('draw_polygon');
    map.current.getCanvas().style.cursor = 'crosshair';
    setShowDrawInstructions(true);
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    console.log('Map clicked for point placement:', e.lngLat);
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat]
      },
      properties: {}
    };
    
    onFeatureCreate(JSON.parse(JSON.stringify(feature)));
    
    // Clean up and reset cursor
    if (map.current) {
      map.current.off('click', handleMapClick);
      map.current.getCanvas().style.cursor = 'grab';
    }
    setDrawMode('drag');
  };

  const handlePassMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling point placement mode');
    draw.current.changeMode('simple_select');
    map.current.getCanvas().style.cursor = 'crosshair';
    
    // Remove any existing click handlers before adding a new one
    map.current.off('click', handleMapClick);
    map.current.on('click', handleMapClick);
  };

  return {
    drawMode,
    showDrawInstructions,
    handleToolClick
  };
};