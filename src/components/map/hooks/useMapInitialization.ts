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
  const eventHandlers = useRef<{ [key: string]: any }>({});

  // Cleanup function to ensure proper WebGL context cleanup
  const cleanupMap = () => {
    console.log('Cleaning up map and WebGL context');
    
    // First remove the draw control if it exists
    if (map.current && draw.current) {
      try {
        map.current.removeControl(draw.current);
      } catch (error) {
        console.warn('Error removing draw control:', error);
      }
    }

    // Then remove event listeners if the map still exists
    if (map.current && !map.current._removed) {
      try {
        Object.entries(eventHandlers.current).forEach(([key, handler]) => {
          if (handler) {
            const eventName = key.toLowerCase().replace(/^handle/, '');
            map.current?.off(eventName, handler);
          }
        });
      } catch (error) {
        console.warn('Error removing event listeners:', error);
      }

      // Finally remove the map
      try {
        map.current.remove();
      } catch (error) {
        console.warn('Error removing map:', error);
      }
    }
    
    // Reset all refs and state
    map.current = null;
    draw.current = null;
    eventHandlers.current = {};
    setMapLoaded(false);
    initialized.current = false;
  };

  useEffect(() => {
    // Clean up any existing map instance first
    cleanupMap();

    if (!mapContainer.current || !mapboxToken || initialized.current) {
      console.log('Map initialization skipped:', 
        !mapContainer.current ? 'No container' : 
        !mapboxToken ? 'No token' : 
        'Already initialized'
      );
      return;
    }

    console.log('Initializing map with token:', mapboxToken.slice(0, 8) + '...');
    initialized.current = true;
    
    try {
      mapboxgl.accessToken = mapboxToken;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [18.0686, 59.3293],
        zoom: 9
      });

      const drawInstance = initializeDraw();
      map.current = mapInstance;

      // Store event handlers in ref to properly remove them later
      eventHandlers.current.mouseDown = () => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grabbing';
        }
      };

      eventHandlers.current.mouseUp = () => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }
      };

      eventHandlers.current.drawCreate = (e: { features: Feature[] }) => {
        console.log('Draw feature created:', e.features[0]);
        if (e.features && e.features[0]) {
          const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
          onFeatureCreate(serializedFeature);
          drawInstance.deleteAll();
        }
      };

      eventHandlers.current.drawModeChange = (e: any) => {
        console.log('Draw mode changed:', e.mode);
      };

      const setupMapControls = () => {
        if (!mapInstance || mapInstance._removed) return;
        
        console.log('Map loaded, adding controls');
        
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }

        // Add event listeners
        Object.entries(eventHandlers.current).forEach(([key, handler]) => {
          const eventName = key.toLowerCase().replace(/^handle/, '');
          mapInstance.on(eventName, handler);
        });
        
        setMapLoaded(true);
        console.log('Map loaded successfully');
      };

      mapInstance.once('load', setupMapControls);

      return () => {
        cleanupMap();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      cleanupMap();
    }
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};