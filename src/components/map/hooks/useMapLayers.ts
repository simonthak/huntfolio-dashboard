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
    if (!map.current || !mapLoaded || !areas) return;

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
      if (!area.boundary) return;
      
      const source = `area-${area.id}`;
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
    });
  }, [areas, mapLoaded]);

  // Display existing passes
  useEffect(() => {
    if (!map.current || !mapLoaded || !passes) return;

    passes.forEach(pass => {
      if (!pass.location) return;
      
      new mapboxgl.Marker()
        .setLngLat((pass.location as any).coordinates)
        .addTo(map.current!);
    });
  }, [passes, mapLoaded]);
};