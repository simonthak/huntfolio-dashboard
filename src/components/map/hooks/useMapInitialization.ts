import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Feature } from 'geojson';
import { useDrawControls } from './useDrawControls';

interface UseMapInitializationProps {
  mapboxToken: string;
  onFeatureCreate: (feature: Feature) => void;
  areas?: { boundary: Feature }[];
}

export const useMapInitialization = ({ 
  mapboxToken, 
  onFeatureCreate,
  areas = []
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

    const initializeMap = () => {
      try {
        // Set token and create map only if it doesn't exist
        if (!map.current) {
          console.log('Initializing map with token:', mapboxToken);
          mapboxgl.accessToken = mapboxToken;
          
          // Default center coordinates for Sweden
          const defaultCenter = [15.4367, 62.1983]; // Center of Sweden
          const defaultZoom = 4.5; // Zoom level to show most of Sweden
          
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: defaultCenter,
            zoom: defaultZoom
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
            map.current.getCanvas().style.cursor = 'grab';

            // If there are areas, fit the map to them
            if (areas.length > 0) {
              console.log('Fitting map to areas:', areas.length);
              const bounds = new mapboxgl.LngLatBounds();
              
              areas.forEach(area => {
                if (area.boundary.geometry.type === 'Polygon') {
                  const coordinates = area.boundary.geometry.coordinates[0];
                  coordinates.forEach((coord: [number, number]) => {
                    bounds.extend(coord);
                  });
                }
              });
              
              // Add some padding around the areas
              map.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15
              });
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
    };

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
        map.current.remove();
        map.current = null;
      }

      // Reset all refs and state
      draw.current = null;
      setMapLoaded(false);
      initializationAttempted.current = false;
    };

    initializeMap();

    // Return cleanup function
    return cleanup;
  }, [mapboxToken, areas]); // Added areas to dependencies

  return { mapContainer, map, draw, mapLoaded };
};