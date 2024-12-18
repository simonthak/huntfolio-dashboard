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
  const eventHandlers = useRef<{
    handleMouseDown?: (e: mapboxgl.MapMouseEvent) => void;
    handleMouseUp?: (e: mapboxgl.MapMouseEvent) => void;
    handleDrawCreate?: (e: { features: Feature[] }) => void;
    handleDrawModeChange?: (e: any) => void;
  }>({});

  const cleanupMap = () => {
    console.log('Cleaning up map and WebGL context');
    
    if (!map.current) return;

    try {
      // First remove all event listeners
      const currentMap = map.current;
      Object.entries(eventHandlers.current).forEach(([key, handler]) => {
        if (handler) {
          const eventName = key.replace('handle', '').toLowerCase();
          currentMap.off(eventName, handler);
        }
      });

      // Then remove the draw control if it exists and map is still valid
      if (draw.current && currentMap && !currentMap._removed) {
        try {
          currentMap.removeControl(draw.current);
        } catch (error) {
          console.warn('Error removing draw control:', error);
        }
      }

      // Finally remove the map if it hasn't been removed yet
      if (!currentMap._removed) {
        currentMap.remove();
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
    
    // Reset all refs and state
    map.current = null;
    draw.current = null;
    eventHandlers.current = {};
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
    
    // Clean up any existing map instance first
    cleanupMap();
    
    // Clear the container before initialization
    if (mapContainer.current) {
      mapContainer.current.innerHTML = '';
    }
    
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

      // Setup event handlers
      eventHandlers.current.handleMouseDown = () => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grabbing';
        }
      };

      eventHandlers.current.handleMouseUp = () => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }
      };

      eventHandlers.current.handleDrawCreate = (e: { features: Feature[] }) => {
        console.log('Draw feature created:', e.features[0]);
        if (e.features && e.features[0]) {
          const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
          onFeatureCreate(serializedFeature);
          drawInstance.deleteAll();
        }
      };

      eventHandlers.current.handleDrawModeChange = (e: any) => {
        console.log('Draw mode changed:', e.mode);
      };

      const setupMapControls = () => {
        if (!mapInstance || mapInstance._removed) return;
        
        console.log('Map loaded, adding controls');
        
        // Add controls and event listeners only when style is fully loaded
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }

        // Add event listeners
        mapInstance.on('mousedown', eventHandlers.current.handleMouseDown!);
        mapInstance.on('mouseup', eventHandlers.current.handleMouseUp!);
        mapInstance.on('draw.create', eventHandlers.current.handleDrawCreate!);
        mapInstance.on('draw.modechange', eventHandlers.current.handleDrawModeChange!);
        
        setMapLoaded(true);
        console.log('Map loaded successfully');
      };

      // Wait for both map and style to be loaded
      mapInstance.once('load', () => {
        if (mapInstance.isStyleLoaded()) {
          setupMapControls();
        } else {
          mapInstance.once('style.load', setupMapControls);
        }
      });

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