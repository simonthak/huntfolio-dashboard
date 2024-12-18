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

  // Cleanup function to ensure proper WebGL context cleanup
  const cleanupMap = () => {
    console.log('Cleaning up map and WebGL context');
    
    if (!map.current || map.current._removed) return;

    try {
      // First remove the draw control
      if (draw.current) {
        map.current.removeControl(draw.current);
      }

      // Remove all event listeners with their specific handlers
      if (eventHandlers.current.handleMouseDown) {
        map.current.off('mousedown', eventHandlers.current.handleMouseDown);
      }
      if (eventHandlers.current.handleMouseUp) {
        map.current.off('mouseup', eventHandlers.current.handleMouseUp);
      }
      if (eventHandlers.current.handleDrawCreate) {
        map.current.off('draw.create', eventHandlers.current.handleDrawCreate);
      }
      if (eventHandlers.current.handleDrawModeChange) {
        map.current.off('draw.modechange', eventHandlers.current.handleDrawModeChange);
      }

      // Finally remove the map
      map.current.remove();
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
    
    // Reset all refs and state
    map.current = null;
    draw.current = null;
    eventHandlers.current = {};
    setMapLoaded(false);
    initialized.current = false;
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

      // Setup event handlers and store them in ref for cleanup
      eventHandlers.current.handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grabbing';
        }
      };

      eventHandlers.current.handleMouseUp = (e: mapboxgl.MapMouseEvent) => {
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }
      };

      eventHandlers.current.handleDrawCreate = (e: { features: Feature[] }) => {
        console.log('Draw feature created:', e.features[0]);
        if (e.features && e.features[0]) {
          // Create a clean copy of the feature without circular references
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
        
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }

        // Add event listeners with stored handlers
        mapInstance.on('mousedown', eventHandlers.current.handleMouseDown!);
        mapInstance.on('mouseup', eventHandlers.current.handleMouseUp!);
        mapInstance.on('draw.create', eventHandlers.current.handleDrawCreate!);
        mapInstance.on('draw.modechange', eventHandlers.current.handleDrawModeChange!);
        
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