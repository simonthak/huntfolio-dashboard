import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Feature, Geometry, Point, Polygon } from 'geojson';
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
    if (initializationAttempted.current || !mapContainer.current || !mapboxToken) {
      return;
    }

    console.log('Starting map initialization...');
    initializationAttempted.current = true;

    const initializeMap = () => {
      try {
        if (!map.current) {
          console.log('Initializing map with token:', mapboxToken);
          mapboxgl.accessToken = mapboxToken;
          
          const defaultCenter: [number, number] = [15.4367, 62.1983];
          const defaultZoom = 4.5;
          
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: defaultCenter,
            zoom: defaultZoom
          });

          map.current.once('load', () => {
            if (!map.current) return;
            
            console.log('Map loaded, initializing controls...');
            
            const drawInstance = initializeDraw();
            
            if (!drawInstance) {
              console.error('Failed to initialize draw control');
              return;
            }

            draw.current = drawInstance;
            map.current.addControl(drawInstance);
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.getCanvas().style.cursor = 'grab';

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
              
              map.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15
              });
            }

            if (drawInstance && typeof drawInstance.on === 'function') {
              try {
                drawInstance.on('draw.create', (e: { features: Feature[] }) => {
                  console.log('Draw create event triggered:', e);
                  if (e.features?.[0]) {
                    const feature = e.features[0];
                    const geometry = feature.geometry as Point | Polygon;
                    
                    // Create a new feature with properly typed geometry
                    const simpleFeature: Feature = {
                      type: 'Feature',
                      geometry: {
                        type: geometry.type,
                        coordinates: geometry.coordinates
                      },
                      properties: { ...feature.properties }
                    };
                    
                    onFeatureCreate(simpleFeature);
                    drawInstance.deleteAll();
                  }
                });
                console.log('Draw event listener set up successfully');
              } catch (error) {
                console.error('Error setting up draw event listener:', error);
              }
            } else {
              console.error('Draw instance or .on method not available:', drawInstance);
            }

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
        if (draw.current) {
          try {
            map.current.removeControl(draw.current);
          } catch (error) {
            console.warn('Error removing draw control:', error);
          }
        }

        map.current.remove();
        map.current = null;
      }

      draw.current = null;
      setMapLoaded(false);
      initializationAttempted.current = false;
    };

    initializeMap();
    return cleanup;
  }, [mapboxToken, areas]);

  return { mapContainer, map, draw, mapLoaded };
};
