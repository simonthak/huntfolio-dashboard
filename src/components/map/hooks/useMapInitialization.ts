import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';

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
  const draw = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || initialized.current) {
      console.log('Map initialization skipped:', !mapContainer.current ? 'No container' : !mapboxToken ? 'No token' : 'Already initialized');
      return;
    }

    initialized.current = true;
    console.log('Initializing map with token:', mapboxToken.slice(0, 8) + '...');
    
    try {
      mapboxgl.accessToken = mapboxToken;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [18.0686, 59.3293],
        zoom: 9
      });

      // Initialize draw control before adding it to the map
      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select', // Start in selection mode
        styles: [
          {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'paint': {
              'fill-color': '#13B67F',
              'fill-outline-color': '#13B67F',
              'fill-opacity': 0.1
            }
          },
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'paint': {
              'fill-color': '#13B67F',
              'fill-outline-color': '#13B67F',
              'fill-opacity': 0.2
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#13B67F',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#13B67F',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            'paint': {
              'circle-radius': 5,
              'circle-color': '#fff',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#13B67F'
            }
          },
          {
            'id': 'gl-draw-polygon-and-line-vertex-active',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            'paint': {
              'circle-radius': 6,
              'circle-color': '#fff',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#13B67F'
            }
          }
        ]
      });

      draw.current = drawInstance;
      map.current = mapInstance;

      mapInstance.on('load', () => {
        console.log('Map loaded, adding controls');
        
        // Add draw control first
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add draw.create event listener
        mapInstance.on('draw.create', (e: { features: Feature[] }) => {
          console.log('Draw feature created:', e.features[0]);
          if (e.features && e.features[0]) {
            const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
            onFeatureCreate(serializedFeature);
            // Clear the drawing after creation
            drawInstance.deleteAll();
          }
        });

        // Add draw mode change listener for debugging
        mapInstance.on('draw.modechange', (e: any) => {
          console.log('Draw mode changed:', e.mode);
        });
        
        setMapLoaded(true);
        console.log('Map loaded successfully');
      });

      return () => {
        console.log('Cleaning up map');
        if (map.current) {
          try {
            if (draw.current) {
              map.current.removeControl(draw.current);
              draw.current = null;
            }

            map.current.remove();
            map.current = null;
            setMapLoaded(false);
            initialized.current = false;
          } catch (error) {
            console.error('Error cleaning up map:', error);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapLoaded(false);
      initialized.current = false;
    }
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};