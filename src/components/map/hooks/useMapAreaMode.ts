import { MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';

export const useMapAreaMode = (
  map: MutableRefObject<mapboxgl.Map | null>,
  draw: MutableRefObject<MapboxDraw | null>
) => {
  const enableAreaMode = () => {
    if (!draw.current || !map.current) {
      console.log('Draw or map not initialized');
      return;
    }

    console.log('Enabling polygon draw mode');
    draw.current.changeMode('draw_polygon');
    map.current.getCanvas().style.cursor = 'crosshair';
  };

  return { enableAreaMode };
};