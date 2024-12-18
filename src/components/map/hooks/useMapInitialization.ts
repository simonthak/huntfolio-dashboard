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

    console.log('Initializing map with token:', mapboxToken.slice(0, 8) + '...');
    mapboxgl.accessToken = mapboxToken;

    try {
      const initializeMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [18.0686, 59.3293], // Stockholm coordinates
        zoom: 9
      });

      map.current = initializeMap;

      // Initialize draw control
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select'
      });

      initializeMap.addControl(draw.current, 'top-left');
      initializeMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      initializeMap.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
      });

      // Handle draw events
      initializeMap.on('draw.create', (e: { features: Feature[] }) => {
        console.log('Feature created:', e.features[0]);
        onFeatureCreate(e.features[0]);
      });

      return () => {
        console.log('Cleaning up map');
        initializeMap.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};