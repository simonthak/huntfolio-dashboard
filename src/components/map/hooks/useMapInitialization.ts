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
  const initializationAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationAttempted.current || !mapContainer.current || !mapboxToken) {
      return;
    }

    console.log('Starting map initialization...');
    initializationAttempted.current = true;

    try {
      // Set token and create map
      mapboxgl.accessToken = mapboxToken;
      
      if (!map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [18.0686, 59.3293],
          zoom: 9
        });

        // Setup map only once when it's loaded
        map.current.once('load', () => {
          if (!map.current) return;
          
          console.log('Map loaded, initializing controls...');
          
          // Initialize draw control
          draw.current = initializeDraw();
          
          // Add controls
          map.current.addControl(draw.current);
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Set default cursor
          const canvas = map.current.getCanvas();
          if (canvas) {
            canvas.style.cursor = 'grab';
          }

          // Setup draw event listener
          map.current.on('draw.create', (e: { features: Feature[] }) => {
            if (e.features?.[0]) {
              // Clone the feature to ensure it's serializable
              const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
              onFeatureCreate(serializedFeature);
              draw.current?.deleteAll();
            }
          });

          // Setup cursor event listeners
          map.current.on('mousedown', () => {
            if (map.current?.getCanvas()) {
              map.current.getCanvas().style.cursor = 'grabbing';
            }
          });

          map.current.on('mouseup', () => {
            if (map.current?.getCanvas()) {
              map.current.getCanvas().style.cursor = 'grab';
            }
          });

          setMapLoaded(true);
          console.log('Map initialization complete');
        });
      }
    } catch (error) {
      console.error('Error during map initialization:', error);
      cleanup();
    }

    // Cleanup function
    const cleanup = () => {
      console.log('Running map cleanup...');
      
      if (map.current) {
        // Remove controls first
        if (draw.current) {
          try {
            map.current.removeControl(draw.current);
          } catch (error) {
            console.warn('Error removing draw control:', error);
          }
        }

        // Remove map instance
        if (!map.current._removed) {
          map.current.remove();
        }
      }

      // Reset all refs and state
      map.current = null;
      draw.current = null;
      setMapLoaded(false);
      initializationAttempted.current = false;
    };

    // Return cleanup function
    return cleanup;
  }, [mapboxToken]); // Only re-run if token changes

  return { mapContainer, map, draw, mapLoaded };
};