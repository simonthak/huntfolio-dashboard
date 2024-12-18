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
  const initialized = useRef(false);
  const { draw, initializeDraw } = useDrawControls();

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

      const drawInstance = initializeDraw();
      
      map.current = mapInstance;

      mapInstance.on('load', () => {
        console.log('Map loaded, adding controls');
        
        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        mapInstance.on('draw.create', (e: { features: Feature[] }) => {
          console.log('Draw feature created:', e.features[0]);
          if (e.features && e.features[0]) {
            const serializedFeature = JSON.parse(JSON.stringify(e.features[0]));
            onFeatureCreate(serializedFeature);
            drawInstance.deleteAll();
          }
        });

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