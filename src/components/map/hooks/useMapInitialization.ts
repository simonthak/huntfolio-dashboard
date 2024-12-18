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

  // Cleanup function to ensure proper WebGL context cleanup
  const cleanupMap = () => {
    console.log('Cleaning up map and WebGL context');
    if (map.current && !map.current._removed) {
      // Remove the map instance which will clean up the WebGL context
      map.current.remove();
      map.current = null;
    }
    
    if (draw.current) {
      draw.current = null;
    }
    
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

      const handleMouseDown = () => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grabbing';
        }
      };

      const handleMouseUp = () => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }
      };

      const handleDrawCreate = (e: { features: Feature[] }) => {
        console.log('Draw feature created:', e.features[0]);
        if (e.features && e.features[0]) {
          const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
          onFeatureCreate(serializedFeature);
          drawInstance.deleteAll();
        }
      };

      const handleDrawModeChange = (e: any) => {
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

        mapInstance.on('mousedown', handleMouseDown);
        mapInstance.on('mouseup', handleMouseUp);
        mapInstance.on('draw.create', handleDrawCreate);
        mapInstance.on('draw.modechange', handleDrawModeChange);
        
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