import { MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

export const useMapDragMode = (
  map: MutableRefObject<mapboxgl.Map | null>,
  draw: MutableRefObject<MapboxDraw | null>
) => {
  const enableDragMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling drag mode');
    draw.current.changeMode('simple_select');
    map.current.getCanvas().style.cursor = 'grab';
  };

  return { enableDragMode };
};