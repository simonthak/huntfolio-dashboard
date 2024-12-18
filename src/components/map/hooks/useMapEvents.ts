import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature, Point, Polygon } from 'geojson';

interface UseMapEventsProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  draw: React.MutableRefObject<MapboxDraw | null>;
  onFeatureCreate: (feature: Feature) => void;
}

export const useMapEvents = ({ map, draw, onFeatureCreate }: UseMapEventsProps) => {
  useEffect(() => {
    if (!map.current || !draw.current) {
      console.log('Map or draw not initialized yet');
      return;
    }

    const setupDrawEvents = () => {
      if (!draw.current) {
        console.error('Draw instance not available');
        return;
      }

      // Wait for the map to be loaded before setting up draw events
      if (!map.current?.loaded()) {
        console.log('Map not loaded yet, waiting...');
        map.current?.once('load', setupDrawEvents);
        return;
      }

      console.log('Setting up draw events');
      draw.current.on('draw.create', (e: { features: Feature[] }) => {
        console.log('Draw create event triggered:', e);
        if (e.features?.[0]) {
          const feature = e.features[0];
          const geometry = feature.geometry as Point | Polygon;
          
          const simpleFeature: Feature<Point | Polygon> = {
            type: 'Feature',
            geometry: geometry,
            properties: { ...feature.properties }
          };
          
          onFeatureCreate(simpleFeature);
          draw.current?.deleteAll();
        }
      });
    };

    const setupCursorEvents = () => {
      if (!map.current?.loaded()) {
        console.log('Map not loaded yet for cursor events, waiting...');
        map.current?.once('load', setupCursorEvents);
        return;
      }

      console.log('Setting up cursor events');
      map.current?.on('mousedown', () => {
        if (map.current) {
          const canvas = map.current.getCanvas();
          canvas.style.cursor = 'grabbing';
        }
      });

      map.current?.on('mouseup', () => {
        if (map.current) {
          const canvas = map.current.getCanvas();
          canvas.style.cursor = 'grab';
        }
      });
    };

    // Initialize both event systems
    setupDrawEvents();
    setupCursorEvents();

    return () => {
      // Cleanup if needed
      if (map.current) {
        map.current.off('mousedown');
        map.current.off('mouseup');
      }
    };
  }, [map, draw, onFeatureCreate]);
};