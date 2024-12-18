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

    const addLayers = () => {
      // Remove existing layers before adding new ones
      areas.forEach(area => {
        const source = `area-${area.id}`;
        const fillLayer = `area-fill-${area.id}`;
        const lineLayer = `area-line-${area.id}`;
        
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

      // Add new layers
      areas.forEach(area => {
        if (!area.boundary) {
          console.log('Skipping area without boundary:', area.id);
          return;
        }
        
        const source = `area-${area.id}`;
        console.log('Adding area to map:', { id: area.id, name: area.name });

        try {
          // Ensure the map style is loaded before adding sources and layers
          if (!map.current?.isStyleLoaded()) {
            console.log('Map style not loaded yet, waiting...');
            map.current?.once('style.load', () => {
              console.log('Style loaded, now adding area:', area.id);
              addAreaToMap(area, source);
            });
            return;
          }

          addAreaToMap(area, source);
        } catch (error) {
          console.error('Error adding area to map:', error);
        }
      });
    };

    const addAreaToMap = (area: DriveArea, source: string) => {
      if (!map.current) return;

      map.current.addSource(source, {
        type: 'geojson',
        data: area.boundary
      });

      map.current.addLayer({
        id: `area-fill-${area.id}`,
        type: 'fill',
        source: source,
        paint: {
          'fill-color': '#13B67F',
          'fill-opacity': 0.2
        }
      });

      map.current.addLayer({
        id: `area-line-${area.id}`,
        type: 'line',
        source: source,
        paint: {
          'line-color': '#13B67F',
          'line-width': 2
        }
      });
    };

    // Only add layers when style is loaded
    if (map.current.isStyleLoaded()) {
      console.log('Style already loaded, adding layers immediately');
      addLayers();
    } else {
      console.log('Waiting for style to load before adding layers');
      map.current.once('style.load', addLayers);
    }

    // Cleanup
    return () => {
      if (map.current) {
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
  }, [areas, mapLoaded]);

  // Display existing passes
  useEffect(() => {
    if (!map.current || !mapLoaded || !passes) return;

    const markers: mapboxgl.Marker[] = [];

    passes.forEach(pass => {
      if (!pass.location) return;
      
      const marker = new mapboxgl.Marker()
        .setLngLat((pass.location as any).coordinates)
        .addTo(map.current!);
      
      markers.push(marker);
    });

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [passes, mapLoaded]);
};