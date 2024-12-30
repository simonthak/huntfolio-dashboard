import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { DriveArea, HuntingPass } from '../types';

interface UseMapLayersProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
  areas?: DriveArea[];
  passes?: HuntingPass[];
}

export const useMapLayers = ({ 
  map, 
  mapLoaded, 
  areas, 
  passes 
}: UseMapLayersProps) => {
  // Cleanup function to remove all existing layers and sources
  const cleanup = () => {
    if (!map.current) return;
    
    console.log('Cleaning up map layers...');
    
    // Remove area layers and sources
    if (areas) {
      areas.forEach(area => {
        const fillLayer = `area-fill-${area.id}`;
        const lineLayer = `area-line-${area.id}`;
        const source = `area-${area.id}`;

        if (map.current?.getLayer(fillLayer)) {
          map.current.removeLayer(fillLayer);
        }
        if (map.current?.getLayer(lineLayer)) {
          map.current.removeLayer(lineLayer);
        }
        if (map.current?.getSource(source)) {
          map.current.removeSource(source);
        }
      });
    }
  };

  // Display existing areas
  useEffect(() => {
    if (!map.current || !mapLoaded || !areas) {
      console.log('Map layers not ready:', { 
        mapExists: !!map.current, 
        mapLoaded, 
        areasExist: !!areas 
      });
      return;
    }

    console.log('Adding area layers to map:', areas.length);

    // Clean up existing layers before adding new ones
    cleanup();

    // Add new layers
    areas.forEach(area => {
      if (!area.boundary) {
        console.log('Skipping area without boundary:', area.id);
        return;
      }
      
      const source = `area-${area.id}`;
      console.log('Adding area to map:', { id: area.id, name: area.name });

      try {
        map.current?.addSource(source, {
          type: 'geojson',
          data: area.boundary
        });

        map.current?.addLayer({
          id: `area-fill-${area.id}`,
          type: 'fill',
          source: source,
          paint: {
            'fill-color': '#13B67F',
            'fill-opacity': 0.2
          }
        });

        map.current?.addLayer({
          id: `area-line-${area.id}`,
          type: 'line',
          source: source,
          paint: {
            'line-color': '#13B67F',
            'line-width': 2
          }
        });
      } catch (error) {
        console.error('Error adding area to map:', error);
      }
    });

    return cleanup;
  }, [areas, mapLoaded]);

  // Display existing passes
  useEffect(() => {
    if (!map.current || !mapLoaded || !passes) return;

    console.log('Adding pass markers to map:', passes.length);
    const markers: mapboxgl.Marker[] = [];

    passes.forEach(pass => {
      if (!pass.location) {
        console.log('Skipping pass without location:', pass.id);
        return;
      }
      
      try {
        const marker = new mapboxgl.Marker()
          .setLngLat((pass.location as any).coordinates)
          .addTo(map.current!);
        
        markers.push(marker);
      } catch (error) {
        console.error('Error adding pass marker:', error);
      }
    });

    // Cleanup markers when component unmounts or passes change
    return () => {
      console.log('Cleaning up pass markers...');
      markers.forEach(marker => marker.remove());
    };
  }, [passes, mapLoaded]);
};