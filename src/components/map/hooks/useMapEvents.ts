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
      
      const handleDrawCreate = (e: { features: Feature[] }) => {
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
      };

      map.current.on('draw.create', handleDrawCreate);
    };

    const setupCursorEvents = () => {
      if (!map.current?.loaded()) {
        console.log('Map not loaded yet for cursor events, waiting...');
        map.current?.once('load', setupCursorEvents);
        return;
      }

      console.log('Setting up cursor events');
      
      const handleMouseDown = () => {
        if (map.current) {
          const canvas = map.current.getCanvas();
          canvas.style.cursor = 'grabbing';
        }
      };

      const handleMouseUp = () => {
        if (map.current) {
          const canvas = map.current.getCanvas();
          canvas.style.cursor = 'grab';
        }
      };

      map.current.on('mousedown', handleMouseDown);
      map.current.on('mouseup', handleMouseUp);
    };

    // Initialize both event systems
    setupDrawEvents();
    setupCursorEvents();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.off('draw.create');
        map.current.off('mousedown', handleMouseDown);
        map.current.off('mouseup', handleMouseUp);
      }
    };
  }, [map, draw, onFeatureCreate]);
};