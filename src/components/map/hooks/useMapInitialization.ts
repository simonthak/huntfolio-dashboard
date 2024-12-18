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

  const cleanupMap = () => {
    if (!map.current) return;
    console.log('Cleaning up map and WebGL context');

    try {
      // First remove the draw control if it exists
      if (draw.current && map.current && !map.current._removed) {
        try {
          map.current.removeControl(draw.current);
        } catch (error) {
          console.warn('Error removing draw control:', error);
        }
      }

      // Then remove the map if it hasn't been removed yet
      if (!map.current._removed) {
        map.current.remove();
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
    
    // Reset all refs and state
    map.current = null;
    draw.current = null;
    setMapLoaded(false);
  };

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
    
    // Set initialization flag first to prevent multiple initializations
    initialized.current = true;
    
    try {
      mapboxgl.accessToken = mapboxToken;

      // Create new map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [18.0686, 59.3293],
        zoom: 9
      });

      // Store map reference
      map.current = mapInstance;

      // Wait for both map and style to be loaded before adding controls
      mapInstance.once('load', () => {
        if (!mapInstance || mapInstance._removed) return;
        
        console.log('Map loaded, adding controls');
        
        // Initialize draw control
        const drawInstance = initializeDraw();
        
        // Add controls
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Set cursor style
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }

        // Add draw event listeners
        mapInstance.on('draw.create', (e: { features: Feature[] }) => {
          console.log('Draw feature created:', e.features[0]);
          if (e.features && e.features[0]) {
            const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
            onFeatureCreate(serializedFeature);
            drawInstance.deleteAll();
          }
        });

        // Add mouse event listeners
        mapInstance.on('mousedown', () => {
          if (mapInstance.getCanvas()) {
            mapInstance.getCanvas().style.cursor = 'grabbing';
          }
        });

        mapInstance.on('mouseup', () => {
          if (mapInstance.getCanvas()) {
            mapInstance.getCanvas().style.cursor = 'grab';
          }
        });

        setMapLoaded(true);
        console.log('Map loaded successfully');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      cleanupMap();
      initialized.current = false;
    }

    // Cleanup function
    return () => {
      cleanupMap();
      initialized.current = false;
    };
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};