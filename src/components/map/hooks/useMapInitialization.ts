import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Feature } from 'geojson';
import { useDrawControls } from './useDrawControls';

interface UseMapInitializationProps {
  mapboxToken: string;
  onFeatureCreate: (feature: Feature) => void;
}

export const useMapInitialization = ({ 
  mapboxToken, 
  onFeatureCreate 
}: UseMapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { draw, initializeDraw } = useDrawControls();
  const initialized = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || initialized.current) {
      console.log('Map initialization skipped:', 
        !mapContainer.current ? 'No container' : 
        !mapboxToken ? 'No token' : 
        'Already initialized'
      );
      return;
    }

    console.log('Initializing map with token:', mapboxToken.slice(0, 8) + '...');
    
    // Set initialization flag
    initialized.current = true;

    try {
      mapboxgl.accessToken = mapboxToken;

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [18.0686, 59.3293],
        zoom: 9
      });

      map.current = newMap;

      const setupMap = () => {
        if (!newMap || newMap._removed) return;
        
        console.log('Map loaded, adding controls');
        
        const drawInstance = initializeDraw();
        newMap.addControl(drawInstance);
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        if (newMap.getCanvas()) {
          newMap.getCanvas().style.cursor = 'grab';
        }

        newMap.on('draw.create', (e: { features: Feature[] }) => {
          console.log('Draw feature created:', e.features[0]);
          if (e.features?.[0]) {
            const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
            onFeatureCreate(serializedFeature);
            drawInstance.deleteAll();
          }
        });

        newMap.on('mousedown', () => {
          if (newMap.getCanvas()) {
            newMap.getCanvas().style.cursor = 'grabbing';
          }
        });

        newMap.on('mouseup', () => {
          if (newMap.getCanvas()) {
            newMap.getCanvas().style.cursor = 'grab';
          }
        });

        setMapLoaded(true);
        console.log('Map loaded successfully');
      };

      newMap.once('load', setupMap);

    } catch (error) {
      console.error('Error initializing map:', error);
      if (map.current && !map.current._removed) {
        map.current.remove();
      }
      map.current = null;
      draw.current = null;
      initialized.current = false;
      setMapLoaded(false);
    }

    return () => {
      console.log('Cleaning up map and WebGL context');
      if (map.current && !map.current._removed) {
        if (draw.current) {
          try {
            map.current.removeControl(draw.current);
          } catch (error) {
            console.warn('Error removing draw control:', error);
          }
        }
        map.current.remove();
      }
      map.current = null;
      draw.current = null;
      initialized.current = false;
      setMapLoaded(false);
    };
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};