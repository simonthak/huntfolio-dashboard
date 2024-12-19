import { useRef } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useMapStyles } from './useMapStyles';

export const useDrawControls = () => {
  const styles = useMapStyles();
  const draw = useRef<MapboxDraw | null>(null);

  const initializeDraw = () => {
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: 'simple_select',
      styles
    });

    return draw.current;
  };

  return { draw, initializeDraw };
};