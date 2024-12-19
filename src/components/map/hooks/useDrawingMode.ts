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
  const [drawMode, setDrawMode] = useState<'area' | 'pass' | null>(null);
  const [showDrawInstructions, setShowDrawInstructions] = useState(false);

  const handleToolClick = (mode: 'area' | 'pass') => {
    console.log('DrawingMode: Tool clicked:', mode);
    if (!draw.current || !map.current) {
      console.error('Draw or map not initialized');
      return;
    }

    // If clicking the same mode again, disable it
    if (mode === drawMode) {
      setDrawMode(null);
      draw.current.changeMode('simple_select');
      map.current.getCanvas().style.cursor = 'grab';
      if (map.current.listens('click', handleMapClick)) {
        map.current.off('click', handleMapClick);
      }
      return;
    }

    setDrawMode(mode);
    
    // Remove any existing drawn features
    draw.current.deleteAll();
    console.log('Deleted existing features');

    if (mode === 'area') {
      handleAreaMode();
    } else if (mode === 'pass') {
      handlePassMode();
    }
  };

  const handleAreaMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling polygon draw mode');
    draw.current.changeMode('draw_polygon');
    map.current.getCanvas().style.cursor = 'crosshair';
    setShowDrawInstructions(true);
    
    const onDrawCreate = () => {
      setShowDrawInstructions(false);
      if (map.current) {
        map.current.getCanvas().style.cursor = 'grab';
      }
    };
    
    map.current.once('draw.create', onDrawCreate);
    console.log('Draw mode changed to draw_polygon');
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
    setDrawMode(null);
    
    // Clean up and reset cursor
    if (map.current) {
      map.current.off('click', handleMapClick);
      map.current.getCanvas().style.cursor = 'grab';
    }
  };

  const handlePassMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling point placement mode');
    draw.current.changeMode('simple_select');
    map.current.getCanvas().style.cursor = 'crosshair';
    
    // Remove any existing click handlers
    if (map.current.listens('click', handleMapClick)) {
      map.current.off('click', handleMapClick);
    }
    
    map.current.once('click', handleMapClick);
  };

  return {
    drawMode,
    showDrawInstructions,
    handleToolClick
  };
};