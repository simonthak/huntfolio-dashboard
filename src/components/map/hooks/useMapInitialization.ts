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

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.log('Map initialization skipped:', !mapContainer.current ? 'No container' : 'No token');
      return;
    }

    if (map.current) {
      console.log('Map already initialized');
      return;
    }

    console.log('Initializing map with token:', mapboxToken.slice(0, 8) + '...');
    
    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;

      // Create a new map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [18.0686, 59.3293], // Stockholm coordinates
        zoom: 9
      });

      // Store the map instance in the ref
      map.current = mapInstance;

      // Initialize draw control with specific options
      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select',
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
          }
        ]
      });

      // Store the draw instance in the ref
      draw.current = drawInstance;

      // Wait for map to load before adding controls
      mapInstance.on('load', () => {
        console.log('Map loaded, adding controls');
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        setMapLoaded(true);
        console.log('Map loaded successfully');
      });

      // Set up draw.create event handler
      mapInstance.on('draw.create', (e: { features: Feature[] }) => {
        console.log('Draw feature created:', e.features[0]);
        if (e.features && e.features[0]) {
          const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
          onFeatureCreate(serializedFeature);
        }
      });

      // Return cleanup function
      return () => {
        console.log('Cleaning up map');
        if (map.current) {
          // Remove all controls first
          if (draw.current) {
            try {
              map.current.removeControl(draw.current);
              draw.current = null;
            } catch (error) {
              console.error('Error removing draw control:', error);
            }
          }

          // Remove all event listeners
          map.current.off('draw.create');
          map.current.off('load');

          // Finally remove the map
          try {
            map.current.remove();
            map.current = null;
            setMapLoaded(false);
          } catch (error) {
            console.error('Error removing map:', error);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapLoaded(false);
    }
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};