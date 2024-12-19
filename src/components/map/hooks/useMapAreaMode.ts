import { MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

export const useMapAreaMode = (
  map: MutableRefObject<mapboxgl.Map | null>,
  draw: MutableRefObject<MapboxDraw | null>
) => {
  const enableAreaMode = (onFeatureCreate?: (feature: any) => void) => {
    if (!draw.current || !map.current) return;

    console.log('Enabling polygon draw mode');
    draw.current.changeMode('draw_polygon');
    map.current.getCanvas().style.cursor = 'crosshair';
  };

  return { enableAreaMode };
};