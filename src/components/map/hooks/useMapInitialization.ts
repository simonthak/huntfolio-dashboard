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
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) {
      console.log('Map initialization skipped:', 
        !mapContainer.current ? 'No container' : 
        !mapboxToken ? 'No token' : 
        'Map already exists'
      );
      return;
    }

    console.log('Initializing map with token:', mapboxToken.slice(0, 8) + '...');
    
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
        console.log('Map loaded, adding controls');
        
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Set initial cursor style to grab
        if (mapInstance.getCanvas()) {
          mapInstance.getCanvas().style.cursor = 'grab';
        }

        // Add cursor style handlers for drag interactions
        mapInstance.on('mousedown', handleMouseDown);
        mapInstance.on('mouseup', handleMouseUp);
        mapInstance.on('draw.create', handleDrawCreate);
        mapInstance.on('draw.modechange', handleDrawModeChange);
        
        setMapLoaded(true);
        console.log('Map loaded successfully');
      };

      mapInstance.once('load', setupMapControls);

      // Store cleanup function
      cleanupRef.current = () => {
        console.log('Cleaning up map');
        try {
          // Only attempt to remove listeners if the map instance still exists
          if (mapInstance && !mapInstance._removed) {
            mapInstance.off('mousedown', handleMouseDown);
            mapInstance.off('mouseup', handleMouseUp);
            mapInstance.off('draw.create', handleDrawCreate);
            mapInstance.off('draw.modechange', handleDrawModeChange);
            
            // Remove controls in reverse order
            if (draw.current) {
              mapInstance.removeControl(draw.current);
              draw.current = null;
            }
            
            // Finally remove the map
            mapInstance.remove();
          }
        } catch (error) {
          console.error('Error during map cleanup:', error);
        }
        
        // Reset refs and state
        map.current = null;
        setMapLoaded(false);
      };

      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapLoaded(false);
    }
  }, [mapboxToken, onFeatureCreate]);

  return { mapContainer, map, draw, mapLoaded };
};