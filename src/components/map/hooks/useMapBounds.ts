import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Feature } from 'geojson';

interface UseMapBoundsProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  mapLoaded: boolean;
  areas: { boundary: Feature }[];
}

export const useMapBounds = ({ map, mapLoaded, areas }: UseMapBoundsProps) => {
  useEffect(() => {
    if (!map.current || !mapLoaded || areas.length === 0) return;

    console.log('Fitting map to areas:', areas.length);
    const bounds = new mapboxgl.LngLatBounds();
    
    areas.forEach(area => {
      if (area.boundary.geometry.type === 'Polygon') {
        const coordinates = area.boundary.geometry.coordinates[0];
        coordinates.forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });
      }
    });
    
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }, [map, mapLoaded, areas]);
};