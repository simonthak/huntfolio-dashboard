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
    if (!map.current || !draw.current) return;

    const setupDrawEvents = () => {
      if (!draw.current || typeof draw.current.on !== 'function') {
        console.error('Draw instance or .on method not available');
        return;
      }

      draw.current.on('draw.create', (e: { features: Feature[] }) => {
        console.log('Draw create event triggered:', e);
        if (e.features?.[0]) {
          const feature = e.features[0];
          const geometry = feature.geometry as Point | Polygon;
          
          // Create a new feature with properly typed geometry
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

    setupDrawEvents();
    setupCursorEvents();
  }, [map, draw, onFeatureCreate]);
};