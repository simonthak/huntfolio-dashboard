import { MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';

export const useDrawingMode = (
  map: MutableRefObject<mapboxgl.Map | null>,
  draw: MutableRefObject<MapboxDraw | null>,
  onFeatureCreate: (feature: Feature) => void
) => {
  const enableDrawingMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling polygon drawing mode');
    draw.current.changeMode('draw_polygon');
    map.current.getCanvas().style.cursor = 'crosshair';
  };

  const disableDrawingMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Disabling drawing mode');
    draw.current.changeMode('simple_select');
    map.current.getCanvas().style.cursor = 'grab';
  };

  return { enableDrawingMode, disableDrawingMode };
};