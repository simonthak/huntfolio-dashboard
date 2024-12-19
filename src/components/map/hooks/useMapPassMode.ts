import { MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';

export const useMapPassMode = (
  map: MutableRefObject<mapboxgl.Map | null>,
  draw: MutableRefObject<MapboxDraw | null>,
  onFeatureCreate: (feature: Feature) => void
) => {
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    console.log('Map clicked for point placement:', e.lngLat);
    const feature: Feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat]
      },
      properties: {}
    };
    
    onFeatureCreate(JSON.parse(JSON.stringify(feature)));
    
    // Clean up and reset cursor
    if (map.current) {
      map.current.off('click', handleMapClick);
      map.current.getCanvas().style.cursor = 'grab';
    }
  };

  const enablePassMode = () => {
    if (!draw.current || !map.current) return;

    console.log('Enabling point placement mode');
    draw.current.changeMode('simple_select');
    map.current.getCanvas().style.cursor = 'crosshair';
    
    // Remove any existing click handlers before adding a new one
    map.current.off('click', handleMapClick);
    map.current.on('click', handleMapClick);
  };

  return { enablePassMode };
};